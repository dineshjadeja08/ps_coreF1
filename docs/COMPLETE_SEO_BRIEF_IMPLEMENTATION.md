# Complete SEO brief implementation — 11 October 2026

Source: Purple_Squad_Complete_SEO_Developer_Brief.pdf (six pages). No push, deployment, account configuration or backend mutation performed.

## Implemented website changes

- Homepage title and social titles now use `Home Appliance Services in Chennai | Purple Squad`.
- AC service, washing-machine repair and refrigerator repair city pages have clear titles/H1s, distinct customer-focused guidance and package-scope explanations. Published intro text and canonical overrides are retained. Area-level content is not rewritten by this enhancement.
- These three primary routes can resolve from the Chennai availability-filtered catalogue if the backend page is missing. A route is not created without matching available packages. No speculative ₹299 starting-price claim is added.
- Contact/support has explicit unique metadata and a self-canonical.
- Service provider structured data references the existing Organization entity consistently.
- Original `/guides/ac-maintenance` and `/guides/washing-machine-care` content, a guide index, footer links, breadcrumbs, canonical metadata and sitemap entries were added. These are care/booking guidance, not unverified case studies or electrical repair instructions.
- Privacy-safe conversion events: `phone_click`, `whatsapp_click`, `begin_checkout`, `booking_created`. Contact measurement uses one delegated listener with cleanup; admin/technician pages are excluded. Booking creation is recorded only after the creation API succeeds. Session/in-memory deduplication prevents repeated keyed events. No customer names, phone numbers, addresses, notes, booking IDs or URL query strings are sent in these event parameters. Failures do not affect user actions.
- Existing sitemap escaping, pagination, image fallbacks, real 404/503 resource checks, noindex for private routes and canonical handling are retained.

## Keyword-to-primary-page mapping

Keep existing URLs; no mass location-page campaign or URL renaming is introduced. Live backend catalogue and city-page listing were checked read-only on 11 October 2026.

| Search intent | Primary landing page |
| --- | --- |
| Purple Squad / Purple Squad Chennai | `/` |
| AC service Chennai / cleaning / gas refill / installation | `/ac-service-chennai` |
| AC repair Chennai | `/ac-repair-chennai` |
| Washing machine repair / service Chennai | `/washing-machine-repair-chennai` |
| Refrigerator / fridge repair Chennai | `/refrigerator-repair-chennai` |
| Water purifier / RO service Chennai | `/water-purifier-service-chennai` |
| Geyser repair Chennai | `/services/geyser-repair-services` |
| Geyser installation Chennai | `/services/geyser-installation` |
| Kitchen chimney inspection/service | `/services/chimney-cleaning-services` (live package is Chimney Inspection; do not promise cleaning inclusions beyond published package details) |
| Water tank / sump cleaning Chennai | `/water-tank-cleaning-chennai` |
| TV repair Chennai | `/services/tv-repair-services` |
| TV wall mount installation | `/services/tv-wall-mount-installation` |
| CCTV repair / installation | `/services/cctv-cameras-repair-installation` |
| Microwave repair | `/services/microwave-oven-repair-services` |
| Dishwasher repair | `/services/dishwasher-repair-service` |
| Home cleaning | `/services/full-house-cleaning` |
| Sofa repair / mosquito net | Keep current package routes; confirm each service's precise inclusions before expanding claims. |

Existing service-package pages keep their useful own canonicals rather than redirecting every package to a city hub. Do not create competing city hubs solely to repeat keywords.

## Live baseline and remaining acceptance work

- Live `https://purplesquad.in/sitemap.xml` returned HTTP 200 and parsed as XML with 68 URLs before these changes. It does not currently need an unrelated rewrite.
- Live backend publishes AC, washing-machine, refrigerator and water-purifier primary city pages. An indexable API flag or sitemap entry is not evidence that Google has indexed a URL.
- Search Console account work remains: verify property, submit **sitemap.xml**, inspect main pages individually, request indexing where appropriate, check exclusions/manual actions/security. Do not submit landing-page URLs as sitemap files.
- Keep current served-area routes. The business must confirm real coverage and supply distinct local information for Tambaram, Velachery, Pallavaram, Guduvancheri, Kelambakkam, Guindy, Avadi, St. Thomas Mount and Padur. No new location claims or identical area-swapped pages were created.
- Business Profile eligibility, categories, service areas, real hours/photos, review outreach and partnerships require business-owner action. Existing public testimonials are not newly certified as genuine. No fabricated reviews, addresses, rankings or guarantees were added.
- GA4 destination remains the site's existing `G-MKP0Z20TV5`; confirm property access/ownership. Use Tag Assistant/DebugView to check each event once and check that the existing GTM container does not also fire duplicate GA4 tags. This repo cannot inspect the published GTM container.
- `booking_created` measures successful creation, not payment, technician completion or revenue. Actual completed-service conversions and refunds require authoritative backend status reporting. No `purchase` event or invented revenue was added.
- There is no public customer lead-submission form in the inspected flow; do not count admin lead creation as an organic lead. Track genuine public lead submissions when that flow exists.
- Organic landing sessions/acquisition are measured by existing GA4 page views; check enhanced measurement and SPA navigation live rather than adding competing page-view calls. Report organic and Ads separately.
- Monthly reporting should use Search Console clicks, impressions, CTR and position plus GA4 organic sessions and booking-created events. Join actual fulfilled booking counts server-side with consent-safe attribution; this frontend does not claim to calculate monthly revenue or fulfilment.
- After approved deployment, check valid/missing routes, rendered H1/metadata/images, guide links, XML parsing, Rich Results/schema validation, real mobile usability and field Core Web Vitals. Googlebot accessibility and rankings need live monitoring.

## Validation

179 tests in 44 files, typecheck and lint passed. Production build passed and generated 55 pages, including both guides. The final footer and tracker changes also passed targeted lint; the production build completed TypeScript validation. Tests cover availability-gated primary pages, preserving locality metadata, no invented prices, conversion deduplication/privacy/failure isolation, and guide allowlisting. Build uses the deployed API temporarily in the process environment; `.env.local` is not changed.

Reference: Google Analytics recommended events https://developers.google.com/analytics/devguides/collection/ga4/reference/events and Google's doorway-page guidance https://developers.google.com/search/blog/2015/03/an-update-on-doorway-pages. No ranking or rich-result guarantee is implied.
