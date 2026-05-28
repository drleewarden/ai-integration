/**
 * POST /api/readiness/email-playbook
 *
 * Captures the prospect's email after they've seen their result. This is the
 * first lead-conversion step -- turning an anonymous assessment into a named
 * contact + New Lead opportunity in the CRM -- AND it sends them their
 * playbook email via Resend with the PDF playbook attached.
 *
 * Flow:
 *   1.  Validate the assessment id + email
 *   2.  Upsert the contact (one row per unique email)
 *   3.  Link the contact to the assessment
 *   4.  Create a New Lead opportunity (or reuse existing if reading email again)
 *   5.  Link opportunity to the assessment
 *   6.  Generate the PDF playbook from the assessment result
 *   7.  Upload the PDF to Supabase Storage (playbooks bucket)
 *   8.  Record a documents row for the PDF
 *   9.  Send the playbook email + PDF attachment to the requester via Resend
 *  10.  Send an internal lead-alert to RESEND_TO
 *  11.  Log activities
 *
 * Failure handling: the lead is canonical. PDF/storage/email failures surface
 * as warnings -- the lead is never lost because of a delivery hiccup.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase/server";
import { bandByKey } from "@/lib/readiness/bands";
import type { BandKey, PillarKey } from "@/lib/readiness/types";
import type { AssessmentResult } from "@/lib/readiness/types";
import { composePlaybook } from "@/lib/readiness/composer";
import { renderPlaybookToBuffer } from "@/lib/readiness/playbook-pdf";
import {
  renderPlaybookEmailHtml,
  renderPlaybookEmailSubject,
  renderPlaybookEmailText,
} from "@/lib/readiness/emails/playbook-email";
import {
  renderLeadAlertHtml,
  renderLeadAlertSubject,
  renderLeadAlertText,
} from "@/lib/readiness/emails/lead-alert-email";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
  if (typeof body !== "object" || body === null)
    throw new ClientError("Body must be a JSON object");
  const b = body as Record<string, unknown>;
  if (typeof b.resultId !== "string" || !UUID_RE.test(b.resultId))
    throw new ClientError("Invalid resultId");
  if (typeof b.email !== "string") throw new ClientError("email is required");
  const email = b.email.trim().toLowerCase();
  if (email.length === 0 || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email))
    throw new ClientError("Invalid email");
  let firstName: string | undefined;
  if (b.firstName !== undefined) {
    if (typeof b.firstName !== "string")
      throw new ClientError("firstName must be a string");
    firstName = b.firstName.trim().slice(0, MAX_NAME_LEN) || undefined;
  }
  return { resultId: b.resultId, email, firstName };
}

export async function POST(req: NextRequest) {
  if (Number(req.headers.get("content-length") ?? "0") > MAX_BODY_BYTES)
    return clientError("Body too large", 413);

  let raw: unknown;
  try { raw = await req.json(); }
  catch { return clientError("Invalid JSON"); }

  let payload: CapturePayload;
  try { payload = parseAndValidate(raw); }
  catch (err) {
    if (err instanceof ClientError) return clientError(err.message);
    throw err;
  }

  const supabase = getServiceSupabase();

  // 1. Fetch assessment -- pull all fields needed to rebuild AssessmentResult
  const { data: assessment, error: aErr } = await supabase
    .from("readiness_assessments")
    .select(
      "id, overall_score, band, pillar_scores, pillar_tiers, focus_areas, weakness_patterns, strongest_pillar, contact_id, opportunity_id, deleted_at"
    )
    .eq("id", payload.resultId)
    .maybeSingle();

  if (aErr) {
    console.error("[email-playbook] assessment lookup failed:", aErr);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!assessment || assessment.deleted_at)
    return NextResponse.json({ error: "Result not found" }, { status: 404 });

  // 2. Upsert contact
  const { data: existingContact, error: cLookupErr } = await supabase
    .from("contacts")
    .select("id, first_name")
    .eq("email", payload.email)
    .maybeSingle();

  if (cLookupErr) {
    console.error("[email-playbook] contact lookup failed:", cLookupErr);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  let contactId: string;
  let isNewContact = false;

  if (existingContact) {
    contactId = existingContact.id;
    if (payload.firstName && !existingContact.first_name)
      await supabase
        .from("contacts")
        .update({ first_name: payload.firstName })
        .eq("id", contactId);
  } else {
    const { data: newContact, error: cInsertErr } = await supabase
      .from("contacts")
      .insert({ email: payload.email, first_name: payload.firstName ?? null, source: "ai_readiness" })
      .select("id")
      .single();
    if (cInsertErr || !newContact) {
      console.error("[email-playbook] contact insert failed:", cInsertErr);
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }
    contactId = newContact.id;
    isNewContact = true;
  }

  // 3. Create or reuse opportunity
  let opportunityId: string | null = assessment.opportunity_id;
  if (!opportunityId) {
    const band = bandByKey(assessment.band as BandKey);
    const { data: newOpp, error: oInsertErr } = await supabase
      .from("opportunities")
      .insert({
        contact_id: contactId,
        title: `Lead -- ${band.label} (${assessment.overall_score}/100)`,
        source: "ai_readiness",
        stage: "New Lead",
        readiness_score: assessment.overall_score,
        readiness_band: assessment.band,
      })
      .select("id")
      .single();
    if (oInsertErr || !newOpp) {
      console.error("[email-playbook] opportunity insert failed:", oInsertErr);
      return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
    }
    opportunityId = newOpp.id;
  }

  // 4. Link assessment -> contact + opportunity
  const generatedAt = new Date();
  const { error: uErr } = await supabase
    .from("readiness_assessments")
    .update({ contact_id: contactId, opportunity_id: opportunityId, playbook_generated_at: generatedAt.toISOString() })
    .eq("id", payload.resultId);

  if (uErr) {
    console.error("[email-playbook] assessment update failed:", uErr);
    return NextResponse.json({ ok: true, warning: "Lead captured but assessment link failed" });
  }

  // 5. Generate PDF
  const resultUrl = buildResultUrl(req, payload.resultId);
  let pdfBuffer: Buffer | null = null;
  let storagePath: string | null = null;

  try {
    const assessmentResult: AssessmentResult = {
      overallScore: assessment.overall_score,
      band: bandByKey(assessment.band as BandKey),
      pillarScores: assessment.pillar_scores as AssessmentResult["pillarScores"],
      pillarTiers: assessment.pillar_tiers as AssessmentResult["pillarTiers"],
      focusAreas: assessment.focus_areas as PillarKey[],
      strongestPillar: assessment.strongest_pillar as PillarKey,
      weaknessPatterns: assessment.weakness_patterns as AssessmentResult["weaknessPatterns"],
    };
    const composition = composePlaybook(assessmentResult, {
      assessmentId: payload.resultId,
      readerName: payload.firstName,
      resultUrl,
      generatedAt,
    });
    pdfBuffer = await renderPlaybookToBuffer(composition);
  } catch (pdfErr) {
    console.error("[email-playbook] PDF generation failed:", pdfErr);
    // Soft failure -- email still sends without attachment
  }

  // 6. Upload PDF to Supabase Storage
  if (pdfBuffer) {
    try {
      const filename = `${payload.resultId}.pdf`;
      const { error: storageErr } = await supabase.storage
        .from("playbooks")
        .upload(filename, pdfBuffer, { contentType: "application/pdf", upsert: true });

      if (storageErr) {
        console.error("[email-playbook] storage upload failed:", storageErr);
      } else {
        storagePath = filename;
        void supabase.from("documents").insert({
          contact_id: contactId,
          assessment_id: payload.resultId,
          opportunity_id: opportunityId,
          type: "playbook",
          file_path: storagePath,
          file_type: "application/pdf",
        }).then(({ error: docErr }) => {
          if (docErr) console.error("[email-playbook] documents insert failed:", docErr);
        });
        void supabase.from("readiness_assessments")
          .update({ playbook_storage_path: storagePath })
          .eq("id", payload.resultId)
          .then(({ error: pathErr }) => {
            if (pathErr) console.error("[email-playbook] storage path update failed:", pathErr);
          });
      }
    } catch (storageErr) {
      console.error("[email-playbook] storage threw:", storageErr);
    }
  }

  // 7. Send emails
  const band = bandByKey(assessment.band as BandKey);
  const sendOutcome = await sendPlaybookEmails({
    requesterEmail: payload.email,
    firstName: payload.firstName,
    resultUrl,
    overallScore: assessment.overall_score,
    band: { label: band.label, description: band.description },
    pillarScores: assessment.pillar_scores as Record<PillarKey, number>,
    focusAreas: assessment.focus_areas as PillarKey[],
    isNewContact,
    pdfBuffer: pdfBuffer ?? undefined,
  });

  if (sendOutcome.sentAt) {
    void supabase.from("readiness_assessments")
      .update({ playbook_sent_at: sendOutcome.sentAt })
      .eq("id", payload.resultId)
      .then(({ error: sErr }) => {
        if (sErr) console.error("[email-playbook] sent_at update failed:", sErr);
      });
  }

  // 8. Log activities
  const activityRows: Array<Record<string, unknown>> = [{
    contact_id: contactId,
    opportunity_id: opportunityId,
    assessment_id: payload.resultId,
    type: "playbook_requested",
    description: `${payload.email} requested their AI Readiness playbook.`,
    metadata: { email: payload.email, first_name: payload.firstName ?? null, delivery: sendOutcome.kind, pdf_generated: pdfBuffer !== null, storage_path: storagePath },
  }];
  if (isNewContact) {
    activityRows.push({
      contact_id: contactId,
      opportunity_id: opportunityId,
      assessment_id: payload.resultId,
      type: "contact_created",
      description: "New contact created from AI Readiness funnel.",
      metadata: { source: "ai_readiness" },
    });
  }
  void supabase.from("activities").insert(activityRows).then(({ error: actErr }) => {
    if (actErr) console.error("[email-playbook] activity log failed:", actErr);
  });

  if (sendOutcome.kind === "sent") {
    return NextResponse.json({
      ok: true,
      message: "Your playbook is on its way. Check your inbox in the next few minutes -- and your spam folder, just in case.",
    });
  }
  return NextResponse.json({
    ok: true,
    warning: sendOutcome.warning,
    message: "We've captured your details. If the playbook doesn't land in your inbox shortly, email contact@creative-milk.com.au and we'll resend it.",
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildResultUrl(req: NextRequest, resultId: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const origin = configured ?? new URL(req.url).origin;
  return `${origin}/ai-readiness/result/${resultId}`;
}

type SendOutcome =
  | { kind: "sent"; sentAt: string }
  | { kind: "skipped"; warning: string; sentAt?: undefined }
  | { kind: "failed"; warning: string; sentAt?: undefined };

interface SendArgs {
  requesterEmail: string;
  firstName?: string;
  resultUrl: string;
  overallScore: number;
  band: { label: string; description: string };
  pillarScores: Record<PillarKey, number>;
  focusAreas: PillarKey[];
  isNewContact: boolean;
  pdfBuffer?: Buffer;
}

async function sendPlaybookEmails(args: SendArgs): Promise<SendOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email-playbook] RESEND_API_KEY not set -- skipping send");
    return { kind: "skipped", warning: "Email service not configured -- lead captured." };
  }

  const FROM = process.env.RESEND_FROM ?? "Creative Milk <onboarding@resend.dev>";
  const INTERNAL_TO = process.env.RESEND_TO ?? "contact@creative-milk.com.au";
  const resend = new Resend(apiKey);

  const playbookFields = {
    firstName: args.firstName,
    overallScore: args.overallScore,
    band: args.band,
    pillarScores: args.pillarScores,
    focusAreas: args.focusAreas,
    resultUrl: args.resultUrl,
  };

  const attachments = args.pdfBuffer
    ? [{ filename: "Creative-Milk-AI-Readiness-Playbook.pdf", content: args.pdfBuffer }]
    : [];

  try {
    const sendResult = await resend.emails.send({
      from: FROM,
      to: args.requesterEmail,
      subject: renderPlaybookEmailSubject(playbookFields),
      html: renderPlaybookEmailHtml(playbookFields),
      text: renderPlaybookEmailText(playbookFields),
      ...(attachments.length > 0 && { attachments }),
    });
    if (sendResult.error) {
      console.error("[email-playbook] requester send failed:", sendResult.error);
      return { kind: "failed", warning: "Lead captured but playbook email could not be sent." };
    }
  } catch (err) {
    console.error("[email-playbook] requester send threw:", err);
    return { kind: "failed", warning: "Lead captured but playbook email could not be sent." };
  }

  const sentAt = new Date().toISOString();

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
    if (alertResult.error)
      console.error("[email-playbook] internal alert failed:", alertResult.error);
  } catch (err) {
    console.error("[email-playbook] internal alert threw:", err);
  }

  return { kind: "sent", sentAt };
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
