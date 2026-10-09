# Purple Squad Google Images audit

Date: 9 October 2026. Repository: ps_coreF1. Local branch `codex/gcp-deployment` started at the same commit as remote `gcp_deployment` (`bcedc8d`). No commit, push, deployment, backend change, dependency change or env-file change is included in this task.

## Why only three service URLs had sitemap images

The public API returned 40 services. Only `ac-service`, `washing-machine-repair-service`, and `refrigerator-repair-services` had a non-empty `cover_image`. The live sitemap's three image-bearing URLs matched those exact records.

The previous sitemap used only `service.cover_image`. The UI has a separate image selection chain: uploaded landing/list images, then bundled service artwork, then existing stock imagery. Most services therefore displayed real images despite having no cover upload. Those images, category images and localized-page images were absent from the sitemap. This is a discovery mismatch, not evidence that Cloudinary blocks Google or that Google has indexed only three images.

## Findings and changes

| Priority | Finding | Resolution |
| --- | --- | --- |
| P1 | Sitemap ignored bundled service images and landing/list uploads | Share image selection with rendering; include the hero and package imagery actually used, plus covers/category thumbnails displayed on `/services` |
| P1 | Categories and published local pages lacked image entries | Include category/package imagery; resolve local-page service data with bounded batches of eight upstream requests |
| P1 | Metadata/schema used an uploaded cover or generic brand image while the hero used a different image | Service and local-page social previews and Service schema now use the shared hero resolver; category previews use relevant displayed imagery |
| P1 | Uploaded-image onError never changed state if a local match existed | Switch failed uploads to existing local artwork regardless of a matching local image |
| P1 | Installed Next 16.3.5 sitemap serializer inserts raw image URLs into XML | Escape XML special characters once after deduplication. Real generated XML originally failed parsing when Unsplash query URLs were included; added installed-serializer regression coverage |
| P2 | Duplicate page entries could overwrite earlier image lists | Merge and deduplicate images while preserving genuine modification dates |
| P2 | Dishwasher matched the earlier generic `washer` keyword | Resolve dishwasher artwork before washing-machine artwork |
| P2 | Generic stock fallback replaced contextual alt with a generic label | Preserve the caller's contextual alt; use a separate stable fallback label for service hero selection |
| P2 | Tiny category images had no explicit sizes hint | Add `sizes="36px"` without changing layout or the existing unoptimized policy |

Do not submit popup-only images as if they were visible initial-page content. The public catalogue does not expose the admin gallery as a public gallery; no private/admin imagery was added to the sitemap. The same image may legitimately appear on more than one relevant service page; URLs are deduplicated within each page, not removed across all pages.

## Rendering, accessibility and optimizer audit

- ServiceImage is a Client Component but is still rendered into initial HTML. The live `/services/ac-installation` response contained `<img>` elements for its local service image and Cloudinary package imagery. A client component declaration alone is not an indexing blocker.
- Existing Next Image `fill` uses sized/aspect-ratio containers; native lazy loading and eager hero behavior are preserved. Cloudinary and Unsplash are already permitted by remotePatterns. No configuration change is needed just because the public image URL has no file extension: the checked sources return image content types.
- Built city-page HTML has actual img src/srcset, contextual alt, responsive sizes, corresponding Open Graph images and index/follow metadata. Unit tests also verify image rendering without hydration.
- Category sidebar thumbnails intentionally have empty alt because the adjacent link text supplies the accessible category name. These are decorative repetitions, not missing descriptive alt on a content image. Service/package image alt remains meaningful; no keyword stuffing was added.
- Direct category/banner remote images retain their existing unoptimized behavior. This is not a Google Images blocker when the source is publicly crawlable. Do not globally disable optimization merely to change image sitemap behavior.
- The sampled live HTML uses raw local/CDN image URLs. A separate direct request to `/_next/image?url=%2Fimages%2Fservices%2Fac-installation.png&w=828&q=75` returned 404. The repository's production build emits optimizer URLs. The deployed adapter/build/routing behavior differs and needs post-deployment inspection; this observation does not establish that currently rendered images are broken. No hosting settings were changed without further evidence.

## Public read-only checks

- Live sitemap: the original three image entries were confirmed from actual XML.
- Eleven distinct uploaded Cloudinary cover, landing, list and category sources: HTTP 200, image/png or image/jpeg, no X-Robots-Tag.
- Representative bundled service, category and default OG images: HTTP 200, image content type, no X-Robots-Tag.
- Production robots.txt: wildcard Allow `/`, Disallow `/api/`; neither `/images/` nor `/_next/image` is blocked. No explicit Googlebot-Image exclusion was found. Existing private-page noindex remains unchanged.
- Cloudinary robots.txt: HTTP 200; its displayed blanket-disallow example is commented out, not an active rule.
- All unique source URLs discovered by the built sitemap were checked with HEAD. Counts and final generated XML results are recorded below. HEAD accessibility is not proof of Googlebot indexing or of authenticated Search Console status.

## Exact changed files

