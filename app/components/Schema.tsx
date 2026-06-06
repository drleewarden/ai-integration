// components/Schema.tsx
// Reusable schema component — import and use in layout.tsx and individual pages
//
// USAGE:
//   In app/layout.tsx  → <OrganisationSchema /> + <WebsiteSchema />
//   In page files      → <ServiceSchema />, <FAQSchema />, <BreadcrumbSchema /> etc.

import React from 'react'

const BASE_URL = 'https://www.creative-milk.com.au'

// ── 1. ORGANISATION (place in root layout.tsx) ────────────────────────────────
// Tells Google who Creative Milk is as an entity.
export function OrganisationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organisation`,
    name: 'Creative Milk',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/icon.svg`,
    },
    description:
      'Creative Milk builds custom AI systems for Australian businesses — scoped around specific problems and measured by outcomes.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Level 7, 80 Dorcas Street',
      addressLocality: 'South Melbourne',
      addressRegion: 'VIC',
      postalCode: '3205',
      addressCountry: 'AU',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    sameAs: [
      // Add LinkedIn, Twitter etc. once confirmed
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'AI Implementation',
      'Business Automation',
      'Custom AI Systems',
      'Machine Learning',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── 2. WEBSITE (place in root layout.tsx) ────────────────────────────────────
// Enables sitelinks search box and establishes the canonical website entity.
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Creative Milk',
    description: 'AI systems scoped around your actual business problems.',
    publisher: {
      '@id': `${BASE_URL}/#organisation`,
    },
    inLanguage: 'en-AU',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── 3. SERVICE PAGE (use in /what-we-build/page.tsx) ─────────────────────────
export function ServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Implementation Services',
    provider: {
      '@id': `${BASE_URL}/#organisation`,
    },
    serviceType: 'AI Consulting and Implementation',
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    description:
      'Practical AI applications for Australian businesses including customer support automation, sales intelligence, operations automation, and document processing.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AI Implementation Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Discovery Sprint',
            description: 'AI readiness assessment and scoped problem definition.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Build & Integrate',
            description: 'Custom AI system design, development, and integration.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Managed AI Partnership',
            description: 'Ongoing AI operations, monitoring, and optimisation.',
          },
        },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── 4. PRICING PAGE (use in /pricing/page.tsx) ────────────────────────────────
export function PricingSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Creative Milk AI Implementation Pricing',
    description: 'Transparent AI implementation pricing for Australian businesses.',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Offer',
          name: 'Discovery Sprint',
          price: '5000',
          priceCurrency: 'AUD',
          description: 'Scoped AI assessment. Understand your problem, map your data, define the build.',
          seller: { '@id': `${BASE_URL}/#organisation` },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Offer',
          name: 'Build & Integrate',
          price: '30000',
          priceCurrency: 'AUD',
          description: 'Custom AI system built and integrated into your existing workflows.',
          seller: { '@id': `${BASE_URL}/#organisation` },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Offer',
          name: 'Managed AI Partnership',
          price: '5000',
          priceCurrency: 'AUD',
          description: 'Monthly managed AI operations. Ongoing optimisation and support.',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '5000',
            priceCurrency: 'AUD',
            unitCode: 'MON',
          },
          seller: { '@id': `${BASE_URL}/#organisation` },
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── 5. BREADCRUMB (use on any inner page) ─────────────────────────────────────
// Example: <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Pricing', url: '/pricing' }]} />
interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── 6. CASE STUDY / ARTICLE (use on /work/[slug]/page.tsx) ──────────────────
interface CaseStudySchemaProps {
  title: string
  description: string
  url: string
  datePublished?: string
  industry?: string
}

export function CaseStudySchema({
  title,
  description,
  url,
  datePublished,
  industry,
}: CaseStudySchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${BASE_URL}${url}`,
    author: { '@id': `${BASE_URL}/#organisation` },
    publisher: { '@id': `${BASE_URL}/#organisation` },
    ...(datePublished && { datePublished }),
    ...(industry && { about: { '@type': 'Thing', name: industry } }),
    inLanguage: 'en-AU',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
