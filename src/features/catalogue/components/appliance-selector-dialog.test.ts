import { describe, expect, it } from "vitest";

import { applianceServices } from "@/features/catalogue/components/appliance-selector-dialog";

describe("appliance selector routes", () => {
  it("routes AC to the AC category landing page", () => {
    expect(applianceServices.find((service) => service.name === "AC Repair & Services")?.slug).toBe("ac-services");
  });
});
