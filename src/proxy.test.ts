import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ categories: vi.fn(), detail: vi.fn(), page: vi.fn() }));
vi.mock("@/features/catalogue/server", () => ({ getServiceCategoriesForSeo: mocks.categories, getServiceDetailForSeo: mocks.detail, getSeoLandingPageForSeo: mocks.page }));
import { config, proxy } from "./proxy";

describe("pre-streaming public resource validation", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.categories.mockResolvedValue([]); });
  it("returns an actual 404 for a missing service, before rendering begins", async () => {
    mocks.detail.mockResolvedValue(null);
    const response = await proxy(new NextRequest("https://purplesquad.in/services/does-not-exist"));
    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
  });
  it("allows existing services and categories without interfering with query parameters", async () => {
    mocks.detail.mockResolvedValue({ slug: "tv" });
    expect((await proxy(new NextRequest("https://purplesquad.in/services/tv?utm_source=test"))).headers.get("x-middleware-next")).toBe("1");
    mocks.categories.mockResolvedValue([{ slug: "cleaning" }]);
    expect((await proxy(new NextRequest("https://purplesquad.in/services/cleaning"))).status).toBe(200);
  });
  it("returns retryable 503, not 404 or successful empty HTML, on backend failure", async () => {
    mocks.categories.mockRejectedValue(new Error("Backend unavailable"));
    const response = await proxy(new NextRequest("https://purplesquad.in/services/tv"));
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("30");
  });
  it("rejects missing/empty local pages and allows resolved pages", async () => {
    mocks.page.mockResolvedValue(null);
    expect((await proxy(new NextRequest("https://purplesquad.in/tv-repair-chennai/unknown"))).status).toBe(404);
    mocks.page.mockResolvedValue({ page_slug: "tv-repair-chennai", services: [{}] });
    expect((await proxy(new NextRequest("https://purplesquad.in/tv-repair-chennai"))).status).toBe(200);
  });
  it("does not query the backend or alter private routes/assets", async () => {
    for (const path of ["/login", "/admin", "/book/pay/id", "/api/test", "/_next/image", "/images/services/ac.png"]) expect((await proxy(new NextRequest(`https://purplesquad.in${path}`))).headers.get("x-middleware-next")).toBe("1");
    expect(mocks.categories).not.toHaveBeenCalled();
    expect(mocks.page).not.toHaveBeenCalled();
  });
  it("matches public service resources only in Next's actual matcher", () => {
    for (const url of ["/services/tv", "/services/tv/nested", "/ac-service-chennai", "/ac-service-chennai/velachery"]) expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
    for (const url of ["/services", "/login", "/admin", "/book/pay/id", "/api/test", "/_next/image?url=/images/tv.png", "/images/services/ac.png"]) expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });
  it("rejects malformed and nested service paths without sending user-controlled path syntax upstream", async () => {
    for (const path of ["/services/tv/nested", "/services/tv%2Fother", "/services/%E0%A4"]) expect((await proxy(new NextRequest(`https://purplesquad.in${path}`))).status).toBe(404);
    expect(mocks.categories).not.toHaveBeenCalled();
  });
});
