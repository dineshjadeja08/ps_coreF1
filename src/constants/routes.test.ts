import { describe, expect, it } from "vitest";

import { routes, servicePathForLocation } from "@/constants/routes";

describe("localized service category routes", () => {
  it("uses the selected locality for supported SEO service families", () => {
    expect(routes.localizedServiceCategory("ac-services", "velachery")).toBe("/ac-service-chennai/velachery");
    expect(routes.localizedServiceCategory("washing-machine-repair-service", "guindy")).toBe("/washing-machine-repair-chennai/guindy");
  });

  it("uses the Chennai parent page until a locality is selected", () => {
    expect(routes.localizedServiceCategory("refrigerator-repair-services")).toBe("/refrigerator-repair-chennai");
  });

  it("keeps the existing route for services without a published SEO family", () => {
    expect(routes.localizedServiceCategory("geyser-repair-services", "guindy")).toBe("/services/geyser-repair-services");
  });
});

describe("current service URL after changing location", () => {
  it("replaces the old area while keeping the same service family", () => {
    expect(servicePathForLocation("/ac-service-chennai/velachery", "guindy", "Chennai")).toBe("/ac-service-chennai/guindy");
    expect(servicePathForLocation("/washing-machine-repair-chennai/guindy", "anna-nagar", "Chennai")).toBe("/washing-machine-repair-chennai/anna-nagar");
    expect(servicePathForLocation("/refrigerator-repair-chennai/guindy", "velachery", "Chennai")).toBe("/refrigerator-repair-chennai/velachery");
    expect(servicePathForLocation("/water-purifier-service-chennai/guindy", "velachery", "Chennai")).toBe("/water-purifier-service-chennai/velachery");
  });

  it("localizes normal service pages and parent SEO pages", () => {
    expect(servicePathForLocation("/services/ac-services", "guindy", "Chennai")).toBe("/ac-service-chennai/guindy");
    expect(servicePathForLocation("/ac-service-chennai", "guindy", "Chennai")).toBe("/ac-service-chennai/guindy");
    expect(servicePathForLocation("/ac-service-chennai/guindy", "", "Chennai")).toBe("/ac-service-chennai");
  });

  it("does not send customers in other cities to Chennai locality pages", () => {
    expect(servicePathForLocation("/ac-service-chennai/guindy", "rs-puram", "Coimbatore")).toBe("/services/ac-services");
  });

  it("leaves non-service routes and services without locality pages alone", () => {
    for (const path of ["/", "/login", "/book", "/profile", "/admin/bookings", "/services", "/services/geyser-repair-services", "/ac-service-chennai/guindy/extra"]) {
      expect(servicePathForLocation(path, "guindy", "Chennai")).toBeNull();
    }
  });
});
