# Production SEO and image re-audit — 2026-10-09

Baseline: fetched origin/gcp_deployment, commit 380b0de. Push to gcp_deployment authorized after the audit; no deployment performed.

## Confirmed findings and fixes

- A nonexistent `/services/...` URL returned HTTP 200 with noindex because Next streamed its loading shell before notFound. Added public catalogue resource preflight in `src/proxy.ts`: missing resources return 404; upstream failure returns non-cacheable 503 with Retry-After and noindex. Valid resources continue rendering normally. Malformed and nested service slugs return 404.
- Catalogue and build-time landing-page discovery swallowed upstream failures as successful empty lists. `src/features/catalogue/server.tsx` now propagates these failures, preventing successful empty sitemap/build discovery. Optional reviews retain their graceful fallback.
- Whitespace-only image fields masked usable cover images. `src/lib/service-images.ts` and `service-detail-view.tsx` now trim these fields consistently before fallback selection.
- Sitemap URL deduplication used unnormalized URLs. `src/app/sitemap.ts` normalizes URLs, removes fragments, deduplicates normalized image references, and rejects additional known non-public hosts. Query parameters and percent encoding are preserved; XML escaping occurs once.
- Local pages whose canonical override points elsewhere are now omitted from sitemap discovery.

## Already working / live evidence

The live sitemap parsed as valid XML: 68 page entries, 58 pages with image entries, 136 image references and 30 unique image sources. All 30 sources returned HTTP 200 with image content types and no X-Robots-Tag, including Cloudinary uploads. Uploaded-image availability explains coverage; fallback images now extend discovery beyond the originally three uploaded service URLs. The current sitemap does not have only three image-bearing URLs.

Sample `/services/ac-installation` HTML returned 200 with 13 actual img elements and an apex self-canonical. Public service image rendering, alt text, image metadata, Open Graph and structured-data image selection were inspected; these already use discoverable URLs and existing descriptive fallback handling. `/login` returned noindex/nofollow without an inherited public canonical. robots.txt allows public pages/images and excludes API paths. No booking, payment, authentication, admin, environment or dependency changes were made.

## Files and regression coverage

- `src/app/sitemap.ts`, `src/app/sitemap.test.ts`: query-parameter XML escaping, fragment/relative-absolute duplicate normalization, private hosts and canonical overrides.
- `src/lib/service-images.ts`, `src/lib/service-images.test.ts`: missing and whitespace images, fallback selection.
- `src/features/catalogue/server.tsx`, `src/features/catalogue/server.test.ts`: backend HTTP/network/invalid-JSON failures rather than successful empty discovery.
- `src/features/catalogue/components/service-detail-view.tsx`: consistent trimmed image selection in rendered UI.
- `src/proxy.ts`, `src/proxy.test.ts`: actual missing-resource status, retryable backend failure, existing resources and matcher isolation from private/functionality routes.
- This report.

## Validation status

An intermediate complete run passed 165 tests in 41 files, typecheck, lint and production build. A subsequent rerun encountered ENOSPC and a matcher-test API mismatch. The test now uses the installed `unstable_doesMiddlewareMatch` export. After disk space became available, all 167 tests in 41 files, typecheck, lint and production build passed (52 pages, Proxy compiled). Automated generated-cache deletion was blocked; nothing was deleted.

## Remaining live checks

1. Local validation is complete; keep adequate free disk space for subsequent builds.
2. After an approved deployment, verify valid service/local URLs return 200; nonexistent and malformed URLs return actual 404, not streamed 200; simulated public API failure returns 503 rather than empty 200/false 404. Proxy preflight cannot guarantee status for an API failure occurring later during streaming.
3. Verify Proxy execution on the production hosting adapter, private-route exclusion and extra API lookup latency. Non-Chennai catch-all URLs outside its matcher also need status checks.
4. Recheck live sitemap XML, query-bearing image URLs, canonical targets, Cloudinary headers and optimized `/_next/image` responses. Accessible raw image URLs do not prove optimizer configuration or Googlebot access.
5. Use Search Console URL Inspection/rendered HTML for representative service/category/local pages, resubmit sitemap and monitor Image search indexing. Indexing is Google's decision; source accessibility is not an indexing guarantee.
