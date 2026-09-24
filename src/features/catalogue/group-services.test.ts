import { describe, expect, it } from "vitest";

import type { ServiceListItem } from "@/features/catalogue/types";
import {
  groupServicesForLanding,
  splitServiceBullets,
  stripGroupPrefix,
} from "@/features/catalogue/group-services";

function service(overrides: Partial<ServiceListItem>): ServiceListItem {
  return {
    id: overrides.slug ?? "service-id",
    category: { id: "category", name: "Cleaning", slug: "cleaning" },
    name: "Overhead Water Tank Cleaning - Up to 1000 Litres",
    slug: "overhead-water-tank-cleaning-up-to-1000-litres",
    short_description: "Tank cleaning",
    whats_included: "Draining support\n- Scrubbing",
    landing_group: "",
    base_price: "779.00",
    selling_price: null,
    effective_price: 779,
    advance_amount: "100.00",
    estimated_duration_minutes: 90,
    cover_image: "",
    is_featured: false,
    is_popular: false,
    display_order: 1,
    ...overrides,
  };
}

describe("groupServicesForLanding", () => {
  it("groups options by explicit landing group and sorts by display order", () => {
    const groups = groupServicesForLanding([
      service({ name: "Water Tank Small", slug: "water-tank-small", landing_group: "Overhead Water Tank", display_order: 2 }),
      service({ name: "Water Tank Large", slug: "water-tank-large", landing_group: "Overhead Water Tank", display_order: 1 }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.options.map((item) => item.slug)).toEqual(["water-tank-large", "water-tank-small"]);
  });

  it("derives groups from the prefix when legacy landing_group is empty", () => {
    const groups = groupServicesForLanding([
      service({}),
      service({ name: "Overhead Water Tank Cleaning - 1000 to 3000 Litres", slug: "overhead-3000" }),
      service({ name: "Underground Sump Cleaning - Up to 5000 Litres", slug: "sump-5000" }),
    ]);
    expect(groups.map((group) => group.title)).toEqual([
      "Overhead Water Tank Cleaning",
      "Underground Sump Cleaning",
    ]);
  });

  it("uses the minimum current price and its duration", () => {
    const groups = groupServicesForLanding([
      service({ slug: "expensive", effective_price: 1200, display_order: 1 }),
      service({ slug: "cheapest", effective_price: 700, estimated_duration_minutes: 60, display_order: 2 }),
    ]);
    expect(groups[0]?.startingPrice).toBe(700);
    expect(groups[0]?.startingService.slug).toBe("cheapest");
  });

  it("supports a single-option group and an empty category", () => {
    expect(groupServicesForLanding([service({ landing_group: "Tank Visit" })])[0]?.options).toHaveLength(1);
    expect(groupServicesForLanding([])).toEqual([]);
  });
});

describe("landing labels", () => {
  it("strips the group prefix from an option label", () => {
    expect(stripGroupPrefix("Overhead Water Tank Cleaning - Up to 1000 Litres", "Overhead Water Tank Cleaning")).toBe("Up to 1000 Litres");
  });

  it("normalizes newline bullets", () => {
    expect(splitServiceBullets("Drain\n- Scrub\n• Rinse")).toEqual(["Drain", "Scrub", "Rinse"]);
  });
});
