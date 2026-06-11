/**
 * /opportunity-cost -- server component shell.
 *
 * Sets page metadata and renders the interactive Cost of Delay calculator. The
 * tool itself is client-side (live recompute on every input change) so lives in
 * CalculatorClient.tsx.
 */

import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/app/components/Schema';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: 'AI Opportunity Cost Calculator | Creative Milk',
  description:
    'See what standing still is costing your business. A live Cost of Delay calculator that quantifies the value you forgo for every month without effective AI tools in place.',
  openGraph: {
    title: 'AI Opportunity Cost Calculator | Creative Milk',
    description:
      'What is waiting actually costing you? Quantify the cost of delaying AI adoption in your business.',
    url: 'https://www.creative-milk.com.au/opportunity-cost',
    siteName: 'Creative Milk',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Opportunity Cost Calculator | Creative Milk',
    description: 'See what every month of delay is costing your business.',
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
          { name: 'Opportunity Cost Calculator', url: '/opportunity-cost' },
        ]}
      />
      <CalculatorClient />
    </>
  );
}