| Files | Purpose |
| --- | --- |
| `src/lib/service-images.ts` | Shared existing artwork map, upload/local/stock resolver and hero/list/category selection |
| `src/features/catalogue/components/service-image.tsx` | Consume shared resolver, preserve alt and fix upload error fallback |
| `src/features/catalogue/components/service-detail-view.tsx` | Stable service-name fallback selection separate from contextual hero alt |
| `src/features/catalogue/components/services-listing.tsx` | Reuse category resolver and specify 36px thumbnail sizes |
| `src/app/services/[slug]/page.tsx` | Relevant service/category OG and Twitter images; preserve canonical/404 behavior |
| `src/app/[serviceSlug]/[[...areaSlug]]/page.tsx` | Relevant local-page social image |
| `src/lib/seo.ts` | Service JSON-LD image matches rendered hero |
| `src/features/catalogue/server.tsx` | Resolve indexable local-page packages for sitemap images; bounded concurrency and Chennai category availability |
| `src/app/sitemap.ts` | Image discovery, public-URL validation, URL collision merging and XML-safe output |
| `src/lib/service-images.test.ts` | Image selection, existing-file checks, dishwasher precedence and schema alignment |
| `src/features/catalogue/components/service-image.test.tsx` | Real server HTML img/srcset, contextual alt and Cloudinary optimization |
| `src/features/catalogue/components/service-image-fallback.test.tsx` | Simulated failed-upload transition to local artwork |
| `src/app/services/[slug]/page.test.ts` | No-cover service social preview regression |
| `src/app/[serviceSlug]/[[...areaSlug]]/page.test.ts` | Realistic localized service fixture for image metadata |
| `src/app/sitemap.test.ts` | Uploaded/local/category/localized discovery, collision merging, public URLs and installed XML serializer |
| `src/features/catalogue/server.test.ts` | Published-page image data resolution and exclusion of non-indexable pages |
| `docs/GOOGLE_IMAGES_AUDIT.md` | Findings, evidence, verification and live handoff |

## Verification results

- `npm run lint`: passed with zero warnings.
- `npm run typecheck`: passed.
- `npm test --if-present`: 154 tests passed across 40 files.
- `npm run build`: passed, including TypeScript; 52 pages generated.
- Generated city HTML inspected for AC service, AC repair, washing-machine repair, refrigerator repair and water-tank cleaning: actual img elements, src/srcset, contextual hero alt, correct OG image and index/follow. Unit coverage verifies no-hydration rendering as well.
- Invoked the built sitemap route's GET directly against the existing public backend, then parsed its output with an XML parser: 68 page URLs, 58 image-bearing pages (40 services, six categories, 11 local pages and `/services`), 136 image references and 30 distinct sources. This is local built-route verification, not a deployed HTTP result or Google indexed-image count.
- All 30 distinct image source URLs returned HTTP 200 with image content types in the final HEAD check.
- `git diff --check`: passed. No booking, payment, authentication or admin business logic changed.

Builds use the existing reachable public backend through a command-only NEXT_PUBLIC_API_BASE_URL override; no env file was edited. During diagnostics, one PowerShell pipeline and one Node HTML-inspection command had shell syntax errors and were corrected. An attempt to inspect the built route during a build failed because Next had temporarily cleared `.next`; inspection succeeded after the build. Most importantly, actual XML parsing initially failed on unescaped CDN query parameters; that confirmed defect was fixed and the final XML parse passed. No tests or lint rules were disabled.

## Remaining live verification steps

1. After approval, commit/push and deploy the frontend only. No migration is required. Do not change payment, login, booking or admin settings for image SEO.
2. Fetch the deployed sitemap, parse it as XML and inspect image:loc on ordinary services, categories and city/locality URLs. Confirm ampersands decode to the original CDN query parameters.
3. Inspect raw HTML for a no-upload service, an uploaded service, a category and a local page. Check img src/srcset, alt, canonical, indexability, OG/Twitter and JSON-LD image alignment.
4. Request the exact src/srcset URLs actually emitted by the new deployed HTML, including optimizer URLs if present. Expect public 200 image responses without authentication or noindex headers. Investigate App Hosting routing/adapter configuration if emitted optimizer URLs return 404; do not assume the manually probed path proves the cause.
5. Test on mobile, with JS disabled, and with an intentionally unavailable uploaded image in a safe test environment. Verify fallback, layout stability, image loading and unchanged cart/booking/auth/payment/admin behavior.
6. In verified Search Console, resubmit `/sitemap.xml`, inspect representative pages and their crawled/rendered HTML, then monitor Search results with Search type = Image. Check indexing/crawl errors and CDN/image requests in logs. No Search Console account access or Googlebot crawl history was available during this task.
7. Check CDN robots and response headers again after any access-policy or delivery configuration changes. Prefer brand-owned, service-specific photos over generic stock imagery; no claim is made that existing artwork depicts an actual Purple Squad job.
8. Monitor mobile LCP/CLS and real optimizer/image errors after rollout. Crawlability, sitemap inclusion, social previews and schema do not guarantee Google Images indexing or rankings. Avoid repeated uploads/URL renames solely for SEO.

References: [Google image SEO](https://developers.google.com/search/docs/appearance/google-images), [Google image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), [Next Image](https://nextjs.org/docs/app/api-reference/components/image). Google discovers images from actual img src elements; image sitemaps supplement discovery and may contain public CDN URLs. Open Graph and schema are not substitutes for accessible image content.
