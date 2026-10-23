import { describe, expect, it } from "vitest";
import { getMaintenanceGuide, maintenanceGuides } from "./maintenance-guides";

describe("original appliance care guides", () => {
  it("publishes distinct content with real primary service links", () => {
    expect(Object.keys(maintenanceGuides)).toHaveLength(2);
    expect(getMaintenanceGuide("ac-maintenance")?.servicePath).toBe("/ac-service-chennai");
    expect(getMaintenanceGuide("washing-machine-care")?.servicePath).toBe("/washing-machine-repair-chennai");
    expect(getMaintenanceGuide("ac-maintenance")?.sections).not.toEqual(getMaintenanceGuide("washing-machine-care")?.sections);
  });
  it("does not manufacture guides for arbitrary slugs", () => {
    expect(getMaintenanceGuide("missing")).toBeNull();
    expect(getMaintenanceGuide("constructor")).toBeNull();
  });
});
