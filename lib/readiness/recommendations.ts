/**
 * Creative Milk -- focus-area recommendations.
 *
 * Per-pillar copy shown on the result page and embedded in the emailed
 * playbook. Two tiers: `low` (score <= 50, the "fastest gain" framing) and
 * `high` (score > 50, the "next-level leverage" framing).
 *
 * These are placeholders until the Track B content library lands. Keep them
 * concise and action-forward -- they have to read well in a constrained
 * email column AND in the result page's two-column layout.
 *
 * Single source of truth so the page and the email never drift apart.
 */

import type { PillarKey } from './types';

export type RecommendationTier = 'low' | 'high';

export const INTERIM_RECOMMENDATIONS: Record<
  PillarKey,
  Record<RecommendationTier, string>
> = {
  strategy: {
    low: 'Your AI strategy is informal. The fastest gain: write a one-page point of view on AI for your business -- three uses you’ll invest in, one thing you won’t use AI for, and the principle that guides the calls. Most teams skip this step and wonder why their AI work feels scattered.',
    high: 'You have a clear AI direction. The next move is codifying it -- get the strategy out of your head and into something your whole team can reference and contribute to.',
  },
  data: {
    low: 'Your AI tools are working with scattered, inconsistent inputs. Before adding new tools, build context packs for your three most common AI use cases. Better inputs = better outputs, without spending a dollar on new software.',
    high: 'You have decent data foundations. Focus next on connecting your AI tools directly to your knowledge sources -- CRM, docs, past work -- so context is automatic rather than pasted in.',
  },
  culture: {
    low: 'AI capability is uneven across your team -- some experimenting, some resistant, no shared baseline. Identify your two most curious team members and give them one hour each per week to lead the rest of the team. Capability spreads when it has a champion.',
    high: 'Your team is open to AI. The opportunity now is structure -- turning enthusiasm into reliable practice. Set up regular share-outs, document what works, and remove the lone-champion risk.',
  },
  technology: {
    low: 'You’re using a few AI tools, mostly at surface level. Pick the one you use most and spend 90 minutes finding three features you don’t currently use. Most teams use 10% of what their AI subscriptions can do.',
    high: 'Strong technical foundation. The leverage now is integration -- connecting your AI tools to each other and to your existing systems so AI work doesn’t live in isolation.',
  },
  governance: {
    low: 'You have no written AI policy. Businesses without one typically discover the gap during an incident, not before. Write a one-page policy this week: what data never goes into AI tools, who’s accountable for AI-generated work, what to do when something feels wrong.',
    high: 'You have governance in place. Mature it next by adding measurement -- track AI use, review outputs periodically, and surface any drift before it becomes a problem.',
  },
};

/**
 * Resolve the recommendation tier for a given pillar score.
 * Threshold matches the result page (<= 50 is "low / fastest gain").
 */
export function recommendationTierForScore(score: number): RecommendationTier {
  return score <= 50 ? 'low' : 'high';
}

/**
 * Convenience -- get the recommendation text for a pillar + its score.
 */
export function getRecommendation(pillar: PillarKey, score: number): string {
  return INTERIM_RECOMMENDATIONS[pillar][recommendationTierForScore(score)];
}
