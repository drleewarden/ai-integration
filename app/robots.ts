// app/robots.ts
// Place this file at: src/app/robots.ts (or app/robots.ts depending on your project structure)

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://www.creative-milk.com.au/sitemap.xml',
    host: 'https://www.creative-milk.com.au',
  }
}
