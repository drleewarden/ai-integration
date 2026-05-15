/**
 * POST /api/readiness/email-playbook
 *
 * Captures the prospect's email after they've seen their result. This is the
 * first lead-conversion step — turning an anonymous assessment into a named
 * contact + new_lead opportunity in the CRM.
 *
 * Flow:
 *   1. Validate the assessment id + email
 *   2. Upsert the contact (one row per unique email)
 *   3. Link the contact to the assessment
 *   4. Create a new_lead opportunity (or reuse existing if reading email again)
 *   5. Link opportunity to the assessment
 *   6. Log activities (assessment_completed, contact_created, playbook_requested)
 *   7. [TODO: Batch 4] Generate the PDF playbook, upload to Supabase Storage,
 *      record a documents row, mark playbook_sent_at, send Resend email.
 *
 * For now we ack the request and stamp playbook_generated_at = now() as a
 * placeholder. The PDF generation + email send are stubs that fire on
 * playbook_sent_at being NULL — a background job (or the next API call after
 * Batch 4 lands) will pick these up and complete them.
 *
 * Request body:
 *   {
 *     resultId: "uuid",
 *     email: "you@yourbusiness.com.au",
 *     firstName?: "Jane"       // optional, but improves the personalised PDF
 *   }
 *
 * Response:
 *   200 { ok: true, message: "..." }
 *   400 { error: "..." }
 *   404 { error: "Result not found" }
 *   500 { error: "..." }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { bandByKey } from '@/lib/readiness/bands';
import type { BandKey } from '@/lib/readiness/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// RFC-5322-ish "good enough" email regex — server-side defence; real validity
// is proven by deliverability.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_BODY_BYTES = 2 * 1024;
const MAX_NAME_LEN = 80;
const MAX_EMAIL_LEN = 254;

class ClientError extends Error {}

function clientError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface CapturePayload {
  resultId: string;
  email: string;
  firstName?: string;
}

function parseAndValidate(body: unknown): CapturePayload {
  if (typeof body !== 'object' || body === null) {
    throw new ClientError('Body must be a JSON object');
  }
  const b = body as Record<string, unknown>;

  if (typeof b.resultId !== 'string' || !UUID_RE.test(b.resultId)) {
    throw new ClientError('Invalid resultId');
  }
  if (typeof b.email !== 'string') {
    throw new ClientError('email is required');
  }
  const email = b.email.trim().toLowerCase();
  if (email.length === 0 || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    throw new ClientError('Invalid email');
  }

  let firstName: string | undefined;
  if (b.firstName !== undefined) {
    if (typeof b.firstName !== 'string') {
      throw new ClientError('firstName must be a string');
    }
    firstName = b.firstName.trim().slice(0, MAX_NAME_LEN);
    if (firstName.length === 0) firstName = undefined;
  }

  return { resultId: b.resultId, email, firstName };
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return clientError('Body too large', 413);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return clientError('Invalid JSON');
  }

  let payload: CapturePayload;
  try {
    payload = parseAndValidate(raw);
  } catch (err) {
    if (err instanceof ClientError) return clientError(err.message);
    throw err;
  }

  const supabase = getServiceSupabase();

  // 1. Verify the assessment exists and is not deleted
  const { data: assessment, error: aErr } = await supabase
    .from('readiness_assessments')
    .select(
      'id, overall_score, band, contact_id, opportunity_id, deleted_at'
    )
    .eq('id', payload.resultId)
    .maybeSingle();

  if (aErr) {
    console.error('[email-playbook] assessment lookup failed:', aErr);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!assessment || assessment.deleted_at) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  // 2. Upsert contact by email. If a contact with this email already exists
  //    (returning prospect), we update their first_name if provided and don't
  //    clobber other fields.
  const { data: existingContact, error: cLookupErr } = await supabase
    .from('contacts')
    .select('id, first_name')
    .eq('email', payload.email)
    .maybeSingle();

  if (cLookupErr) {
    console.error('[email-playbook] contact lookup failed:', cLookupErr);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  let contactId: string;
  let isNewContact = false;

  if (existingContact) {
    contactId = existingContact.id;
    // Update first_name only if we have one and they don't
    if (payload.firstName && !existingContact.first_name) {
      await supabase
        .from('contacts')
        .update({ first_name: payload.firstName })
        .eq('id', contactId);
    }
  } else {
    const { data: newContact, error: cInsertErr } = await supabase
      .from('contacts')
      .insert({
        email: payload.email,
        first_name: payload.firstName ?? null,
        source: 'ai_readiness',
      })
      .select('id')
      .single();
    if (cInsertErr || !newContact) {
      console.error('[email-playbook] contact insert failed:', cInsertErr);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
    contactId = newContact.id;
    isNewContact = true;
  }

  // 3. Create or reuse an opportunity for this contact + assessment.
  //    If the assessment already has an opportunity_id (someone hit this
  //    endpoint twice), we skip the create.
  let opportunityId: string | null = assessment.opportunity_id;

  if (!opportunityId) {
    const band = bandByKey(assessment.band as BandKey);
    // Title convention: "Lead — {Band} ({Score}/100)" when we don't yet know
    // the company name. Once the contact form fills in company, we can
    // optionally rewrite this title — for now keep it simple and stable.
    const title = `Lead — ${band.label} (${assessment.overall_score}/100)`;

    const { data: newOpp, error: oInsertErr } = await supabase
      .from('opportunities')
      .insert({
        contact_id: contactId,
        title,
        source: 'ai_readiness',
        stage: 'new_lead',
        readiness_score: assessment.overall_score,
        readiness_band: assessment.band,
      })
      .select('id')
      .single();

    if (oInsertErr || !newOpp) {
      console.error('[email-playbook] opportunity insert failed:', oInsertErr);
      return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
    }
    opportunityId = newOpp.id;
  }

  // 4. Link assessment → contact + opportunity, mark playbook as ready to send
  const { error: uErr } = await supabase
    .from('readiness_assessments')
    .update({
      contact_id: contactId,
      opportunity_id: opportunityId,
      // Placeholder timestamps. Real values get set by the PDF generation
      // job in Batch 4 once the React-PDF template is wired up.
      playbook_generated_at: new Date().toISOString(),
      // playbook_sent_at intentionally left NULL — set by the email-send job
      // playbook_storage_path  intentionally left NULL — set by the PDF job
    })
    .eq('id', payload.resultId);

  if (uErr) {
    console.error('[email-playbook] assessment update failed:', uErr);
    // We've already created the contact/opportunity; the lead is captured
    // even if linking failed. Return 200 with a warning rather than failing.
    return NextResponse.json({
      ok: true,
      warning: 'Lead captured but assessment link failed',
    });
  }

  // 5. Log activities — fire-and-forget
  const activityRows: Array<Record<string, unknown>> = [
    {
      contact_id: contactId,
      opportunity_id: opportunityId,
      assessment_id: payload.resultId,
      type: 'playbook_requested',
      description: `${payload.email} requested their AI Readiness playbook.`,
      metadata: { email: payload.email, first_name: payload.firstName ?? null },
    },
  ];
  if (isNewContact) {
    activityRows.push({
      contact_id: contactId,
      opportunity_id: opportunityId,
      assessment_id: payload.resultId,
      type: 'contact_created',
      description: `New contact created from AI Readiness funnel.`,
      metadata: { source: 'ai_readiness' },
    });
  }

  void supabase
    .from('activities')
    .insert(activityRows)
    .then(({ error: actErr }) => {
      if (actErr) console.error('[email-playbook] activity log failed:', actErr);
    });

  return NextResponse.json({
    ok: true,
    message:
      "We'll send your playbook through in the next few minutes. Check your inbox — and your spam folder, just in case.",
  });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
