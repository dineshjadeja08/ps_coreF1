type FallbackVisual = {
  title: string;
  accent: string;
  image: string;
};

const fallbackPhotos: Record<string, FallbackVisual> = {
  washer: {
    title: "Washing Machine",
    accent: "Repair and service",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=960&q=80",
  },
  fridge: {
    title: "Refrigerator",
    accent: "Cooling repair",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=960&q=80",
  },
  tv: {
    title: "TV Repair",
    accent: "Display and sound",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=960&q=80",
  },
  geyser: {
    title: "Geyser Service",
    accent: "Heating check",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=960&q=80",
  },
  purifier: {
    title: "Water Purifier",
    accent: "RO and UV service",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=960&q=80",
  },
  microwave: {
    title: "Microwave Oven",
    accent: "Heating repair",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=960&q=80",
  },
  dishwasher: {
    title: "Dishwasher",
    accent: "Wash and drain care",
    image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=960&q=80",
  },
  "wall-mount": {
    title: "TV Wall Mount",
    accent: "Secure fitting",
    image: "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?auto=format&fit=crop&w=960&q=80",
  },
  cctv: {
    title: "CCTV Camera",
    accent: "Repair and setup",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=960&q=80",
  },
  chimney: {
    title: "Chimney Cleaning",
    accent: "Grease removal",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=960&q=80",
  },
  "house-cleaning": {
    title: "Full House Cleaning",
    accent: "Deep home clean",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=960&q=80",
  },
  bathroom: {
    title: "Bathroom Cleaning",
    accent: "Tiles and fixtures",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=960&q=80",
  },
  "water-tank": {
    title: "Water Tank Cleaning",
    accent: "Sediment removal",
    image: "https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&w=960&q=80",
  },
  ac: {
    title: "AC Service",
    accent: "Cooling care",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=960&q=80",
  },
  repair: {
    title: "Appliance Repair",
    accent: "Expert technician",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=960&q=80",
  },
};

const localServicePhotos = [
  { match: ["foam jet"], src: "/images/services/ac-foam-jet.png" },
  { match: ["full ac chemical wash", "chemical wash"], src: "/images/services/ac-chemical-wash.png" },
  { match: ["gas refill", "gas refil"], src: "/images/services/ac-gas-refill.png" },
  { match: ["ac inspection"], src: "/images/services/ac-inspection.png" },
  { match: ["ac uninstallation & installation"], src: "/images/services/ac-installation.png" },
  { match: ["ac uninstallation"], src: "/images/services/ac-uninstallation.png" },
  { match: ["ac installation"], src: "/images/services/ac-installation.png" },
  { match: ["dishwasher"], src: "/images/services/dishwasher.png" },
  { match: ["washing", "washer"], src: "/images/services/washing-machine.png" },
  { match: ["refrigerator", "fridge"], src: "/images/services/refrigerator.png" },
  { match: ["microwave"], src: "/images/services/microwave.png" },
  { match: ["geyser"], src: "/images/services/geyser.png" },
  { match: ["purifier", "ro repair", "uv repair"], src: "/images/services/water-purifier.png" },
  { match: ["water tank", "sump"], src: "/images/services/water-tank.png" },
  { match: ["mosquito"], src: "/images/services/mosquito-net.png" },
  { match: ["sofa"], src: "/images/services/sofa-repair.png" },
  { match: ["cctv", "security camera"], src: "/images/services/cctv.png" },
  { match: ["wall mount", "tv repair", "television"], src: "/images/services/tv.png" },
  { match: ["chimney"], src: "/images/services/chimney.png" },
  { match: ["ac service"], src: "/images/services/ac-service.png" },
] as const;

export function getLocalServicePhoto(label: string) {
  const normalized = label.toLowerCase();
  return localServicePhotos.find((item) => item.match.some((keyword) => normalized.includes(keyword)))?.src ?? null;
}

export function getFallbackVisual(label: string): FallbackVisual {
  const text = label.toLowerCase();
  if (text.includes("washing")) return fallbackPhotos.washer;
  if (text.includes("refrigerator")) return fallbackPhotos.fridge;
  if (text.includes("wall mount")) return fallbackPhotos["wall-mount"];
  if (text.includes("tv")) return fallbackPhotos.tv;
  if (text.includes("geyser")) return fallbackPhotos.geyser;
  if (text.includes("purifier")) return fallbackPhotos.purifier;
  if (text.includes("microwave")) return fallbackPhotos.microwave;
  if (text.includes("dishwasher")) return fallbackPhotos.dishwasher;
  if (text.includes("cctv")) return fallbackPhotos.cctv;
  if (text.includes("chimney")) return fallbackPhotos.chimney;
  if (text.includes("full house")) return fallbackPhotos["house-cleaning"];
  if (text.includes("bathroom")) return fallbackPhotos.bathroom;
  if (text.includes("water tank")) return fallbackPhotos["water-tank"];
  if (text.includes("ac")) return fallbackPhotos.ac;
  return fallbackPhotos.repair;
}

export function resolveServiceImage(src: string | null | undefined, label: string) {
  const fallback = getFallbackVisual(label);
  const uploaded = src?.trim();
  return { src: uploaded || getLocalServicePhoto(label) || fallback.image, isFallback: !uploaded && !getLocalServicePhoto(label), fallback };
}

export function serviceHeroImage(service: { name: string; landing_thumbnail?: string | null; cover_image?: string | null }) {
  return resolveServiceImage(service.landing_thumbnail?.trim() || service.cover_image, service.name).src;
}

export function servicePageImages(service: { name: string; cover_image?: string | null; landing_thumbnail?: string | null; list_image?: string | null }) {
  return Array.from(new Set([
    serviceHeroImage(service),
    serviceListImage(service),
  ]));
}

export function serviceListImage(service: { name: string; cover_image?: string | null; landing_thumbnail?: string | null; list_image?: string | null }) {
  return resolveServiceImage(service.list_image?.trim() || service.landing_thumbnail?.trim() || service.cover_image, service.name).src;
}

export function getCategoryVisualSrc(category: { name: string; slug: string; image_url?: string | null }) {
  const text = `${category.name} ${category.slug}`.toLowerCase();
  if (text.includes("clean")) return "/images/categories/cleaning.png";
  if (text.includes("appliance") || text.includes("repair") || text.includes("home")) return "/images/categories/home-appliances-repair.png";
  return category.image_url || null;
}
