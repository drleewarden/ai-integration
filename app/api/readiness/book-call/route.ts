/**
 * POST /api/readiness/book-call
 *
 * Captures the qualifying info from the Book a Call form. This is the second
 * conversion step -- moving the opportunity from New Lead → Qualified.
 *
 * Flow:
 *   1. Validate inputs
 *   2. Verify the assessment exists
 *   3. Upsert/enrich the contact (phone, company, suburb, size, role, last name)
 *   4. Ensure an opportunity exists (creating contact + opportunity if needed
 *      -- handles the edge case where a reader skipped the playbook step)
 *   5. Update the opportunity: stage → Qualified, problem_summary set
 *   6. Log activities (contact_form_submitted, stage_changed)
 *
 * Request body:
 *   {
 *     resultId: "uuid",
 *     firstName: "Jane",
 *     lastName: "Smith",
 *     email: "jane@acme.com.au",
 *     phone: "+61 400 000 000",
 *     company: "Acme Plumbing",
 *     companySize: "1-10" | "11-50" | "51-200" | "200+",
 *     role: "founder" | "exec" | "ops" | "marketing" | "other",
 *     suburb: "Brunswick VIC",
 *     problem: "We're drowning in admin..."
 *   }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { bandByKey } from '@/lib/readiness/bands';
import type { BandKey } from '@/lib/readiness/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_SIZES = ['1-10', '11-50', '51-200', '200+'] as const;
const ALLOWED_ROLES = ['founder', 'exec', 'ops', 'marketing', 'other'] as const;

class ClientError extends Error {}

function clientError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface BookCallPayload {
  resultId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  companySize: (typeof ALLOWED_SIZES)[number];
  role: (typeof ALLOWED_ROLES)[number];
  suburb: string;
  problem: string;
}

function requireString(v: unknown, name: string, max: number): string {
  if (typeof v !== 'string') throw new ClientError(`${name} is required`);
  const trimmed = v.trim();
  if (trimmed.length === 0) throw new ClientError(`${name} is required`);
  if (trimmed.length > max) throw new ClientError(`${name} too long`);
  return trimmed;
}

function parseAndValidate(body: unknown): BookCallPayload {
  if (typeof body !== 'object' || body === null) {
    throw new ClientError('Body must be a JSON object');
  }
  const b = body as Record<string, unknown>;

  if (typeof b.resultId !== 'string' || !UUID_RE.test(b.resultId)) {
    throw new ClientError('Invalid resultId');
  }

  const firstName = requireString(b.firstName, 'First name', 80);
  const lastName  = requireString(b.lastName,  'Last name',  80);
  const email     = requireString(b.email,     'Email',      254).toLowerCase();
  if (!EMAIL_RE.test(email)) throw new ClientError('Invalid email');

  const phone   = requireString(b.phone,   'Phone',   40);
  const company = requireString(b.company, 'Company', 120);
  const suburb  = requireString(b.suburb,  'Suburb',  120);
  const problem = requireString(b.problem, 'Problem', 2000);

  const companySize = b.companySize;
  if (typeof companySize !== 'string' || !ALLOWED_SIZES.includes(companySize as never)) {
    throw new ClientError('Invalid companySize');
  }
  const role = b.role;
  if (typeof role !== 'string' || !ALLOWED_ROLES.includes(role as never)) {
    throw new ClientError('Invalid role');
  }

  return {
    resultId: b.resultId,
    firstName,
    lastName,
    email,
    phone,
    company,
    companySize: companySize as BookCallPayload['companySize'],
    role: role as BookCallPayload['role'],
    suburb,
    problem,
  };
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) return clientError('Body too large', 413);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return clientError('Invalid JSON');
  }

  let payload: BookCallPayload;
  try {
    payload = parseAndValidate(raw);
  } catch (err) {
    if (err instanceof ClientError) return clientError(err.message);
    throw err;
  }

  const supabase = getServiceSupabase();

  // 1. Verify the assessment
  const { data: assessment, error: aErr } = await supabase
    .from('readiness_assessments')
    .select(
      'id, overall_score, band, contact_id, opportunity_id, deleted_at'
    )
    .eq('id', payload.resultId)
    .maybeSingle();

  if (aErr) {
    console.error('[book-call] assessment lookup failed:', aErr);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!assessment || assessment.deleted_at) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  // 2. Upsert contact. Three cases:
  //    a. Assessment already has contact_id → enrich that contact (most common
  //       path: they did email-playbook first, then book-call)
  //    b. No contact_id but email matches an existing contact → use that one
  //    c. New contact → create
  let contactId: string | null = assessment.contact_id;

  if (!contactId) {
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', payload.email)
      .maybeSingle();
    if (existing) {
      contactId = existing.id;
    } else {
      const { data: created, error: cErr } = await supabase
        .from('contacts')
        .insert({ email: payload.email, source: 'ai_readiness' })
        .select('id')
        .single();
      if (cErr || !created) {
        console.error('[book-call] contact insert failed:', cErr);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
      }
      contactId = created.id;
    }
  }

  // 3. Enrich the contact with full details from the form
  const { error: enrichErr } = await supabase
    .from('contacts')
    .update({
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      company: payload.company,
      company_size: payload.companySize,
      role: payload.role,
      suburb: payload.suburb,
    })
    .eq('id', contactId);

  if (enrichErr) {
    console.error('[book-call] contact enrich failed:', enrichErr);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }

  // 4. Ensure an opportunity exists (handles the path where someone skipped
  //    email-playbook entirely and clicked Book a Call directly)
  let opportunityId: string | null = assessment.opportunity_id;
  if (!opportunityId) {
    const band = bandByKey(assessment.band as BandKey);
    const title = `${payload.company} -- ${band.label} (${assessment.overall_score}/100)`;
    const { data: newOpp, error: oErr } = await supabase
      .from('opportunities')
      .insert({
        contact_id: contactId,
        title,
        source: 'ai_readiness',
        stage: 'New Lead',
        readiness_score: assessment.overall_score,
        readiness_band: assessment.band,
      })
      .select('id')
      .single();
    if (oErr || !newOpp) {
      console.error('[book-call] opportunity insert failed:', oErr);
      return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
    }
    opportunityId = newOpp.id;
  } else {
    // Opportunity already exists -- refresh the title with the company name
    // we just learned (was previously "Lead -- Band (Score/100)").
    const band = bandByKey(assessment.band as BandKey);
    const title = `${payload.company} -- ${band.label} (${assessment.overall_score}/100)`;
    await supabase.from('opportunities').update({ title }).eq('id', opportunityId);
  }

  // 5. Move the opportunity to Qualified + record problem_summary
  const { error: stageErr } = await supabase
    .from('opportunities')
    .update({
      stage: 'Qualified',
      stage_changed_at: new Date().toISOString(),
      problem_summary: payload.problem,
    })
    .eq('id', opportunityId);

  if (stageErr) {
    console.error('[book-call] stage update failed:', stageErr);
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
  }

  // 6. Link the assessment if not already linked
  if (!assessment.contact_id || !assessment.opportunity_id) {
    await supabase
      .from('readiness_assessments')
      .update({ contact_id: contactId, opportunity_id: opportunityId })
      .eq('id', payload.resultId);
  }

  // 7. Log activities (fire-and-forget)
  void supabase
    .from('activities')
    .insert([
      {
        contact_id: contactId,
        opportunity_id: opportunityId,
        assessment_id: payload.resultId,
        type: 'contact_form_submitted',
        description: `${payload.firstName} ${payload.lastName} submitted the Book a Call form.`,
        metadata: {
          company: payload.company,
          role: payload.role,
          company_size: payload.companySize,
          suburb: payload.suburb,
        },
      },
      {
        contact_id: contactId,
        opportunity_id: opportunityId,
        assessment_id: payload.resultId,
        type: 'stage_changed',
        description: `Stage changed: New Lead → Qualified`,
        metadata: { from: 'New Lead', to: 'Qualified' },
      },
    ])
    .then(({ error: actErr }) => {
      if (actErr) console.error('[book-call] activity log failed:', actErr);
    });

  return NextResponse.json({
    ok: true,
    message: "Thanks. We'll be in touch within one business day to schedule a time.",
  });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
