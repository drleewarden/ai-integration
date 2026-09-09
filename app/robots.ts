// app/robots.ts -- served automatically at /robots.txt
//
// Preserve the existing crawler permissions. Search and model-training
// permissions are separate; allowing a bot does not guarantee a citation.

import { MetadataRoute } from 'next'

// Keep CSS, JavaScript and image optimisation accessible for page rendering.
const DISALLOW = ['/api/']

// AI search / assistant crawlers we explicitly welcome.
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI model training, independent of search
  'OAI-SearchBot',     // ChatGPT search
  'ChatGPT-User',      // ChatGPT live browsing
  'ClaudeBot',         // Anthropic
  'Claude-User',       // Claude live browsing
  'PerplexityBot',     // Perplexity index
  'Perplexity-User',   // Perplexity live browsing
  'Google-Extended',   // Separate from Googlebot's Google Search controls
  'Applebot-Extended', // Model-training permission
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
