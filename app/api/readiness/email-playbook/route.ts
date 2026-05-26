/**
 * POST /api/readiness/email-playbook
 *
 * Captures the prospect's email after they've seen their result. This is the
 * first lead-conversion step -- turning an anonymous assessment into a named
 * contact + new_lead opportunity in the CRM -- AND it sends them their
 * playbook email via Resend.
 *
 * Flow:
 *   1. Validate the assessment id + email
 *   2. Upsert the contact (one row per unique email)
 *   3. Link the contact to the assessment
 *   4. Create a new_lead opportunity (or reuse existing if reading email again)
 *   5. Link opportunity to the assessment
 *   6. Send the playbook email to the requester via Resend
 *   7. Send an internal lead-alert to RESEND_TO
 *   8. Log activities (assessment_completed, contact_created, playbook_requested)
 *
 * Failure handling: the lead is the canonical artefact. If Resend fails or
 * is unconfigured, we still persist the lead and return 200 with a `warning`
 * field so the result page UI can surface a sensible message. We never lose
 * the lead because the email send hiccuped.
 *
 * Future work: generate a PDF playbook and attach it to the requester email
 * (separate from this fix -- the email body is rich enough to stand alone
 * for v1). When that lands, upload the PDF to Supabase Storage, record a
 * documents row, and reference `playbook_storage_path` on the assessment.
 *
 * Request body:
 *   {
 *     resultId: "uuid",
 *     email: "you@yourbusiness.com.au",
 *     firstName?: "Jane"       // optional, but personalises the email
 *   }
 *
 * Response:
 *   200 { ok: true, message: "...", warning?: "..." }
 *   400 { error: "..." }
 *   404 { error: "Result not found" }
 *   500 { error: "..." }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase/server';
import { bandByKey } from '@/lib/readiness/bands';
import type { BandKey, PillarKey } from '@/lib/readiness/types';
import {
  renderPlaybookEmailHtml,
  renderPlaybookEmailSubject,
  renderPlaybookEmailText,
} from '@/lib/readiness/emails/playbook-email';
import {
  renderLeadAlertHtml,
  renderLeadAlertSubject,
  renderLeadAlertText,
} from '@/lib/readiness/emails/lead-alert-email';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// RFC-5322-ish "good enough" email regex -- server-side defence; real validity
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

  // 1. Verify the assessment exists and is not deleted. We pull the pillar
  //    scores + focus areas now too so we can render the email without a
  //    second round-trip.
  const { data: assessment, error: aErr } = await supabase
    .from('readiness_assessments')
    .select(
      'id, overall_score, band, pillar_scores, focus_areas, contact_id, opportunity_id, deleted_at'
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
    // Title convention: "Lead -- {Band} ({Score}/100)" when we don't yet know
    // the company name. Once the contact form fills in company, we can
    // optionally rewrite this title -- for now keep it simple and stable.
    const title = `Lead -- ${band.label} (${assessment.overall_score}/100)`;

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

  // 4. Link assessment → contact + opportunity, stamp generated_at
  const generatedAt = new Date().toISOString();
  const { error: uErr } = await supabase
    .from('readiness_assessments')
    .update({
      contact_id: contactId,
      opportunity_id: opportunityId,
      playbook_generated_at: generatedAt,
      // playbook_sent_at gets set below once Resend confirms acceptance.
      // playbook_storage_path stays NULL -- PDF attachment is a follow-up.
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

  // 5. Send the playbook email to the requester + internal lead alert.
  //    Failures here don't block the lead capture -- we surface a warning.
  const band = bandByKey(assessment.band as BandKey);
  const resultUrl = buildResultUrl(req, payload.resultId);
  const sendOutcome = await sendPlaybookEmails({
    requesterEmail: payload.email,
    firstName: payload.firstName,
    resultUrl,
    overallScore: assessment.overall_score,
    band: { label: band.label, description: band.description },
    pillarScores: assessment.pillar_scores as Record<PillarKey, number>,
    focusAreas: assessment.focus_areas as PillarKey[],
    isNewContact,
  });

  if (sendOutcome.sentAt) {
    // Best-effort -- log the failure but don't fail the request if the
    // sent_at stamp can't be written.
    void supabase
      .from('readiness_assessments')
      .update({ playbook_sent_at: sendOutcome.sentAt })
      .eq('id', payload.resultId)
      .then(({ error: sErr }) => {
        if (sErr) {
          console.error('[email-playbook] sent_at update failed:', sErr);
        }
      });
  }

  // 6. Log activities -- fire-and-forget
  const activityRows: Array<Record<string, unknown>> = [
    {
      contact_id: contactId,
      opportunity_id: opportunityId,
      assessment_id: payload.resultId,
      type: 'playbook_requested',
      description: `${payload.email} requested their AI Readiness playbook.`,
      metadata: {
        email: payload.email,
        first_name: payload.firstName ?? null,
        delivery: sendOutcome.kind,
      },
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

  // Respond. Success message matches the result page UX ("Sent. Check your
  // inbox in a few minutes"). On partial failure (lead captured, email
  // didn't go) we still return 200 but include a warning so the client can
  // surface something honest if it chooses to.
  if (sendOutcome.kind === 'sent') {
    return NextResponse.json({
      ok: true,
      message:
        "Your playbook is on its way. Check your inbox in the next few minutes -- and your spam folder, just in case.",
    });
  }

  return NextResponse.json({
    ok: true,
    warning: sendOutcome.warning,
    message:
      "We've captured your details. If the playbook doesn't land in your inbox shortly, email hello@creative-milk.com.au and we'll resend it.",
  });
}

// ── Email-send helpers ──────────────────────────────────────────────────────

/**
 * Resolve the canonical result URL for this assessment. Prefers an explicit
 * NEXT_PUBLIC_SITE_URL (set in production); falls back to the current
 * request's origin so this works in local dev and preview deploys without
 * extra config.
 */
