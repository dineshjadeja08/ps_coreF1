# Production SEO audit and implementation plan

Audit date: 9 October 2026. Scope: ps_coreF1 frontend. No deployment, commit, push, API change, or production data mutation is authorized by this task.

## Existing strengths

- App Router metadata, safe JSON-LD escaping, service API integration, localized route architecture, backend-controlled landing-page indexability, image optimization, responsive service UI, font swap, and www-to-apex redirect already exist.
- Checkout and booking-success layouts already specify noindex.
- Existing localized URLs intentionally use the normal service UI. Preserve that behavior rather than building a separate conversion flow.

## Prioritized plan

### P0: indexing and routing

1. Remove root homepage canonical/OG URL inheritance; give public pages self canonicals and private routes server metadata.
2. Allow crawlers to read noindex; keep API endpoints excluded. Normalize canonicals to HTTPS apex without tracking/filter parameters.
3. Reject genuinely missing service slugs with notFound before streaming. Do not turn API failures into permanent 404s.
4. Test metadata, query duplicates, robots rules, and missing resources before proceeding.

### P1: discovery and semantic content

1. Traverse all API service pages for sitemap discovery; include valid public categories; exclude non-indexable/duplicate/invalid URLs.
2. Stop inventing lastmod. Use timestamps supplied by the API; omit dates where unavailable. Fail visibly rather than publishing a truncated sitemap on API failure.
3. Hydrate existing catalogue UI with server data instead of hiding an SEO-only service list.
4. Correct JSON-LD context/provider references, scope coverage to Chennai until secondary operations are confirmed, and avoid unsubstantiated ratings.
5. Test pagination, schema, server output, and failure behavior.

### P2: local SEO and performance

1. Reuse only published, verified backend landing pages; do not manufacture hundreds of near-identical neighborhood routes or AC-repair aliases.
2. Render location-specific titles, useful existing API content, coverage, FAQs, and related links within the normal service layout.
3. Preserve GTM verification placement; audit analytics ownership and third-party loading without changing booking/auth/payment.
4. Run lint, tests, type checking, and production build; record production checks separately from local results.

## Initial risk register

- P0: root canonical `/` can be inherited by unrelated public/private routes.
- P0: robots disallows routes needing crawlable noindex metadata; admin layout is client-only with no server robots metadata.
- P0: `/services/[slug]` missing records can render HTTP 200; catch-all API errors are currently indistinguishable from absence.
- P1: sitemap reads only the first 100 services, excludes category URLs, and uses current time for static/service lastmod.
- P1: listing UI lacks initial data; hidden snapshot differs from visible SSR content.
- P1: service schema has no standalone context and relies on absent provider definitions on some routes; ratings and secondary coverage need substantiation.
- P2: generic landing H1 ignores backend location; useful backend content/links are unused.
- P2: direct GA4 plus GTM may duplicate page_view. GTM container contents are not available in repository; external configuration must be verified manually.

## Access limitations

Initial web-tool requests to the production homepage, robots.txt, sitemap.xml and AC city page returned tool-level Internal Error, not evidence of a site outage. Search Console/GTM management access and field Core Web Vitals are not available. Production validation and business coverage confirmation remain manual until independently verified.

## Implemented fixes

### P0

- Removed the root homepage canonical and root Open Graph URL. Kept metadataBase, title template, verification token, GTM head/noscript placement and existing analytics.
- Added self-canonical, title, description, Open Graph and Twitter metadata for public information pages. About metadata no longer drops the social preview defaults through shallow metadata replacement.
- Added server-side noindex layouts for login, profile, bookings, cart, technician routes and admin. Moved the unchanged client admin shell into its own component, preserving permission checks and navigation. Existing book/payment and booking-success noindex layouts remain.
- robots.txt excludes API routes only, allowing crawlers to discover private-page noindex. This is not an access-control mechanism: existing auth guards and backend authorization remain essential.
- Canonicals normalize to the HTTPS apex and discard query strings/fragments. Category filters canonicalize to clean category routes and internal search/filter results are noindex.
- Unknown service records call notFound during metadata and page rendering. API 5xx/network failures propagate instead of masquerading as missing content. Added regression tests for both cases.

### P1

