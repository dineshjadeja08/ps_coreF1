import { describe, expect, it } from "vitest";

import { technicianForm, technicianSkillNames } from "@/features/admin/technician-form";
import type { TechnicianProfile } from "@/types/api";

describe("technician editor payload", () => {
  it("creates safe pending defaults without trusting unverified technicians", () => {
    const form = technicianForm();
    expect(form.background_verification_status).toBe("PENDING");
    expect(form.employment_status).toBe("ACTIVE");
    expect(form.joined_at).toBeNull();
    expect(form.service_area_ids).toEqual([]);
  });

  it("preserves coverage, availability, notes and inactive status when editing", () => {
    const profile: TechnicianProfile = {
      id: "technician-1", employee_code: "TECH-1", display_name: "Technician", phone: "+919876543210",
      is_active: false, is_available: false, joined_at: null, availability_status: "ON_LEAVE", internal_notes: "Keep history",
      skills: [{ id: "skill-1", name: "AC repair" }], service_areas: [{ id: "area-1", name: "Guindy", city: "Chennai", postal_code: "600032" }],
      supported_services: [{ id: "service-1", name: "AC service", slug: "ac-service", category: "AC" }],
    };
    const form = technicianForm(profile);
    expect(form.is_active).toBe(false);
    expect(form.availability_status).toBe("ON_LEAVE");
    expect(form.internal_notes).toBe("Keep history");
    expect(form.service_area_ids).toEqual(["area-1"]);
    expect(form.supported_service_ids).toEqual(["service-1"]);
    expect(form.skill_names).toEqual(["AC repair"]);
    expect(form).not.toHaveProperty("average_rating");
  });

  it("trims and deduplicates skills without sending empty names", () => {
    expect(technicianSkillNames("AC repair, , Electrical work, AC repair ")).toEqual(["AC repair", "Electrical work"]);
  });
});
