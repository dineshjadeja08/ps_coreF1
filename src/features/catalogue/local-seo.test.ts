import { describe, expect, it } from "vitest";
import type { ServiceListItem } from "@/types/api";
import { buildLocalCityPage, enhancePrimaryCityPage } from "./local-seo";

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
  it("does not manufacture city or neighborhood routes", () => {
    expect(buildLocalCityPage("ac-repair-coimbatore", [service("AC Repair", "ac-repair")])).toBeNull();
    expect(buildLocalCityPage("ac-repair-chennai/anna-nagar", [service("AC Repair", "ac-repair")])).toBeNull();
    expect(buildLocalCityPage("constructor", [])).toBeNull();
  });
  it("matches water tank and sump packages without unrelated cleaning services", () => {
    const page = buildLocalCityPage("water-tank-cleaning-chennai", [service("Sump Cleaning", "sump-cleaning"), service("Sofa Cleaning", "sofa-cleaning")]);
    expect(page?.services.map((service) => service.slug)).toEqual(["sump-cleaning"]);
  });
});