- Sitemap walks all service pages, adds public category URLs and approved published landing pages, rejects malformed paths, deduplicates URLs and excludes private/noindex routes. API failures abort generation rather than returning a misleading partial HTTP-success sitemap. Over 50,000 entries produce an explicit split-sitemap error; the current site is far below that threshold.
- Removed current-time lastmod. Backend landing-page timestamps are used. The existing public service/category API does not expose updated_at, so their dates are omitted rather than inventing a timestamp; no backend API change was made.
- Seeded the existing homepage/catalogue/category/package UI and review queries with server data. Removed the hidden SEO-only service snapshot. Visible content, prices and booking controls are now renderable without JS while client queries continue refreshing availability.
- Added independently understandable Service context and provider identity, Organization identity, absolute image URLs, INR prices sourced from the backend, and Chennai-only default geographic schema claims. No address or operating hours were invented.
- Imported testimonials are not treated as verified booking aggregate ratings. Aggregates are included only when the displayed sample consists of legitimate booking-linked records with valid ratings. Removed hardcoded 4.8 labels; use actual review averages where present, otherwise package/pricing information.

### P2

- Reused the normal service page for local landing URLs, adding the existing backend intro, pricing information, coverage, FAQs and related links as visible content. Location-specific H1 and social metadata now correspond to the URL.
- Added only `/ac-repair-chennai` and `/water-tank-cleaning-chennai` as curated frontend fallbacks when the backend has no published landing record AND its city=Chennai availability-filtered API contains relevant active packages. They do not produce neighborhood or Coimbatore clones. A later published backend page takes priority automatically.
- Reused existing `/ac-service-chennai`, `/washing-machine-repair-chennai`, `/refrigerator-repair-chennai`, `/water-purifier-service-chennai` and already approved locality routes. City pages are prebuilt; existing locality pages continue to resolve on demand.
- New AC repair content explains inspection versus repair/refill selection. Water-tank content distinguishes tank construction, placement and capacity. Both use real package prices and API FAQs, without inventing guarantees, review dates or coverage neighborhoods.
- Reduced homepage mosaic priority loading from four images to the first image and added accurate hero-image sizes. Existing responsive breakpoints, image aspect ratios, lazy loading, font swap and booking controls remain.
- Removed a nested main landmark without changing its styles. Avoided repeating “in Chennai” in service H1/title when already present in the service name.

## Exact files changed

Paths below are relative to the frontend repository. No backend files, API keys, env files, database records or dependencies were changed.

| File(s) | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Remove global canonical/OG URL inheritance |
| `src/app/page.tsx` | Seed homepage catalogue and include Organization schema |
| `src/app/robots.ts` | Allow noindex pages to be crawled |
| `src/app/sitemap.ts` | Complete, validated, deduplicated dynamic sitemap with genuine dates |
| `src/app/services/page.tsx` | Query indexing rules and visible SSR catalogue |
| `src/app/services/[slug]/page.tsx` | Resource 404, metadata, seeded categories/packages/reviews |
| `src/app/[serviceSlug]/[[...areaSlug]]/page.tsx` | Location metadata/content, bounded prebuilds and normal service UI reuse |
| `src/app/search/page.tsx` | Seed visible search UI; existing noindex preserved |
| `src/app/about/page.tsx` | Accurate canonical and full social metadata |
| `src/app/admin/layout.tsx`, `src/components/admin/admin-shell.tsx` | Server robots metadata around unchanged client admin behavior |
| `src/app/login/layout.tsx`, `src/app/profile/layout.tsx`, `src/app/bookings/layout.tsx`, `src/app/cart/layout.tsx`, `src/app/technician/layout.tsx` | Private-route noindex |
| `src/app/support/layout.tsx`, `src/app/faq/layout.tsx`, `src/app/terms/layout.tsx`, `src/app/privacy-policy/layout.tsx`, `src/app/cancellation-policy/layout.tsx`, `src/app/join-as-technician/layout.tsx`, `src/app/partner-support/layout.tsx`, `src/app/service-standards/layout.tsx` | Public information-page metadata |
| `src/lib/seo.ts`, `src/lib/page-metadata.ts` | Canonical normalization, reusable metadata and schema accuracy |
| `src/types/api.ts` | Optional service updated_at support if later supplied by API |
| `src/features/catalogue/server.tsx` | Error distinction, safe pagination, memoization and verified local-page resolution |
| `src/features/catalogue/local-seo.ts` | Two curated, availability-gated city pages |
| `src/features/catalogue/queries.ts` | Optional server seeds, keeping existing client-query behavior |
| `src/features/catalogue/components/home-discovery.tsx` | Visible SSR catalogue, truthful labels and priority-image reduction |
| `src/features/catalogue/components/services-listing.tsx` | Server seeds, meaningful H1 and truthful package labels |
| `src/features/catalogue/components/service-detail-view.tsx` | Visible packages/reviews/local content, real ratings, H1 and semantic landmark |
| `src/features/catalogue/components/service-image.tsx` | Configurable responsive image sizes |
| `src/lib/seo.test.ts`, `src/app/indexing.test.ts`, `src/app/sitemap.test.ts`, `src/app/services/[slug]/page.test.ts` | Canonical, private/query indexing, sitemap and 404 regression tests |
| `src/features/catalogue/server.test.ts`, `src/features/catalogue/local-seo.test.ts`, `src/features/catalogue/components/service-detail-seo.test.tsx` | Pagination, failure semantics, page eligibility and visible SSR tests |
| `src/app/[serviceSlug]/[[...areaSlug]]/page.test.ts` | City-only prebuild regression |
| `docs/PRODUCTION_SEO_AUDIT.md` | Audit, implementation report and manual handoff |

