import { describe, expect, it } from "vitest";

import { routes } from "@/constants/routes";

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
