/**
 * Playbook email -- sent to the reader after they request their AI Readiness
 * playbook on the result page.
 *
 * Pure function: takes the public result projection + a few personalisation
 * fields, returns the HTML body. No side effects, no I/O. Easy to snapshot
 * in tests, easy to render offline for QA.
 *
 * Visual language matches /api/send-email/route.ts so the brand reads the
 * same across all transactional mail: dark ink background, liquid-gold
 * accents, Courier eyebrows, Georgia display.
 *
 * Note: this is the "Phase 1" email -- score + insight + link back to the
 * result page. A future revision will attach a generated PDF playbook;
 * until then, the result URL is the canonical destination.
 */

import { PILLARS } from '@/lib/readiness/pillars';
import { PILLAR_KEYS } from '@/lib/readiness/types';
import type { PillarKey } from '@/lib/readiness/types';
import { getRecommendation } from '@/lib/readiness/recommendations';

// ── Palette (mirrors C in app/(site)/ai-readiness/_components/ui) ────────────
const COLORS = {
  ink: '#0F1526',
  cream: '#F5F0E8',
  gold: '#C9A84C',
  creamMute: 'rgba(245,240,232,0.7)',
  creamSoft: 'rgba(245,240,232,0.45)',
  border: 'rgba(245,240,232,0.08)',
  panel: 'rgba(245,240,232,0.04)',
} as const;

export interface PlaybookEmailFields {
  firstName?: string;
  overallScore: number;
  band: {
    label: string;
    description: string;
  };
  pillarScores: Record<PillarKey, number>;
  focusAreas: PillarKey[]; // already ordered lowest-first by the scoring engine
  resultUrl: string; // canonical link back to /ai-readiness/result/[id]
}

/**
 * Minimal HTML escape -- only what's needed for the values we interpolate.
 * Same approach as the contact-form email so the helpers stay symmetrical.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Plain-text fallback. Most modern clients render the HTML, but Resend
 * recommends always sending a text alt -- improves deliverability and gives
 * accessibility-aware readers something clean.
 */
export function renderPlaybookEmailText(fields: PlaybookEmailFields): string {
  const greeting = fields.firstName
    ? `Hi ${fields.firstName},`
    : 'Hi,';

  const pillarLines = PILLAR_KEYS.map(
    (p) => `  ${PILLARS[p].label.padEnd(28)} ${fields.pillarScores[p]}/100`
  ).join('\n');

  const focusLines = fields.focusAreas
    .map((p, i) => {
      const score = fields.pillarScores[p];
      const reco = getRecommendation(p, score);
      return `${String(i + 1).padStart(2, '0')}. ${PILLARS[p].label} (scored ${score})\n${reco}`;
    })
    .join('\n\n');

  return `${greeting}

Your AI Readiness Score: ${fields.overallScore}/100 -- ${fields.band.label}

${fields.band.description}

PILLAR BREAKDOWN
${pillarLines}

WHERE TO FOCUS

${focusLines}

View your full result online:
${fields.resultUrl}

Want to talk through what your score means for your business? Book a 30-minute call from your result page -- no deck, no pitch.

-- Creative Milk
https://www.creative-milk.com.au
`;
}

/**
 * Render the HTML body. All styling is inline; the only external dependency
 * is the body background colour set on <body>.
 */
