import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { getCategoryVisualSrc, resolveServiceImage, serviceHeroImage, servicePageImages } from "./service-images";
import { serviceJsonLd } from "./seo";
import type { ServiceListItem } from "@/types/api";

describe("shared image discovery", () => {
  it("prefers uploads, then existing bundled artwork, then existing stock fallback", () => {
    expect(resolveServiceImage("https://res.cloudinary.com/demo/image/upload/ac.png", "AC Installation").src).toContain("cloudinary.com");
    expect(resolveServiceImage(null, "AC Installation").src).toBe("/images/services/ac-installation.png");
    expect(resolveServiceImage("", "Unknown service").isFallback).toBe(true);
    expect(resolveServiceImage(null, "CCTV repair").src).toBe("/images/services/cctv.png");
    expect(resolveServiceImage(null, "Dishwasher Repair").src).toBe("/images/services/dishwasher.png");
  });
  it("keeps hero and package images aligned with schema and excludes popup-only imagery", () => {
    const service = { name: "AC Inspection", slug: "ac", category: { name: "AC" }, effective_price: 299, landing_thumbnail: "/images/services/ac-service.png", list_image: "/images/services/ac-inspection.png", popup_cover_image: "/popup-only.png" } as ServiceListItem;
    expect(servicePageImages(service)).toEqual([service.landing_thumbnail, service.list_image]);
    expect(serviceJsonLd(service, "/services/ac").image).toBe(`https://purplesquad.in${serviceHeroImage(service)}`);
  });
  it("uses existing files for bundled service/category fallbacks", () => {
    for (const label of ["AC Inspection", "AC Installation", "AC Chemical Wash", "AC Gas Refill", "Washing Machine", "Refrigerator", "TV Repair", "CCTV", "Chimney", "Water Tank", "Mosquito", "Sofa"]) {
      const src = resolveServiceImage(null, label).src;
      expect(existsSync(join(process.cwd(), "public", src)), src).toBe(true);
    }
    expect(getCategoryVisualSrc({ name: "Cleaning", slug: "cleaning" })).toBe("/images/categories/cleaning.png");
  });
  it("treats whitespace slots as missing instead of masking usable covers", () => {
    const service = { name: "TV Repair", landing_thumbnail: "  ", list_image: "\n", cover_image: "https://res.cloudinary.com/demo/image/upload/tv.png?a=1&b=2" };
    expect(serviceHeroImage(service)).toBe(service.cover_image);
    expect(servicePageImages(service)).toEqual([service.cover_image]);
    expect(resolveServiceImage("  ", "TV Repair").src).toBe("/images/services/tv.png");
  });
});
