import { NextResponse, type NextRequest } from "next/server";

import { getSeoLandingPageForSeo, getServiceCategoriesForSeo, getServiceDetailForSeo } from "@/features/catalogue/server";

function unavailable(status: 404 | 503) {
  const title = status === 404 ? "Page not found" : "Service temporarily unavailable";
  return new NextResponse(`<!doctype html><html lang="en"><head><title>${title} | Purple Squad</title><meta name="robots" content="noindex"></head><body><h1>${title}</h1><p>Please try again or <a href="/services">browse our services</a>.</p></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...(status === 503 ? { "Retry-After": "30" } : {}) },
  });
}

// Validate resources before the root loading boundary can stream HTTP 200.
// Match public catalogue pages only: never auth/admin, checkout, APIs or images.
export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  try {
    if (segments[0] === "services" && segments.length >= 2) {
      if (segments.length > 2) return unavailable(404);
      const slug = decodeURIComponent(segments[1]);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return unavailable(404);
      const categories = await getServiceCategoriesForSeo();
      if (slug === "ac-services" || categories.some((category) => category.slug === slug)) return NextResponse.next();
      return await getServiceDetailForSeo(slug) ? NextResponse.next() : unavailable(404);
    }
    if (segments[0]?.endsWith("-chennai")) {
      if (segments.length > 2) return unavailable(404);
      const slug = segments.map(decodeURIComponent).join("/");
      if (!slug.split("/").every((segment) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))) return unavailable(404);
      const page = await getSeoLandingPageForSeo(slug);
      return page?.page_slug === slug && page.services.length ? NextResponse.next() : unavailable(404);
    }
    return NextResponse.next();
  } catch (error) {
    // Upstream errors are retryable failures, not permanent missing resources.
    return unavailable(error instanceof URIError ? 404 : 503);
  }
}

export const config = { matcher: ["/services/:slug/:rest*", "/:serviceSlug([a-z0-9-]+-chennai)/:areaSlug*"] };
