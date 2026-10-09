import { describe, expect, it, vi } from "vitest";
import { resolveSitemap } from "next/dist/build/webpack/loaders/metadata/resolve-route-data";

const { catalogue } = vi.hoisted(() => ({ catalogue: vi.fn() }));
vi.mock("@/features/catalogue/server", () => ({ getSitemapCatalogue: catalogue }));
import sitemap from "./sitemap";

describe("production sitemap", () => {
  it("includes valid categories/services and published landing pages without fabricated dates", async () => {
    catalogue.mockResolvedValue({
      categories: [{ slug: "ac-services" }],
      services: [{ name: "AC Inspection", slug: "ac-service", updated_at: "2026-09-01T00:00:00Z" }, { name: "AC Inspection", slug: "ac-service" }, { name: "Invalid", slug: "../admin" }],
      pages: [
        { city: "Chennai", path: "/ac-service-chennai", page_slug: "ac-service-chennai", is_indexable: true, updated_at: "2026-09-02T00:00:00Z" },
        { city: "Chennai", path: "/ac-service-chennai/velachery", page_slug: "ac-service-chennai/velachery", is_indexable: true },
        { city: "Chennai", path: "/hidden-chennai", page_slug: "hidden-chennai", is_indexable: false },
        { city: "Chennai", path: "https://evil.example", page_slug: "evil", is_indexable: true },
      ],
    });
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://purplesquad.in/services/ac-services");
    expect(urls).toContain("https://purplesquad.in/ac-service-chennai/velachery");
    expect(urls.some((url) => /hidden|evil|admin|\?/.test(url))).toBe(false);
    expect(entries.find((entry) => entry.url === "https://purplesquad.in/")?.lastModified).toBeUndefined();
    expect(entries.find((entry) => entry.url.endsWith("/ac-service-chennai"))?.lastModified).toBe("2026-09-02T00:00:00Z");
  });
  it("surfaces catalogue errors instead of returning a successful truncated sitemap", async () => {
    catalogue.mockRejectedValue(new Error("Catalogue unavailable"));
    await expect(sitemap()).rejects.toThrow("Catalogue unavailable");
  });
  it("discovers rendered local, uploaded, category and localized images and merges colliding URLs", async () => {
    const service = { name: "AC Inspection", slug: "ac-service", category: { slug: "ac-services" }, landing_thumbnail: "https://res.cloudinary.com/demo/image/upload/hero.png", list_image: "https://res.cloudinary.com/demo/image/upload/list.png", cover_image: null };
    catalogue.mockResolvedValue({ categories: [{ slug: "ac-services", name: "AC", image_url: "/images/categories/ac.png" }, { slug: "ac-service", name: "AC", image_url: "/images/categories/ac.png" }], services: [service, { name: "TV Repair", slug: "tv-repair", category: { slug: "appliances" }, cover_image: null }], pages: [{ city: "Chennai", path: "/ac-service-chennai", page_slug: "ac-service-chennai", is_indexable: true, services: [service] }] });
    const entries = await sitemap();
    expect(entries.find((entry) => entry.url.endsWith("/tv-repair"))?.images).toEqual(["https://purplesquad.in/images/services/tv.png"]);
    expect(entries.find((entry) => entry.url.endsWith("/ac-service"))?.images).toContain("https://purplesquad.in/images/categories/ac.png");
    expect(entries.find((entry) => entry.url.endsWith("/ac-service-chennai"))?.images).toEqual([service.landing_thumbnail, service.list_image]);
    expect(entries.find((entry) => entry.url.endsWith("/ac-services"))?.images).toContain(service.landing_thumbnail);
    expect(entries.find((entry) => entry.url.endsWith("/services"))?.images).toContain("https://purplesquad.in/images/services/ac-inspection.png");
  });
  it("excludes non-public and non-HTTP image sources", async () => {
    catalogue.mockResolvedValue({ categories: [], pages: [], services: [
      { name: "AC Installation", slug: "ac-installation", landing_thumbnail: "https://localhost/media/ac.png", list_image: "data:image/png;base64,example" },
    ] });
    expect((await sitemap()).find((entry) => entry.url.endsWith("/ac-installation"))?.images).toEqual([]);
  });
  it("serializes CDN query strings as valid XML text without double escaping", async () => {
    catalogue.mockResolvedValue({ categories: [], pages: [], services: [{ name: "Full House Cleaning", slug: "full-house-cleaning" }] });
    const xml = resolveSitemap(await sitemap());
    expect(xml).toContain("xmlns:image=");
    expect(xml).toContain("?auto=format&amp;fit=crop&amp;w=960&amp;q=80");
    expect(xml).not.toContain("&amp;amp;");
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
  });
});
