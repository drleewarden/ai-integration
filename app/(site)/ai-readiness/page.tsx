/**
 * /ai-readiness -- server component shell.
 *
 * Sets page metadata, OpenGraph defaults, and renders the client assessment
 * flow. The flow itself is interactive so lives in AssessmentClient.tsx.
 */

import type { Metadata } from 'next';
import AssessmentClient from './AssessmentClient';

export const metadata: Metadata = {
  title: 'AI Readiness Assessment | Creative Milk',
  description:
    'Find out how AI-ready your business is. A five-minute assessment across the five pillars of AI readiness, with a personal score and a 90-day playbook.',
  openGraph: {
    title: 'AI Readiness Assessment | Creative Milk',
    description:
      'A five-minute assessment with a personalised playbook for your business.',
    url: 'https://www.creative-milk.com.au/ai-readiness',
    siteName: 'Creative Milk',
    type: 'website',
    // Defining openGraph replaces the root layout's, so re-declare the
    // file-convention image explicitly.
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Readiness Assessment | Creative Milk',
    description: 'How AI-ready is your business? Find out in five minutes.',
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://www.creative-milk.com.au/ai-readiness',
  },
};

export default function AiReadinessPage() {
  return <AssessmentClient />;
}
