import type { TechnicianOptions, TechnicianProfile, TechnicianWriteRequest } from "@/types/api";

export function technicianForm(profile?: TechnicianProfile): TechnicianWriteRequest {
  return {
    employee_code: profile?.employee_code ?? "",
    display_name: profile?.display_name ?? "",
    phone: profile?.phone ?? "",
    virtual_mobile_number: profile?.virtual_mobile_number ?? "",
    id_proof_number: profile?.id_proof_number ?? "",
    alternate_phone: profile?.alternate_phone ?? "",
    email: profile?.email ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    pincode: profile?.pincode ?? "",
    service_group: profile?.service_group ?? "",
    profile_type: profile?.profile_type ?? "",
    lead_per_day: profile?.lead_per_day ?? 0,
    job_per_day: profile?.job_per_day ?? 0,
    no_of_teams: profile?.no_of_teams ?? 1,
    sales_person_assigned: profile?.sales_person_assigned ?? null,
    crm_owner_id: profile?.crm_owner_id ?? "",
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

export function technicianAreaIdsForCity(areas: TechnicianOptions["areas"], city: string) {
  return areas.filter((area) => area.is_active && area.city === city).map((area) => area.id);
}
