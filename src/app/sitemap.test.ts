import { describe, expect, it, vi } from "vitest";

const { catalogue } = vi.hoisted(() => ({ catalogue: vi.fn() }));
vi.mock("@/features/catalogue/server", () => ({ getSitemapCatalogue: catalogue }));
import sitemap from "./sitemap";

describe("production sitemap", () => {
  it("includes valid categories/services and published landing pages without fabricated dates", async () => {
    catalogue.mockResolvedValue({
      categories: [{ slug: "ac-services" }],
      services: [{ slug: "ac-service", updated_at: "2026-09-01T00:00:00Z" }, { slug: "ac-service" }, { slug: "../admin" }],
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
});
