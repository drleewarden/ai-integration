// app/sitemap.ts -- served automatically at /sitemap.xml
//
// Insights posts are derived from the content registry (lib/insights/posts.ts)
// so new articles appear here without touching this file.
// Deliberately excluded: /ai-readiness/result/[id] (personal results, noindex)
// and /pricingdata (internal machine-readable page).

import { MetadataRoute } from 'next'
import { posts } from '@/lib/insights/posts'

const BASE_URL = 'https://www.creative-milk.com.au'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    // ── Core pages ──────────────────────────────────────────────
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/what-we-build`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/process`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/clients`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/work`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },

    // ── Industry verticals ───────────────────────────────────────
    { url: `${BASE_URL}/for/professional-services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // ── Conversion / lead gen ────────────────────────────────────
    { url: `${BASE_URL}/ai-readiness`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/opportunity-cost`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/events/workshop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const insightPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/insights/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...insightPosts]
}
