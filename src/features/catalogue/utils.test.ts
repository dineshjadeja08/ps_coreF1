import { describe, expect, it } from "vitest";

import type { ServiceListItem } from "@/features/catalogue/types";
import { filterServices, formatDuration, formatPrice, hasOfferPrice } from "@/features/catalogue/utils";

const services: ServiceListItem[] = [
  {
    id: "service-1",
    category: {
      id: "category-1",
      name: "AC Service",
      slug: "ac-service",
    },
    name: "AC Deep Cleaning",
    slug: "ac-deep-cleaning",
    short_description: "Indoor and outdoor AC cleaning",
    base_price: "899.00",
    selling_price: "699.00",
    effective_price: 699,
    advance_amount: "199.00",
    estimated_duration_minutes: 90,
    cover_image: "",
    is_featured: true,
    is_popular: false,
    display_order: 1,
  },
  {
    id: "service-2",
    category: {
      id: "category-2",
      name: "Repair",
      slug: "repair",
    },
    name: "Water Leak Repair",
    slug: "water-leak-repair",
    short_description: "Leak inspection and fix",
    base_price: "499.00",
    selling_price: null,
    effective_price: 499,
    advance_amount: "99.00",
    estimated_duration_minutes: 45,
    cover_image: "",
    is_featured: false,
    is_popular: false,
    display_order: 2,
  },
];

describe("catalogue utils", () => {
  it("filters services by category slug", () => {
    expect(filterServices(services, { category: "repair" })).toHaveLength(1);
    expect(filterServices(services, { category: "repair" })[0].slug).toBe("water-leak-repair");
  });

  it("filters services by search text across name, description, and category", () => {
    expect(filterServices(services, { query: "cleaning" })[0].slug).toBe("ac-deep-cleaning");
    expect(filterServices(services, { query: "repair" })).toHaveLength(1);
  });

  it("formats price and duration for display", () => {
    expect(formatPrice("699.00")).toBe("₹699");
    expect(formatDuration(90)).toBe("1 hr 30 mins");
    expect(formatDuration(45)).toBe("45 mins");
  });

  it("detects offer prices only when selling price is below base price", () => {
    expect(hasOfferPrice(services[0])).toBe(true);
    expect(hasOfferPrice(services[1])).toBe(false);
  });
});
