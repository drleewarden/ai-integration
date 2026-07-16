// app/robots.ts -- served automatically at /robots.txt
//
// AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are listed explicitly
// so a future change to the wildcard rule can't accidentally de-list the site
// from AI search engines. Being cited by ChatGPT/Perplexity/Claude is a lead
// channel for Creative Milk, so these stay allowed.

import { MetadataRoute } from 'next'

const DISALLOW = ['/api/', '/_next/']

// AI search / assistant crawlers we explicitly welcome.
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI training + search
  'OAI-SearchBot',     // ChatGPT search
  'ChatGPT-User',      // ChatGPT live browsing
  'ClaudeBot',         // Anthropic
  'Claude-User',       // Claude live browsing
  'PerplexityBot',     // Perplexity index
  'Perplexity-User',   // Perplexity live browsing
  'Google-Extended',   // Gemini / AI Overviews grounding
  'Applebot-Extended', // Apple Intelligence
  'Amazonbot',
  'cohere-ai',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: 'https://www.creative-milk.com.au/sitemap.xml',
    host: 'https://www.creative-milk.com.au',
  }
}