## Verification results

- P0 targeted tests: 8 passed.
- Pagination/schema/sitemap targeted tests: 10 passed.
- Private-indexing/local-page/SSR targeted tests: 13 passed.
- Full test suite: 142 tests passed across 37 files, including a final rerun after the last edits.
- TypeScript: passed initially and again with a command-level memory limit after a later run exhausted local memory.
- Production build: passed again after the final edits, including TypeScript, with a command-level NEXT_PUBLIC_API_BASE_URL pointing at the existing public ps-core backend; 52 pages generated, including six city landing pages. No env file was edited. An earlier build failed because the local env points at an absent 127.0.0.1:8000 backend; that failure was not hidden.
- Generated AC repair HTML: one H1, canonical `https://purplesquad.in/ac-repair-chennai`, index/follow, prices and four FAQ summaries.
- Generated water-tank city HTML: one H1, canonical `https://purplesquad.in/water-tank-cleaning-chennai`, index/follow, prices and six FAQ summaries.
- Generated login HTML: noindex/nofollow and no inherited homepage canonical.
- Full npm lint attempt: failed with a native allocation error while the host had only about 62 MB free physical memory. All 294 source files subsequently passed in smaller batches with the unchanged ESLint configuration and zero warnings; no lint rules were disabled.
- Local HTTP-server verification was blocked by execution policy. Unit tests and generated HTML passed, but post-deploy HTTP status/canonical/sitemap checks are still required.
- Rich Results Test, Schema.org external validation, Search Console ownership/reporting, browser/mobile rendering and field LCP/INP/CLS are unverified. Do not interpret a build or schema unit test as an external validator result or measured Core Web Vitals improvement.

### Live baseline observed before deployment

Direct read-only requests on 9 October 2026 returned:

| URL | HTTP | Observation |
| --- | --- | --- |
| `/` | 200 | Homepage title/canonical and one H1 |
| `/robots.txt` | 200 | Old private-page disallow rules still deployed |
| `/sitemap.xml` | 200 | 60 URL entries in the currently deployed version |
| `/ac-service-chennai` | 200 | City canonical, index/follow and one H1 |
| `/services/not-a-real-purple-squad-service` | 200 | Confirmed soft 404: generic Service metadata, no H1 |
| `/login` | 200 | Homepage canonical inherited; no robots directive |

The public backend health, service catalogue, categories and SEO page-list endpoints returned 200. The Chennai-filtered catalogue contains relevant AC inspection/refill and water tank/sump cleaning packages. It confirms availability for the two new city pages; it does not establish that every Chennai neighborhood is served. The existing published city-page list did not contain AC repair or water-tank cleaning city pages, which is why the scoped frontend fallbacks were added.

## Remaining manual issues and decisions

