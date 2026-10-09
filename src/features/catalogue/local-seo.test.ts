import { describe, expect, it } from "vitest";
import type { ServiceListItem } from "@/types/api";
import { buildLocalCityPage } from "./local-seo";

const service = (name: string, slug: string) => ({ id: slug, name, slug, category: { slug: "appliances" } }) as ServiceListItem;

describe("verified city landing pages", () => {
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