function buildResultUrl(req: NextRequest, resultId: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  const origin = configured ?? new URL(req.url).origin;
  return `${origin}/ai-readiness/result/${resultId}`;
}

type SendOutcome =
  | { kind: 'sent'; sentAt: string }
  | { kind: 'skipped'; warning: string; sentAt?: undefined }
  | { kind: 'failed'; warning: string; sentAt?: undefined };

interface SendArgs {
  requesterEmail: string;
  firstName?: string;
  resultUrl: string;
  overallScore: number;
  band: { label: string; description: string };
  pillarScores: Record<PillarKey, number>;
  focusAreas: PillarKey[];
  isNewContact: boolean;
}

/**
 * Send the requester's playbook email + the internal lead-alert via Resend.
 *
 * If RESEND_API_KEY is not set we treat that as a soft-skip (logged, lead
 * still captured). The result page UI surfaces a sensible "we've got your
 * details" fallback message in that case.
 *
 * The two sends run sequentially -- the requester email is the contract we
 * just made on the page; the internal alert is best-effort. A failure on the
 * internal alert never affects the user-facing outcome.
 */
async function sendPlaybookEmails(args: SendArgs): Promise<SendOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      '[email-playbook] RESEND_API_KEY not set -- skipping email send'
    );
    return {
      kind: 'skipped',
      warning: 'Email service not configured -- lead captured.',
    };
  }

  const FROM =
    process.env.RESEND_FROM ?? 'Creative Milk <onboarding@resend.dev>';
  const INTERNAL_TO = process.env.RESEND_TO ?? 'drleewarden@gmail.com';

  const resend = new Resend(apiKey);

  const playbookFields = {
    firstName: args.firstName,
    overallScore: args.overallScore,
    band: args.band,
    pillarScores: args.pillarScores,
    focusAreas: args.focusAreas,
    resultUrl: args.resultUrl,
  };

  try {
    const sendResult = await resend.emails.send({
      from: FROM,
      to: args.requesterEmail,
      subject: renderPlaybookEmailSubject(playbookFields),
      html: renderPlaybookEmailHtml(playbookFields),
      text: renderPlaybookEmailText(playbookFields),
    });

    // Resend v6 returns { data, error } -- check both.
    if (sendResult.error) {
      console.error(
        '[email-playbook] requester send failed:',
        sendResult.error
      );
      return {
        kind: 'failed',
        warning: 'Lead captured but playbook email could not be sent.',
      };
    }
  } catch (err) {
    console.error('[email-playbook] requester send threw:', err);
    return {
      kind: 'failed',
      warning: 'Lead captured but playbook email could not be sent.',
    };
  }

  const sentAt = new Date().toISOString();

  // Internal lead alert -- best-effort, must not affect the user response.
  const alertFields = {
    email: args.requesterEmail,
    firstName: args.firstName,
    overallScore: args.overallScore,
    bandLabel: args.band.label,
    focusAreas: args.focusAreas,
    resultUrl: args.resultUrl,
    isNewContact: args.isNewContact,
  };

  try {
    const alertResult = await resend.emails.send({
      from: FROM,
      to: INTERNAL_TO,
      replyTo: args.requesterEmail,
      subject: renderLeadAlertSubject(alertFields),
      html: renderLeadAlertHtml(alertFields),
      text: renderLeadAlertText(alertFields),
    });
    if (alertResult.error) {
      console.error(
        '[email-playbook] internal alert send failed:',
        alertResult.error
      );
    }
  } catch (err) {
    console.error('[email-playbook] internal alert threw:', err);
  }

  return { kind: 'sent', sentAt };
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