- P0 deployment action: local fixes are not live. Approve commit/push and then roll out the frontend; recheck real HTTP 404 responses after deployment.
- P1: no public service/category modification timestamp exists in the API. Omitted lastmod is correct; adding genuine timestamps later is optional and would require backend API authorization.
- P1: verify any business address and secondary-city operations before adding LocalBusiness address/Coimbatore coverage claims. Existing UI references to Coimbatore were not rewritten without business confirmation.
- P1: a published backend landing page can specify a different canonical path. The frontend constrains host/query normalization, but cross-page canonical choices should be reviewed in admin. The current summary API does not expose canonical_override for sitemap-level comparison.
- P2 analytics: GTM and direct GA4 are both installed. A read-only request to the public GTM script returned 200 and no visible GA4 measurement ID. This is not proof of duplicate events or proof of their absence; custom/dynamic tags and account configuration remain inaccessible. Keep current analytics until Tag Assistant/GA4 DebugView confirms ownership, then use one owner for automatic page_view and preserve booking/payment event tracking.
- P2: verify the social profiles and business contact details; this task reused existing details, not independently verified identities.
- P2: neighborhood content remains backend-managed and published URLs are preserved. Review duplicate/thin locality content before expanding it; no mass generation was added.
- P2: verify field performance after deployment. Keep the existing head-metadata/GTM-verification compatibility setting unless Search Console verification is re-tested before changing metadata streaming behavior.
- FAQ content is visible and useful; no new FAQ rich-result claim is made. Google has changed FAQ rich-result eligibility, and adding schema does not guarantee search enhancements. See [Search documentation updates](https://developers.google.com/search/updates).

## Production deployment checklist

1. Obtain explicit approval to commit/push; deploy the frontend only. No backend deployment, database import or migration is needed.
2. Firebase App Hosting must use the correct reachable NEXT_PUBLIC_API_BASE_URL at build and runtime, plus the existing Firebase/payment configuration. Do not deploy a build using localhost.
3. Confirm apex HTTPS redirects, www-to-apex redirect, and custom-domain mapping. Existing www redirect is preserved; hosting-level HTTP-to-HTTPS behavior needs a production check.
4. Request homepage, services, an actual category/package, both new city pages and one existing city/area URL. Check title, description, one H1, self canonical, prices and meaningful HTML with JS disabled.
5. Request a deliberately nonexistent service and unknown city/area URL: expect HTTP 404 and noindex. An API outage should be a server failure rather than a permanent not-found signal.
6. Fetch robots.txt and sitemap.xml. Private page shells should be crawlable but noindex; sitemap should contain approved public URLs only, no queries/private URLs or invented dates. Compare all returned service pages with the sitemap.
7. Verify login, profile, admin, bookings, cart, payment and booking-success noindex. Smoke-test ordinary booking/auth/payment/admin journeys before routing production traffic broadly.
8. Inspect mobile menu, category grid, location changes, package/cart controls and review dialogs on actual devices. Check console errors and layout shift.
9. Validate relevant Service/Organization/Breadcrumb JSON-LD with Schema.org and Google Rich Results Test. LocalBusiness lacks a verified street address; do not fabricate one to satisfy a validator.
10. Use Tag Assistant and GA4 DebugView to verify one page_view per navigation; preserve transaction/booking events and the required GTM verification snippets.

## Google Search Console steps

1. Use the already verified production property; prefer a DNS-verified domain property if all host variants are managed. No verification credentials were changed.
2. Submit `https://purplesquad.in/sitemap.xml` after rollout. Confirm successful fetch and discovered URLs, not merely submission acceptance.
3. URL Inspection → Test live URL for homepage and all five requested city targets. Inspect rendered HTML, canonical and crawl permissions; request indexing only for ready, substantive pages.
4. Inspect a login/admin URL to confirm Excluded by noindex, and a missing service to confirm genuine Not found. robots.txt changes must allow Google to read noindex.
5. Monitor Page indexing for soft 404s, duplicate canonicals and server errors. Review Google-selected canonical versus declared canonical.
6. Check Core Web Vitals, mobile rendering and structured-data reports as data becomes available. Sitemap submission, structured data and indexing requests do not guarantee rankings.

## Next 30 days

- Days 1–3: deploy after approval, run the checklist, validate schema and tracking, submit sitemap and inspect the five city URLs.
- Days 4–10: confirm business coverage, audit Google Business Profile details against the site, investigate indexing/404/API errors and review real customer feedback moderation.
- Days 11–20: improve distinct service explanations and FAQs from technicians/customer questions; review locality pages for duplication. Add pages only where availability and useful original content are established.
- Days 21–30: review Search Console queries/impressions/clicks and field Core Web Vitals, prioritize measured bottlenecks and revise relevant internal links. Avoid promises of specific ranking gains.

Reference: Google requires noindex pages to remain crawlable to observe the directive; [official guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing). Existing self-controlled reviews do not automatically qualify for review rich results; [official guidance](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful).
