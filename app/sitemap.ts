// app/sitemap.ts
// Place this file at: src/app/sitemap.ts (or app/sitemap.ts depending on your project structure)
// Next.js will automatically serve this at /sitemap.xml

import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.creative-milk.com.au'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core pages ──────────────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/what-we-build`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/process`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/clients`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },

    // ── Industry verticals ───────────────────────────────────────
    {
      url: `${BASE_URL}/for/professional-services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // ── Conversion / lead gen ────────────────────────────────────
    {
      url: `${BASE_URL}/ai-readiness`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // ── Insight blog posts ───────────────────────────────────────
    {
      url: `${BASE_URL}/insights/blog-01-why-ai-fails`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/insights/blog-02-ai-costs-returns`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/insights/blog-03-change-management`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/insights/blog-04-ai-accounting-firms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/insights/blog-05-what-is-ai-agent`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/insights/blog-06-behind-support-build`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },

    // ── Case studies / work ──────────────────────────────────────
    {
      url: `${BASE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/work/brisbane-legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/work/melbourne-construction`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/work/sydney-accounting`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ]
}

// ── DYNAMIC PAGES NOTE ────────────────────────────────────────────────────────
// If you add dynamic routes (e.g. /insights/[slug]) fetch them from your CMS
// and return them alongside the static routes above. Example:
//
// const posts = await getAllInsightSlugs()
// const dynamicInsights = posts.map((slug) => ({
//   url: `${BASE_URL}/insights/${slug}`,
//   lastModified: new Date(),
//   changeFrequency: 'yearly' as const,
//   priority: 0.6,
// }))
//
// return [...staticRoutes, ...dynamicInsights]
