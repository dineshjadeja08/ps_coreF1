import type { ServiceListItem } from "@/features/catalogue/types";

export function packageFamilyKey(service: Pick<ServiceListItem, "name" | "short_description" | "category">) {
  const text = `${service.name} ${service.short_description} ${service.category.name}`.toLowerCase();
  // CCTV must be identified before TV, even when its description mentions a TV display.
  if (text.includes("cctv")) return "cctv";
  if (text.includes("ac ")) return "ac";
  if (text.includes("washing")) return "washing";
  if (text.includes("refrigerator") || text.includes("fridge")) return "refrigerator";
  if (text.includes("wall mount") || /\btv\b/.test(text)) return "tv";
  if (text.includes("purifier")) return "water-purifier";
  if (text.includes("geyser")) return "geyser";
  if (text.includes("dishwasher")) return "dishwasher";
  if (text.includes("chimney")) return "chimney";
  if (text.includes("water tank") || text.includes("sump")) return "water-tank";
  if (text.includes("mosquito")) return "mosquito-net";
  if (text.includes("sofa")) return "sofa";
  if (text.includes("bathroom")) return "bathroom";
  if (text.includes("house")) return "house-cleaning";
  return service.category.slug;
}
