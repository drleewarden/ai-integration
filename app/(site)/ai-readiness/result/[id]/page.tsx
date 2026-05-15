/**
 * /ai-readiness/result/[id] — server component
 *
 * Fetches the public projection of the assessment via the internal API
 * (which sanitises PII), then renders the result client component. Also
 * generates per-result metadata so shared links have a meaningful preview.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ResultClient from './ResultClient';
import type { PublicResult } from '@/app/api/readiness/result/[id]/route';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the absolute base URL for server-side fetches. We can't use a relative
 * URL because Next's fetch from a server component needs an origin. Vercel
 * supplies VERCEL_URL; local dev uses request headers.
 */
async function getBaseUrl(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local dev fallback: read from incoming request headers
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function fetchResult(id: string): Promise<PublicResult | null> {
  const base = await getBaseUrl();
  try {
    const res = await fetch(`${base}/api/readiness/result/${id}`, {
      // Cache the page itself; the API has its own cache headers
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: PublicResult };
    return body.result ?? null;
  } catch (err) {
    console.error('[result page] fetch failed:', err);
    return null;
  }
}

// ── Metadata (OpenGraph for shared links) ────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchResult(id);

  if (!result) {
    return {
      title: 'AI Readiness | Creative Milk',
      description: 'Find out how AI-ready your business is.',
    };
  }

  const title = `${result.overallScore}/100 — ${result.band.label} | Creative Milk AI Readiness`;
  const description = result.band.description;

  const base = await getBaseUrl();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/ai-readiness/result/${id}`,
      siteName: 'Creative Milk',
      type: 'website',
      // TODO: dynamic OG image in Batch 2.5 — for now uses static fallback
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      // Result pages shouldn't be indexed — they're personal and shareable, not SEO assets
      index: false,
      follow: false,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchResult(id);

  if (!result) {
    notFound();
  }

  const base = await getBaseUrl();
  const resultUrl = `${base}/ai-readiness/result/${id}`;

  return <ResultClient result={result} resultUrl={resultUrl} />;
}
