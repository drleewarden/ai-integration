/**
 * Internal lead-alert email -- fired to RESEND_TO whenever a reader requests
 * their AI Readiness playbook. Gives the Creative Milk team an instant signal
 * that a new lead is in pipeline, with enough context to triage quickly
 * (score, band, focus areas, link to the assessment in the admin UI / DB).
 *
 * Kept deliberately spare: the source of truth is Supabase / the CRM. This
 * email is just a nudge.
 */

import { PILLARS } from '@/lib/readiness/pillars';
import type { PillarKey } from '@/lib/readiness/types';

const COLORS = {
  ink: '#0F1526',
  cream: '#F5F0E8',
  gold: '#C9A84C',
  creamMute: 'rgba(245,240,232,0.7)',
  creamSoft: 'rgba(245,240,232,0.45)',
  border: 'rgba(245,240,232,0.08)',
} as const;

export interface LeadAlertEmailFields {
  email: string;
  firstName?: string;
  overallScore: number;
  bandLabel: string;
  focusAreas: PillarKey[];
  resultUrl: string;
  isNewContact: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderLeadAlertSubject(fields: LeadAlertEmailFields): string {
  const tag = fields.isNewContact ? 'New lead' : 'Returning lead';
  return `${tag} -- ${fields.email} (${fields.overallScore}/100, ${fields.bandLabel})`;
}

export function renderLeadAlertText(fields: LeadAlertEmailFields): string {
  const name = fields.firstName ? ` (${fields.firstName})` : '';
  const focusLine = fields.focusAreas
    .map((p) => PILLARS[p].label)
    .join(' / ');
  return `${fields.isNewContact ? 'New' : 'Returning'} AI Readiness lead

${fields.email}${name}
Score: ${fields.overallScore}/100 -- ${fields.bandLabel}
Focus areas: ${focusLine}

Result: ${fields.resultUrl}
`;
}

export function renderLeadAlertHtml(fields: LeadAlertEmailFields): string {
  const safeEmail = escapeHtml(fields.email);
  const safeFirst = fields.firstName ? escapeHtml(fields.firstName) : '';
  const safeBand = escapeHtml(fields.bandLabel);
  const safeUrl = escapeHtml(fields.resultUrl);

  const focusList = fields.focusAreas
    .map(
      (p, i) =>
        `<li style="margin-bottom:6px;color:${COLORS.cream};font-size:14px;">${i + 1}. ${escapeHtml(PILLARS[p].label)}</li>`
    )
    .join('');

  const tag = fields.isNewContact ? 'New lead' : 'Returning lead';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${tag}</title></head>
<body style="margin:0;background:${COLORS.ink};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${COLORS.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.ink};padding:32px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${COLORS.ink};border:1px solid ${COLORS.border};">

        <tr><td style="padding:24px 32px;border-bottom:1px solid ${COLORS.border};">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.gold};margin-bottom:6px;">-- ${tag}</div>
          <div style="font-family:Georgia,serif;font-size:24px;color:${COLORS.cream};line-height:1.2;">
            AI Readiness playbook requested
          </div>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <div style="margin-bottom:18px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:4px;">Email</div>
            <div style="font-size:15px;"><a href="mailto:${safeEmail}" style="color:${COLORS.gold};text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);">${safeEmail}</a></div>
          </div>

          ${
            safeFirst
              ? `<div style="margin-bottom:18px;">
                   <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:4px;">First name</div>
                   <div style="font-size:15px;color:${COLORS.cream};">${safeFirst}</div>
                 </div>`
              : ''
          }

          <div style="margin-bottom:18px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:4px;">Score / band</div>
            <div style="font-size:15px;color:${COLORS.cream};">
              <strong style="color:${COLORS.gold};">${fields.overallScore}/100</strong> -- ${safeBand}
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:6px;">Focus areas</div>
            <ol style="margin:0;padding-left:18px;">
              ${focusList}
            </ol>
          </div>

          <a href="${safeUrl}" style="display:inline-block;padding:10px 18px;background:${COLORS.gold};color:${COLORS.ink};text-decoration:none;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
            View result
          </a>
        </td></tr>

        <tr><td style="padding:16px 32px;border-top:1px solid ${COLORS.border};font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:${COLORS.creamSoft};">
          Sent by the AI Readiness funnel
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