export function renderPlaybookEmailHtml(fields: PlaybookEmailFields): string {
  const safeFirst = fields.firstName ? escapeHtml(fields.firstName) : '';
  const safeBandLabel = escapeHtml(fields.band.label);
  const safeBandDesc = escapeHtml(fields.band.description);
  const safeUrl = escapeHtml(fields.resultUrl);

  const greeting = safeFirst ? `Hi ${safeFirst},` : 'Hi,';

  const pillarRows = PILLAR_KEYS.map((p) => {
    const score = fields.pillarScores[p];
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${COLORS.border};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${COLORS.cream};">
          ${escapeHtml(PILLARS[p].label)}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid ${COLORS.border};font-family:Georgia,serif;font-size:22px;color:${COLORS.cream};text-align:right;line-height:1;">
          ${score}<span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:${COLORS.creamSoft};margin-left:6px;">/100</span>
        </td>
      </tr>`;
  }).join('');

  const focusBlocks = fields.focusAreas
    .map((p, i) => {
      const score = fields.pillarScores[p];
      const reco = escapeHtml(getRecommendation(p, score));
      const label = escapeHtml(PILLARS[p].label);
      return `
        <tr><td style="padding:0 0 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td valign="top" style="width:80px;padding-right:20px;">
                <div style="font-family:Georgia,serif;font-size:56px;color:${COLORS.gold};line-height:1;letter-spacing:-0.02em;">
                  ${String(i + 1).padStart(2, '0')}
                </div>
              </td>
              <td valign="top">
                <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:6px;">
                  ${label}
                </div>
                <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.gold};margin-bottom:14px;">
                  Scored ${score}
                </div>
                <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.cream};">
                  ${reco}
                </div>
              </td>
            </tr>
          </table>
        </td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your AI Readiness playbook</title>
</head>
<body style="margin:0;background:${COLORS.ink};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${COLORS.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.ink};padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${COLORS.ink};border:1px solid ${COLORS.border};">

        <!-- Header -->
        <tr><td style="padding:32px 40px;border-bottom:1px solid ${COLORS.border};">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.gold};margin-bottom:8px;">-- Your AI Readiness playbook</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:${COLORS.cream};letter-spacing:-0.01em;line-height:1.05;">
            Creative <em style="color:${COLORS.gold};font-style:italic;">Milk</em>
          </div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0;font-size:16px;line-height:1.7;color:${COLORS.cream};">
            ${greeting}
          </p>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${COLORS.creamMute};">
            Thanks for taking the AI Readiness assessment. Here's your full breakdown.
          </p>
        </td></tr>

        <!-- Score block -->
        <tr><td align="center" style="padding:40px 40px 16px;">
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:12px;">
            Your overall score
          </div>
          <div style="font-family:Georgia,serif;font-size:120px;line-height:1;color:${COLORS.gold};letter-spacing:-0.04em;">
            ${fields.overallScore}
          </div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;color:${COLORS.creamSoft};margin-top:-4px;">
            / 100
          </div>
          <div style="display:inline-block;margin-top:20px;padding:6px 16px;border:1px solid ${COLORS.gold};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.gold};">
            ${safeBandLabel}
          </div>
        </td></tr>

        <tr><td style="padding:8px 40px 40px;">
          <p style="margin:0;font-size:15px;line-height:1.8;color:${COLORS.creamMute};text-align:center;">
            ${safeBandDesc}
          </p>
        </td></tr>

        <!-- Pillar breakdown -->
        <tr><td style="padding:24px 40px 8px;">
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:6px;">
            -- Pillar breakdown
          </div>
          <div style="font-family:Georgia,serif;font-size:24px;color:${COLORS.cream};line-height:1.2;margin-bottom:16px;">
            How you scored across the five pillars
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${pillarRows}
          </table>
        </td></tr>

        <!-- Focus areas -->
        <tr><td style="padding:40px 40px 8px;">
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:6px;">
            -- Where to focus
          </div>
          <div style="font-family:Georgia,serif;font-size:24px;color:${COLORS.cream};line-height:1.2;margin-bottom:8px;">
            Your three highest-leverage focus areas
          </div>
          <p style="margin:0 0 28px;font-size:14px;line-height:1.7;color:${COLORS.creamMute};">
            Personalised to your pillar scores. Tackle these in order for the biggest readiness gain over the next 90 days.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${focusBlocks}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td align="center" style="padding:24px 40px 48px;border-top:1px solid ${COLORS.border};">
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.creamSoft};margin-bottom:12px;">
            -- Keep going
          </div>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${COLORS.creamMute};max-width:440px;">
            Revisit your full result online any time, or book a 30-minute call to talk through what your score means for your business.
          </p>
          <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;background:${COLORS.gold};color:${COLORS.ink};text-decoration:none;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
            View my full result
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid ${COLORS.border};font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:${COLORS.creamSoft};">
          Creative Milk -- AI consulting for Australian businesses<br>
          <a href="https://www.creative-milk.com.au" style="color:${COLORS.creamSoft};text-decoration:none;border-bottom:1px solid ${COLORS.border};">creative-milk.com.au</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Build the subject line. Kept short and on-brand -- no emoji, no
 * marketing-y exclamation. Score + band gives the recipient instant context.
 */
export function renderPlaybookEmailSubject(fields: PlaybookEmailFields): string {
  return `Your AI Readiness playbook -- ${fields.overallScore}/100 (${fields.band.label})`;
}
