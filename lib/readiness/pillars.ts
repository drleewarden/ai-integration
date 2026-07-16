/**
 * Creative Milk -- AI Readiness pillar definitions.
 *
 * Five pillars, each backed by 3 questions in questions.ts. Pillar metadata
 * (labels, descriptions) lives here so it can be imported without pulling in
 * the full question library.
 */

import type { Pillar, PillarKey } from './types';
import { PILLAR_KEYS } from './types';

export const PILLARS: Record<PillarKey, Pillar> = {
  strategy: {
    id: 'strategy',
    label: 'AI Strategy',
    shortLabel: 'Strategy',
    description:
      'How clearly your business has decided where AI will create value, where it won\u2019t be used, and how decisions about it get made.',
  },
  data: {
    id: 'data',
    label: 'Data Foundations',
    shortLabel: 'Data',
    description:
      'How well your data is organised, accessible, and prepared for AI tools to actually work with it.',
  },
  culture: {
    id: 'culture',
    label: 'Culture, Talent & Skills',
    shortLabel: 'Culture',
    description:
      'How your team approaches AI -- confidence, curiosity, willingness to experiment, and how knowledge spreads.',
  },
  technology: {
    id: 'technology',
    label: 'Technology',
    shortLabel: 'Tech',
    description:
      'How well you understand and use the AI tools available, and how they connect into your existing systems.',
  },
  governance: {
    id: 'governance',
    label: 'Governance',
    shortLabel: 'Governance',
    description:
      'How AI usage policies, ethical considerations, and risk management work in practice in your business.',
  },
};

/**
 * Stable, exported ordering for UI and reports. Matches the v5 demo.
 */
export const PILLAR_ORDER: readonly PillarKey[] = PILLAR_KEYS;
