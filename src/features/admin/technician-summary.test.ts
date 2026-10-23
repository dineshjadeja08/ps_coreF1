import { describe, expect, it } from "vitest";

import { technicianCoverageSummary, technicianSkillsSummary } from "@/features/admin/technician-summary";

describe("technician list summaries", () => {
  it("groups assigned packages into short deduplicated skill names", () => {
    expect(technicianSkillsSummary({
      skills: [{ id: "s1", name: "AC repair" }],
      supported_services: ["AC Inspection Charge", "AC Installation", "TV Wall Mount Installation", "TV Repair & Services", "Washing Machine Repair", "CCTV Cameras Installation"].map((name, index) => ({ id: String(index), name, slug: String(index), category: "Appliances" })),
    })).toBe("AC, TV, Washing Machine, CCTV");
  });

  it("preserves unknown skills and distinguishes CCTV from TV", () => {
    expect(technicianSkillsSummary({ skills: [{ id: "1", name: "CCTV repair" }, { id: "2", name: "Solar maintenance" }], supported_services: [] })).toBe("CCTV, Solar maintenance");
  });

  it("deduplicates coverage by city without area names or pincodes", () => {
    const service_areas = [
      { id: "1", name: "Guindy", city: "Chennai", postal_code: "600032" },
      { id: "2", name: "Anna Nagar", city: " chennai ", postal_code: "600040" },
      { id: "3", name: "Peelamedu", city: "Coimbatore", postal_code: "641004" },
    ];
    expect(technicianCoverageSummary({ service_areas })).toBe("Chennai, Coimbatore");
    expect(service_areas).toHaveLength(3);
  });

  it("keeps unrestricted coverage explicit instead of using the profile city", () => {
    expect(technicianCoverageSummary({ service_areas: [], city: "Chennai", pincode: "600040" })).toBe("All areas (unrestricted)");
    expect(technicianSkillsSummary({ skills: [] })).toBe("All services (unrestricted)");
  });
});
