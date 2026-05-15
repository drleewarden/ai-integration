/**
 * ResultClient — public result view.
 *
 * Renders the score reveal, pillar breakdown, focus areas, and two CTAs:
 *   1. Book a 30-min call (primary)  → opens BookCallModal
 *   2. Email me the playbook         → inline form
 *
 * Plus the Share mechanism on the closing section.
 *
 * Refactored from the v5 demo's ResultScreen. Differences:
 *   - Data comes from props (the server fetches sanitised PublicResult)
 *   - Submit handlers POST to real API endpoints
 *   - Focus area recommendations now come from a small inline copy bank;
 *     once Track B content library is written, this swaps to the real
 *     library lookup.
 *   - Share mechanism wired with copy-to-clipboard + LinkedIn share intent
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PILLARS } from '@/lib/readiness/pillars';
import { PILLAR_KEYS } from '@/lib/readiness/types';
import type { PillarKey } from '@/lib/readiness/types';
import type { PublicResult } from '@/app/api/readiness/result/[id]/route';
import {
  C,
  F,
  Icons,
  Label,
  GhostButton,
  SiteNav,
  PILLAR_ICONS,
  goldButtonStyle,
  AiReadinessFontLink,
} from '../../_components/ui';
import { HeroBackground } from '../../_components/HeroBackground';
import { BookCallModal } from './BookCallModal';

// ── Interim focus-area recommendations ──────────────────────────────────────
// These are placeholders. They get replaced by the content library (Track B).
// Until then, this small bank ensures the page renders meaningful copy.
const INTERIM_RECOMMENDATIONS: Record<PillarKey, { low: string; high: string }> = {
  strategy: {
    low: 'Your AI strategy is informal. The fastest gain: write a one-page point of view on AI for your business — three uses you\u2019ll invest in, one thing you won\u2019t use AI for, and the principle that guides the calls. Most teams skip this step and wonder why their AI work feels scattered.',
    high: 'You have a clear AI direction. The next move is codifying it — get the strategy out of your head and into something your whole team can reference and contribute to.',
  },
  data: {
    low: 'Your AI tools are working with scattered, inconsistent inputs. Before adding new tools, build context packs for your three most common AI use cases. Better inputs = better outputs, without spending a dollar on new software.',
    high: 'You have decent data foundations. Focus next on connecting your AI tools directly to your knowledge sources — CRM, docs, past work — so context is automatic rather than pasted in.',
  },
  culture: {
    low: 'AI capability is uneven across your team — some experimenting, some resistant, no shared baseline. Identify your two most curious team members and give them one hour each per week to lead the rest of the team. Capability spreads when it has a champion.',
    high: 'Your team is open to AI. The opportunity now is structure — turning enthusiasm into reliable practice. Set up regular share-outs, document what works, and remove the lone-champion risk.',
  },
  technology: {
    low: 'You\u2019re using a few AI tools, mostly at surface level. Pick the one you use most and spend 90 minutes finding three features you don\u2019t currently use. Most teams use 10% of what their AI subscriptions can do.',
    high: 'Strong technical foundation. The leverage now is integration — connecting your AI tools to each other and to your existing systems so AI work doesn\u2019t live in isolation.',
  },
  governance: {
    low: 'You have no written AI policy. Businesses without one typically discover the gap during an incident, not before. Write a one-page policy this week: what data never goes into AI tools, who\u2019s accountable for AI-generated work, what to do when something feels wrong.',
    high: 'You have governance in place. Mature it next by adding measurement — track AI use, review outputs periodically, and surface any drift before it becomes a problem.',
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ResultClient({
  result,
  resultUrl,
}: {
  result: PublicResult;
  resultUrl: string;
}) {
  const [animScore, setAnimScore] = useState(0);
  const [bookCallOpen, setBookCallOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);

  // Animated score reveal — same easing as v5
  useEffect(() => {
    const target = result.overallScore;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimScore(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.overallScore]);

  // Focus areas already come ordered lowest-first from the API; we render in
  // that order. We also derive a fully-sorted list for the pillar breakdown
  // section but in v5's PILLAR_KEYS order (not score order) — design choice
  // from v5: pillar order is consistent so readers can compare across runs.
  const focusAreaCards = useMemo(
    () =>
      result.focusAreas.map((p) => ({
        key: p,
        ...PILLARS[p],
        score: result.pillarScores[p],
        tier: result.pillarTiers[p],
      })),
    [result]
  );

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || emailBusy) return;
    setEmailBusy(true);
    setEmailErr(null);
    try {
      const res = await fetch('/api/readiness/email-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId: result.id,
          email: email.trim(),
          firstName: firstName.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Submission failed');
      setEmailSent(true);
    } catch (err) {
      console.error('[result] email submit failed:', err);
      setEmailErr(
        err instanceof Error ? err.message : 'Could not send. Please try again.'
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      const shareText = `Just did the Creative Milk AI Readiness assessment. ${result.overallScore}/100 — ${result.band.label}. Worth a read: ${resultUrl}`;
      await navigator.clipboard.writeText(shareText);
      setCopyClicked(true);
      setTimeout(() => setCopyClicked(false), 2000);
    } catch (err) {
      console.error('[result] copy failed:', err);
    }
  };

  const handleLinkedinShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ background: C.cream, color: C.slate }}>
      <AiReadinessFontLink />
      <style>{`
        body { margin: 0; font-family: Syne, sans-serif; }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        input, select, textarea { font-family: inherit; }
      `}</style>

      {/* Dark hero score reveal */}
      <div style={{ position: 'relative', background: C.ink, color: C.cream }}>
        <HeroBackground />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SiteNav />
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              padding: '64px 24px 96px',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <Label>— Your AI Readiness Score</Label>
            </div>
            <div style={{ display: 'inline-block', marginBottom: '24px' }}>
              <div
                style={{
                  ...F.display,
                  fontSize: 'clamp(160px, 22vw, 280px)',
                  lineHeight: 1,
                  color: C.gold,
                  letterSpacing: '-0.04em',
                }}
              >
                {animScore}
              </div>
              <div
                style={{
                  ...F.label,
                  fontSize: '10px',
                  color: 'rgba(245,240,232,0.5)',
                  marginTop: '-8px',
                }}
              >
                / 100
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  ...F.cta,
                  fontSize: '11px',
                  background: 'transparent',
                  border: `1px solid ${C.gold}`,
                  color: C.gold,
                }}
              >
                {result.band.label}
              </span>
            </div>
            <p
              style={{
                ...F.ui,
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'rgba(245,240,232,0.8)',
                maxWidth: '620px',
                margin: '0 auto',
              }}
            >
              {result.band.description}
            </p>
          </div>
        </div>
      </div>

      {/* Pillar breakdown */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: '48px' }}>
          <Label color={C.slateMute}>— Pillar Breakdown</Label>
          <h2
            style={{
              ...F.section,
              fontSize: '40px',
              lineHeight: 1.1,
              color: C.ink,
              margin: '12px 0 0',
            }}
          >
            How you scored across the five pillars
          </h2>
          <p
            style={{
              ...F.ui,
              fontSize: '15px',
              lineHeight: 1.7,
              color: C.slateMute,
              marginTop: '16px',
              maxWidth: '540px',
            }}
          >
            Your weakest pillars are where the highest-leverage improvements live. Focus there first.
          </p>
        </div>
        <div style={{ marginBottom: '80px' }}>
          {PILLAR_KEYS.map((p) => {
            const pillar = PILLARS[p];
            const score = result.pillarScores[p];
            const PillarIcon = PILLAR_ICONS[p];
            return (
              <div
                key={p}
                style={{
                  paddingBottom: '20px',
                  marginBottom: '20px',
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PillarIcon size={18} color={C.ink} />
                    <span style={{ ...F.section, fontSize: '22px', color: C.ink }}>
                      {pillar.label}
                    </span>
                  </div>
                  <span
                    style={{ ...F.display, fontSize: '36px', color: C.ink, lineHeight: 1 }}
                  >
                    {score}
                    <span
                      style={{
                        ...F.label,
                        fontSize: '10px',
                        color: C.slateMute,
                        marginLeft: '6px',
                      }}
                    >
                      /100
                    </span>
                  </span>
                </div>
                <div style={{ height: '1px', width: '100%', background: C.border }}>
                  <div
                    style={{
                      height: '1px',
                      width: `${score}%`,
                      background: C.gold,
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Focus areas */}
        <div style={{ marginBottom: '80px' }}>
          <Label color={C.slateMute}>— Where to focus</Label>
          <h2
            style={{
              ...F.section,
              fontSize: '40px',
              lineHeight: 1.1,
              color: C.ink,
              margin: '12px 0 0',
            }}
          >
            Your three highest-leverage focus areas
          </h2>
          <p
            style={{
              ...F.ui,
              fontSize: '15px',
              lineHeight: 1.7,
              color: C.slateMute,
              marginTop: '16px',
              maxWidth: '540px',
              marginBottom: '48px',
            }}
          >
            Personalised to your pillar scores. Tackle these in order for the biggest readiness gain over the next 90 days.
          </p>
          <div>
            {focusAreaCards.map((p, idx) => {
              const recoKey = p.score <= 50 ? 'low' : 'high';
              const reco = INTERIM_RECOMMENDATIONS[p.key][recoKey];
              return (
                <div key={p.key} style={{ display: 'flex', gap: '32px', marginBottom: '48px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <div
                      style={{
                        ...F.display,
                        fontSize: '72px',
                        color: C.gold,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div style={{ flex: 1, paddingTop: '12px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}
                    >
                      <Label color={C.slateMute}>{p.label}</Label>
                      <Label color={C.gold}>SCORED {p.score}</Label>
                    </div>
                    <p
                      style={{
                        ...F.ui,
                        fontSize: '16px',
                        lineHeight: 1.8,
                        color: C.slate,
                        margin: 0,
                      }}
                    >
                      {reco}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA — dark */}
      <div style={{ position: 'relative', background: C.ink, color: C.cream }}>
        <HeroBackground />
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '960px',
            margin: '0 auto',
            padding: '96px 24px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Label>— Next Step</Label>
            <h2
              style={{
                ...F.section,
                fontSize: '48px',
                lineHeight: 1.1,
                color: C.cream,
                margin: '16px 0 0',
              }}
            >
              Talk to us about your score.
            </h2>
            <p
              style={{
                ...F.ui,
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'rgba(245,240,232,0.75)',
                marginTop: '20px',
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Book a 30-minute call. We&rsquo;ll walk through what your score means for your business, and the fastest practical path to improving it. No deck, no pitch.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
            <button onClick={() => setBookCallOpen(true)} style={goldButtonStyle}>
              <Icons.Calendar size={14} /> Book a 30-minute call <Icons.ArrowRight size={14} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '48px auto',
              maxWidth: '440px',
              color: 'rgba(245,240,232,0.3)',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(245,240,232,0.15)' }} />
            <span style={{ ...F.label, fontSize: '10px' }}>Or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(245,240,232,0.15)' }} />
          </div>

          <div style={{ maxWidth: '576px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3
                style={{
                  ...F.section,
                  fontSize: '26px',
                  color: C.cream,
                  margin: '0 0 10px',
                }}
              >
                Send me my playbook
              </h3>
              <p
                style={{
                  ...F.ui,
                  fontSize: '14px',
                  color: 'rgba(245,240,232,0.65)',
                  margin: 0,
                }}
              >
                A PDF playbook with your full pillar breakdown and 90-day action plan, delivered to your inbox.
              </p>
            </div>
            {emailSent ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px 0',
                  color: C.gold,
                }}
              >
                <Icons.Check size={16} color={C.gold} />
                <span style={{ ...F.ui, fontSize: '14px' }}>
                  Sent. Check your inbox in a few minutes.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Your first name (optional)"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={80}
                  style={{
                    padding: '12px 16px',
                    ...F.ui,
                    fontSize: '14px',
                    background: 'rgba(245,240,232,0.05)',
                    border: '1px solid rgba(245,240,232,0.2)',
                    color: C.cream,
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <input
                    type="email"
                    required
                    placeholder="you@yourbusiness.com.au"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    style={{
                      flex: '1 1 240px',
                      padding: '12px 16px',
                      ...F.ui,
                      fontSize: '14px',
                      background: 'rgba(245,240,232,0.05)',
                      border: '1px solid rgba(245,240,232,0.2)',
                      color: C.cream,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={emailBusy}
                    style={{
                      padding: '12px 24px',
                      fontSize: '11px',
                      cursor: emailBusy ? 'not-allowed' : 'pointer',
                      background: 'transparent',
                      color: C.cream,
                      border: `1px solid ${C.cream}`,
                      ...F.cta,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: emailBusy ? 0.5 : 1,
                    }}
                  >
                    <Icons.Mail size={14} />
                    {emailBusy ? 'Sending…' : 'Send my playbook'}
                  </button>
                </div>
                {emailErr && (
                  <p
                    style={{
                      ...F.ui,
                      fontSize: '13px',
                      color: '#E8A66A',
                      margin: '4px 0 0',
                    }}
                  >
                    {emailErr}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Share */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: C.cream,
        }}
      >
        <div style={{ ...F.ui, fontSize: '14px', color: C.slateMute }}>
          Share your result
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <GhostButton onClick={handleCopy}>
            <Icons.Copy size={12} /> {copyClicked ? 'Copied' : 'Copy link'}
          </GhostButton>
          <GhostButton onClick={handleLinkedinShare}>
            <Icons.Linkedin size={12} /> LinkedIn
          </GhostButton>
        </div>
      </div>

      {bookCallOpen && (
        <BookCallModal
          resultId={result.id}
          initialEmail={email}
          initialFirstName={firstName}
          onClose={() => setBookCallOpen(false)}
        />
      )}
    </div>
  );
}
