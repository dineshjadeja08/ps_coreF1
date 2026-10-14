import { beforeEach, describe, expect, it, vi } from "vitest";

const { categories, detail, services, notFound } = vi.hoisted(() => ({ categories: vi.fn(), detail: vi.fn(), services: vi.fn(), notFound: vi.fn(() => { throw new Error("HTTP 404"); }) }));
vi.mock("@/features/catalogue/server", () => ({ getServiceCategoriesForSeo: categories, getServiceDetailForSeo: detail, getServiceReviewsForSeo: vi.fn(), getServicesForSeo: services }));
vi.mock("next/navigation", async (original) => ({ ...await original<object>(), notFound }));

import Page, { generateMetadata } from "./page";

describe("service route resource validation", () => {
  beforeEach(() => { categories.mockResolvedValue([]); detail.mockReset(); services.mockReset().mockResolvedValue({ count: 0, next: null, previous: null, results: [] }); notFound.mockClear(); });
  it("rejects unknown slugs during metadata and page rendering", async () => {
    detail.mockResolvedValue(null);
    const props = { params: Promise.resolve({ slug: "not-a-service" }) };
    await expect(generateMetadata(props)).rejects.toThrow("HTTP 404");
    await expect(Page(props)).rejects.toThrow("HTTP 404");
  });
  it("does not mislabel a backend outage as a missing service", async () => {
    detail.mockRejectedValue(new Error("Catalogue request failed: 503"));
    await expect(Page({ params: Promise.resolve({ slug: "real-service" }) })).rejects.toThrow("503");
    expect(notFound).not.toHaveBeenCalled();
  });
  it("uses the rendered bundled hero for service social previews when cover_image is missing", async () => {
    detail.mockResolvedValue({ name: "TV Repair", slug: "tv-repair", short_description: "Repair your TV", cover_image: null });
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "tv-repair" }) });
    expect(metadata.openGraph).toMatchObject({ images: ["/images/services/tv.png"] });
    expect(metadata.twitter).toMatchObject({ images: ["/images/services/tv.png"] });
  });

  it("loads TV landing packages from the appliance category before filtering out unrelated services", async () => {
    await Page({ params: Promise.resolve({ slug: "tv-repair-services" }) });

    expect(services).toHaveBeenCalledWith({ category: "home-appliances-repair", page_size: 100, city: "Chennai" });
  });
});
