/**
 * /opportunity-cost -- server component shell.
 *
 * Sets page metadata and renders the interactive AI value calculator. The tool
 * itself is client-side (live recompute on every input change) so lives in
 * CalculatorClient.tsx.
 */

import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/app/components/Schema';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: 'AI Value Calculator | Creative Milk',
  description:
    'See what the right AI tools could be worth to your business — time reclaimed and revenue gained, this year and over five. A live, no-sign-up calculator.',
  openGraph: {
    title: 'AI Value Calculator | Creative Milk',
    description:
      'See what AI could actually be worth to your business — time and money back, this year and over five years.',
    url: 'https://www.creative-milk.com.au/opportunity-cost',
    siteName: 'Creative Milk',
    type: 'website',
    // Defining openGraph replaces the root layout's, so re-declare the
    // file-convention image explicitly.
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Value Calculator | Creative Milk',
    description: 'See what acting on AI could be worth to your business.',
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://www.creative-milk.com.au/opportunity-cost',
  },
};

export default function OpportunityCostPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'AI Value Calculator', url: '/opportunity-cost' },
        ]}
      />
      <CalculatorClient />
    </>
  );
}
