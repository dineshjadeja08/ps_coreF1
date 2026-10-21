import { describe, expect, it } from "vitest";
import type { ServiceListItem } from "@/types/api";
import { buildCoimbatorePage, buildLocalAreaPage, buildLocalCityPage, enhancePrimaryCityPage, localServiceFamilyLinks } from "./local-seo";

const service = (name: string, slug: string) => ({ id: slug, name, slug, category: { slug: "appliances" } }) as ServiceListItem;

describe("verified city landing pages", () => {
  it.each([
    ["ac-service-chennai", "AC Installation", "ac-installation", "AC Service"],
    ["washing-machine-repair-chennai", "Washing Machine Inspection", "washing-machine-inspection", "Washing Machine Repair"],
    ["refrigerator-repair-chennai", "Refrigerator Inspection", "refrigerator-inspection", "Refrigerator Repair"],
  ])("resolves %s only from actually available packages, without inventing a starting price", (slug, name, packageSlug, label) => {
    expect(buildLocalCityPage(slug, [])).toBeNull();
    expect(buildLocalCityPage(slug, [service("TV Repair", "tv-repair")])).toBeNull();
    const page = buildLocalCityPage(slug, [service(name, packageSlug)]);
    expect(page?.h1).toBe(`${label} in Chennai`);
    expect(page?.meta_title).not.toContain("299");
    expect(page?.services).toHaveLength(1);
  });
  it("preserves area-specific content and canonical settings when enriching city copy", () => {
    const page = buildLocalCityPage("ac-service-chennai", [service("AC Inspection", "ac-inspection")])!;
    const enriched = enhancePrimaryCityPage({ ...page, intro_content: "Published information.", canonical_override: "/ac-service-chennai" });
    expect(enriched.intro_content).toContain("Published information.");
    expect(enriched.canonical_override).toBe(page.path);
    expect(enhancePrimaryCityPage({ ...page, area: "Velachery", h1: "Local title" }).h1).toBe("Local title");
    expect(enhancePrimaryCityPage(page).intro_content).toBe(page.intro_content);
  });
  it("creates AC repair content only when an available inspection/repair service exists", () => {
    expect(buildLocalCityPage("ac-repair-chennai", [])).toBeNull();
    const page = buildLocalCityPage("ac-repair-chennai", [service("AC Inspection", "ac-inspection"), service("AC Installation", "ac-installation")]);
    expect(page?.services).toHaveLength(1);
    expect(page?.h1).toBe("AC Repair in Chennai");
    expect(page?.updated_at).toBe("");
  });
  it("keeps unsupported service families and malformed area routes unavailable", () => {
    expect(buildLocalCityPage("ac-repair-chennai/anna-nagar", [service("AC Repair", "ac-repair")])).toBeNull();
    expect(buildLocalCityPage("constructor", [])).toBeNull();
  });
  it("matches water tank and sump packages without unrelated cleaning services", () => {
    const page = buildLocalCityPage("water-tank-cleaning-chennai", [service("Sump Cleaning", "sump-cleaning"), service("Sofa Cleaning", "sofa-cleaning")]);
    expect(page?.services.map((service) => service.slug)).toEqual(["sump-cleaning"]);
  });

  it.each([
    ["tv-repair-chennai", "TV Wall Mount Installation", "TV Repair and Services"],
    ["geyser-repair-chennai", "Geyser Installation", "Geyser Repair and Services"],
    ["microwave-oven-repair-chennai", "Microwave Oven Repair", "Microwave Oven Repair"],
    ["dishwasher-repair-chennai", "Dishwasher Repair & Service", "Dishwasher Repair"],
    ["cctv-camera-repair-chennai", "CCTV Cameras Repair and Installation", "CCTV Camera Repair and Installation"],
    ["chimney-cleaning-chennai", "Chimney Inspection", "Chimney Cleaning and Service"],
    ["mosquito-net-service-chennai", "Mosquito Net Inspection Charge", "Mosquito Net Service"],
    ["sofa-repair-chennai", "Sofa Repair Inspection Charge", "Sofa Repair"],
    ["water-purifier-service-chennai", "Water Purifier Repair & Services", "Water Purifier Repair and Service"],
  ])("builds the %s landing page from its matching catalogue service", (slug, name, heading) => {
    const page = buildLocalCityPage(slug, [service(name, slug)]);
    expect(page?.h1).toBe(`${heading} in Chennai`);
    expect(page?.services).toHaveLength(1);
    expect(page?.is_indexable).toBe(slug === "water-purifier-service-chennai");
  });

  it("creates non-indexable Chennai and Coimbatore area pages for valid service areas", () => {
    const area = {
      id: "area-1", name: "Vadapalani", city: "Chennai", state: "Tamil Nadu", country: "India", postal_code: "600026",
      localities: [{ id: "locality-1", name: "Vadapalani", slug: "vadapalani" }],
    };
    const chennai = buildLocalAreaPage("tv-repair-chennai/vadapalani", "Chennai", area, [service("TV Repair & Services", "tv-repair")]);
    expect(chennai?.path).toBe("/tv-repair-chennai/vadapalani");
    expect(chennai?.is_indexable).toBe(false);
    const coimbatore = buildCoimbatorePage("tv-repair-coimbatore/rs-puram", [{ ...area, name: "RS Puram", city: "Coimbatore", postal_code: "641002", localities: [] }], [service("TV Repair & Services", "tv-repair")]);
    expect(coimbatore?.path).toBe("/tv-repair-coimbatore/rs-puram");
    expect(coimbatore?.is_indexable).toBe(false);
  });

  it("links each available service family once for the selected city and area", () => {
    const links = localServiceFamilyLinks([
      service("AC Inspection", "ac-inspection"), service("AC Installation", "ac-installation"),
      service("TV Repair & Services", "tv-repair"), service("CCTV Cameras Repair and Installation", "cctv-repair"),
    ], "Coimbatore", "rs-puram");
    expect(links.map((link) => link.path)).toEqual([
      "/ac-service-coimbatore/rs-puram", "/tv-repair-coimbatore/rs-puram", "/cctv-camera-repair-coimbatore/rs-puram",
    ]);
  });
});
