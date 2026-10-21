import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({ env: { apiBaseUrl: "https://backend.example" } }));
import { getAllServicesForSeo, getServiceDetailForSeo, getSitemapCatalogue, getServicesForSeo, getSeoLandingPageForSeo, getSeoLandingPagesForSeo } from "./server";

afterEach(() => vi.unstubAllGlobals());

describe("server catalogue discovery", () => {
  it("propagates listing and build-discovery failures rather than returning empty success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(getServicesForSeo()).rejects.toThrow("503");
    await expect(getSeoLandingPagesForSeo()).rejects.toThrow("503");
    await expect(getSeoLandingPageForSeo("tv-repair-chennai")).rejects.toThrow("503");
  });
  it("rejects network failures and invalid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network failed")));
    await expect(getServicesForSeo()).rejects.toThrow("Network failed");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not JSON", { status: 200 })));
    await expect(getSitemapCatalogue()).rejects.toThrow();
  });
  it("follows every service page and deduplicates overlapping IDs", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ results: [{ id: "1", slug: "ac" }], next: "https://untrusted.example/next" }))
      .mockResolvedValueOnce(Response.json({ results: [{ id: "1", slug: "ac" }, { id: "2", slug: "washing" }], next: null }));
    vi.stubGlobal("fetch", fetcher);
    expect(await getAllServicesForSeo()).toHaveLength(2);
    expect(String(fetcher.mock.calls[1][0])).toBe("https://backend.example/api/v1/services/?page_size=100&page=2");
  });
  it("does not publish partial pagination after an upstream failure", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ results: [{ id: "1" }], next: "next" }))
      .mockResolvedValueOnce(new Response(null, { status: 503 })));
    await expect(getAllServicesForSeo()).rejects.toThrow("503");
  });
  it("distinguishes missing services from server failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    expect(await getServiceDetailForSeo("missing")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(getServiceDetailForSeo("available")).rejects.toThrow("500");
  });
  it("resolves Coimbatore locality pages using active area and city/PIN service intersection", async () => {
    const washing = { id: "washing", slug: "washing-machine-repair-service", name: "Washing Machine Repair Inspection Charge", category: { slug: "washing-machine-services" } };
    const ac = { id: "ac", slug: "ac-inspection", name: "AC Inspection", category: { slug: "ac-services" } };
    const area = { name: "Coimbatore Central", city: "Coimbatore", postal_code: "641001", localities: [{ name: "Coimbatore Central", slug: "coimbatore-central" }] };
    const fetcher = vi.fn(async (input: URL) => {
      if (input.pathname.startsWith("/api/v1/seo-pages/")) return new Response(null, { status: 404 });
      if (input.pathname === "/api/v1/service-areas/") return Response.json([area]);
      if (input.pathname === "/api/v1/services/") return Response.json({ results: input.searchParams.has("postal_code") ? [washing] : [washing, ac], next: null });
      return new Response(null, { status: 404 });
    });
    vi.stubGlobal("fetch", fetcher);
    const page = await getSeoLandingPageForSeo("washing-machine-repair-coimbatore/coimbatore-central");
    expect(page?.postal_code).toBe("641001");
    expect(page?.services.map((service) => service.id)).toEqual(["washing"]);
    expect(page?.is_indexable).toBe(false);
    expect(fetcher.mock.calls.some(([url]) => url.searchParams.get("postal_code") === "641001")).toBe(true);
  });
  it("does not invent a Coimbatore locality page for an unsupported area", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => input.pathname === "/api/v1/service-areas/" ? Response.json([]) : new Response(null, { status: 404 })));
    expect(await getSeoLandingPageForSeo("washing-machine-repair-coimbatore/unknown")).toBeNull();
  });
  it("does not show a Coimbatore page when its service is unavailable in that PIN", async () => {
    const area = { name: "RS Puram", city: "Coimbatore", postal_code: "641002", localities: [] };
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => {
      if (input.pathname.startsWith("/api/v1/seo-pages/")) return new Response(null, { status: 404 });
      if (input.pathname === "/api/v1/service-areas/") return Response.json([area]);
      if (input.pathname === "/api/v1/services/") return Response.json({ results: input.searchParams.has("postal_code") ? [] : [{ id: "washing", name: "Washing Machine Repair", slug: "washing-machine-repair-service", category: { slug: "washing-machine-services" } }], next: null });
      return new Response(null, { status: 404 });
    }));
    expect(await getSeoLandingPageForSeo("washing-machine-repair-coimbatore/rs-puram")).toBeNull();
  });
  it("resolves published page packages for image discovery, excluding private/non-indexable pages", async () => {
    const page = { page_slug: "tv-repair-chennai", path: "/tv-repair-chennai", city: "Chennai", is_indexable: true };
    const service = { id: "tv", slug: "tv-repair", name: "TV Repair", category: { slug: "appliances" }, cover_image: null };
    const fetcher = vi.fn(async (input: URL) => {
      if (input.pathname === "/api/v1/services/") return Response.json({ results: [service], next: null });
      if (input.pathname === "/api/v1/service-categories/") return Response.json([]);
      if (input.pathname === "/api/v1/service-areas/") return Response.json([]);
      if (input.pathname === "/api/v1/seo-pages/") return Response.json([page, { ...page, page_slug: "hidden-chennai", path: "/hidden-chennai", is_indexable: false }]);
      if (input.pathname === "/api/v1/seo-pages/tv-repair-chennai/") return Response.json({ ...page, area_slug: "", postal_code: "", related_pages: [], services: [service] });
      return new Response(null, { status: 404 });
    });
    vi.stubGlobal("fetch", fetcher);
    const catalogue = await getSitemapCatalogue();
    expect(catalogue.pages).toEqual([{ ...page, area_slug: "", postal_code: "", related_pages: [], services: [service] }]);
    expect(fetcher.mock.calls.some(([url]) => url.pathname.includes("hidden-chennai"))).toBe(false);
  });
});
