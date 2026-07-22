// app/sitemap.ts -- served automatically at /sitemap.xml
//
// Insights posts are derived from the content registry (lib/insights/posts.ts)
// so new articles appear here without touching this file.
// Deliberately excluded: /ai-readiness/result/[id] (personal results, noindex)
// and /pricingdata (internal machine-readable page).
//
// lastModified uses real dates (bump SITE_UPDATED when static pages change
// substantively; posts use their own dateModified). A sitemap where every URL
// "changed today" on every request teaches crawlers to ignore the field.

import { MetadataRoute } from 'next'
import { posts } from '@/lib/insights/posts'

const BASE_URL = 'https://www.creative-milk.com.au'

// Last substantive update to the static marketing pages.
const SITE_UPDATED = new Date('2026-07-07')

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    // ── Core pages ──────────────────────────────────────────────
    { url: BASE_URL, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/what-we-build`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/services`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/process`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/clients`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/work`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/insights`, lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: SITE_UPDATED, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: SITE_UPDATED, changeFrequency: 'yearly', priority: 0.3 },

    // ── Industry verticals ───────────────────────────────────────
    { url: `${BASE_URL}/for/professional-services`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.7 },

    // ── Conversion / lead gen ────────────────────────────────────
    { url: `${BASE_URL}/ai-readiness`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/opportunity-cost`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/events/workshop`, lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority: 0.7 },

    // ── Members area ──────────────────────────────────────────────
    { url: `${BASE_URL}/members/upgrade`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const insightPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/insights/${post.slug}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...insightPosts]
}
