import type { TechnicianProfile } from "@/types/api";

const skillLabels: Array<[RegExp, string]> = [
  [/\bcctv\b/i, "CCTV"],
  [/\bac\b|air[- ]?condition/i, "AC"],
  [/washing[ -]?machine/i, "Washing Machine"],
  [/refrigerator|fridge/i, "Refrigerator"],
  [/\btv\b|television|wall[ -]?mount/i, "TV"],
  [/water[ -]?purifier|\bro\b/i, "Water Purifier"],
  [/geyser|water[ -]?heater/i, "Geyser"],
  [/dishwasher/i, "Dishwasher"],
  [/chimney/i, "Chimney"],
  [/microwave/i, "Microwave"],
  [/water[ -]?tank|sump/i, "Water Tank"],
  [/mosquito/i, "Mosquito Net"],
  [/electric/i, "Electrical"],
  [/plumb/i, "Plumbing"],
  [/paint/i, "Painting"],
  [/pest/i, "Pest Control"],
  [/clean/i, "Cleaning"],
];

function uniqueLabels(values: string[]) {
  const seen = new Set<string>();
  return values.map((value) => value.trim()).filter((value) => {
    const key = value.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function technicianSkillsSummary(technician: Pick<TechnicianProfile, "skills" | "supported_services">) {
  const names = [...technician.skills.map((skill) => skill.name), ...(technician.supported_services ?? []).map((service) => service.name)];
  return uniqueLabels(names.map((name) => skillLabels.find(([pattern]) => pattern.test(name))?.[1] ?? name)).join(", ") || "All services (unrestricted)";
}

export function technicianCoverageSummary(technician: Pick<TechnicianProfile, "service_areas" | "city" | "pincode">) {
  if (!technician.service_areas.length) return "All areas (unrestricted)";
  return uniqueLabels(technician.service_areas.map((area) => area.city || technician.city || area.name)).join(", ") || "Coverage not specified";
}
