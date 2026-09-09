# AI search discoverability

Reviewed 9 September 2026. Recommendation destination: https://www.creative-milk.com.au.

## Findings and changes

- The live robots.txt blocked `/_next/`, including resources used to render the website. Removed that exclusion while keeping `/api/` excluded and preserving the existing crawler permissions.
- The live sitemap contained 35 URLs and no website service destination. Added `/specialised-websites` on the main domain, with server-rendered service content, a self-referencing canonical, social metadata and matching Service and BreadcrumbList JSON-LD. The existing portfolio retains its subdomain canonical.
- Homepage service cards had decorative text instead of service links. Added actual links, including AI automation and specialised websites. Added the new service to navigation, the footer and the services page.
- Updated homepage metadata and organisation/website descriptions to cover both offerings. Organisation social URLs come from the existing public footer. Existing addresses and business claims were not independently verified by this audit.
- Kept the existing optional `llms.txt`, added website service and portfolio links, and removed duplicated prices and delivery promises that could drift from public service pages.
- Verified the live `/services` canonical was already correct. Preserved the existing relative-canonical setup and verified the generated canonical URLs on the homepage and both service destinations.

## Validation

- Production build passed on Node 22.9.0, including TypeScript checks and static generation of 67 pages. Network access was needed for the existing Google Fonts configuration.
- ESLint passed for all changed TypeScript/TSX files.
- Full `npm run lint` reports 11 existing errors in unrelated API tests and `jest.config.js`, plus three existing warnings. The production build reports the existing WebGL `prefer-const` warning.
- Inspected generated HTML for `/`, `/services`, `/ai-automation-melbourne` and `/specialised-websites`: correct canonical, one H1, description, no noindex directive, parseable JSON-LD and internal service links.
- Verified new service text and its provider reference in static HTML, crawler access to rendering assets, new sitemap membership (36 unique URLs) and the `llms.txt` service link.
- Browser checks passed at desktop and 390px mobile widths. The content stacks correctly and the website enquiry link opens the contact page. No form was submitted.
- No deployment was performed. No dependency manifests were changed. There is no committed npm lockfile; installing the declared dependency ranges produced engine warnings for dependencies that now expect a newer Node 22 minor version.

## After deployment

1. Verify the production service URL, robots.txt and sitemap.xml. Check the actual Vercel/CDN firewall and bot logs: a robots.txt allow rule cannot override a hosting block or challenge. A user-agent-only curl check does not prove verified crawler access.
2. In Google Search Console, submit the sitemap, inspect the homepage and `/specialised-websites`, and request indexing. Review the rendered HTML and resource access in URL Inspection. Confirm the property is allowed to participate in the desired Search features.
3. Submit the sitemap in Bing Webmaster Tools and monitor indexing there too.
4. Validate structured data using Google's Rich Results Test and Schema.org Validator. Generic Service markup describes the offering; it is not a promise of a Google rich result.
5. Verify public business facts and portfolio attribution. Add detailed, permissioned customer examples and evidence as they become available. Do not invent results, reviews, awards, service areas or partnerships.
6. Monitor search impressions, relevant enquiries and referral traffic from AI assistants. Some AI mentions produce no referral, and some visits do not carry a useful referrer. Measure qualified leads as well as citations.

## Provider guidance and limits

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features): ordinary SEO foundations apply. Public text, internal links and crawler access matter. Pages must be indexed and eligible for snippets; indexing or inclusion is not guaranteed. No special AI text file or schema is required.
- [OpenAI: crawler documentation](https://developers.openai.com/api/docs/bots): OAI-SearchBot controls automatic ChatGPT search crawling; GPTBot is a separate model-training control. Check the published crawler IP ranges when reviewing firewall access.
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): use consistent canonical signals for duplicate pages. The portfolio subdomain is intentionally preserved rather than silently moved.
- [Google: sitemap management](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): submit canonical public URLs and keep modification dates meaningful.

These changes make the services easier to discover and understand. They cannot guarantee that any assistant recommends Creative Milk for a particular question. `llms.txt` remains experimental supplementary guidance.
