import type { TechnicianProfile, TechnicianWriteRequest } from "@/types/api";

export function technicianForm(profile?: TechnicianProfile): TechnicianWriteRequest {
  return {
    employee_code: profile?.employee_code ?? "",
    display_name: profile?.display_name ?? "",
    phone: profile?.phone ?? "",
    alternate_phone: profile?.alternate_phone ?? "",
    email: profile?.email ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    pincode: profile?.pincode ?? "",
    technician_type: profile?.technician_type ?? "EMPLOYEE",
    employment_status: profile?.employment_status ?? "ACTIVE",
    background_verification_status: profile?.background_verification_status ?? "PENDING",
    availability_status: profile?.availability_status ?? "AVAILABLE",
    experience_years: profile?.experience_years ?? "0.0",
    joined_at: profile?.joined_at ?? null,
    is_active: profile?.is_active ?? true,
    whatsapp_notifications_enabled: profile?.whatsapp_notifications_enabled ?? false,
    internal_notes: profile?.internal_notes ?? "",
    skill_names: profile?.skills.map((skill) => skill.name) ?? [],
    service_area_ids: profile?.service_areas.map((area) => area.id) ?? [],
    supported_service_ids: profile?.supported_services?.map((service) => service.id) ?? [],
  };
}

export function technicianSkillNames(value: string) {
  return [...new Set(value.split(",").map((name) => name.trim()).filter(Boolean))];
}
