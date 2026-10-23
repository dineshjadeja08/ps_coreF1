import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SeoLandingPage } from "@/types/api";

const { getSeoLandingPageForSeo, getSeoLandingPagesForSeo } = vi.hoisted(() => ({
  getSeoLandingPageForSeo: vi.fn(),
  getSeoLandingPagesForSeo: vi.fn(),
}));

vi.mock("@/features/catalogue/server", () => ({
  getSeoLandingPageForSeo,
  getSeoLandingPagesForSeo,
}));

import { generateMetadata, generateStaticParams } from "./page";

const page = {
  page_slug: "ac-service-chennai/velachery",
  path: "/ac-service-chennai/velachery",
  service_name: "AC Service",
  city: "Chennai",
  area: "Velachery",
  postal_code: "600042",
  is_indexable: true,
  meta_title: "AC Service in Velachery, Chennai | Purple Squad",
  meta_description: "Book AC service in Velachery with Purple Squad.",
  canonical_override: "https://purplesquad.in/ac-service-chennai/velachery",
  services: [{ name: "AC Inspection", slug: "ac-service", landing_thumbnail: "/images/services/ac-inspection.png" }],
} as SeoLandingPage;

describe("SEO landing route metadata", () => {
  beforeEach(() => {
    getSeoLandingPageForSeo.mockReset();
    getSeoLandingPagesForSeo.mockReset();
  });

  it("uses backend metadata, canonical and indexability", async () => {
    getSeoLandingPageForSeo.mockResolvedValue(page);

    const metadata = await generateMetadata({
      params: Promise.resolve({ serviceSlug: "ac-service-chennai", areaSlug: ["velachery"] }),
    });

    expect(getSeoLandingPageForSeo).toHaveBeenCalledWith("ac-service-chennai/velachery");
    expect(metadata.title).toBe("AC Service in Velachery, Chennai");
    expect(metadata.alternates).toEqual({ canonical: page.canonical_override });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("noindexes missing routes", async () => {
    getSeoLandingPageForSeo.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ serviceSlug: "ac-service-chennai", areaSlug: ["not-real"] }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("prebuilds published city pages while preserving on-demand area routes", async () => {
    getSeoLandingPagesForSeo.mockResolvedValue([page, { ...page, page_slug: "ac-service-chennai", area: "" }]);

    await expect(generateStaticParams()).resolves.toEqual([
      { serviceSlug: "ac-service-chennai", areaSlug: [] },
    ]);
  });
});
