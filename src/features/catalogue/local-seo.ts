import { coimbatoreAreaSlugs } from "@/constants/routes";
import { packageFamilyKey } from "@/features/catalogue/package-family";
import type { SeoLandingPage, SeoPageLink, ServiceArea, ServiceListItem } from "@/types/api";

export const localCityPages = {
  "ac-service-chennai": {
    name: "AC Service",
    intro: "Compare AC cleaning, inspection, repair, gas refilling and installation packages available in Chennai. For poor cooling, water leakage or unusual noise, choose diagnosis before assuming a gas refill is needed. Check each package for the supported AC type and included work before booking.",
    pricing: "The live prices below apply to the named packages, not every AC repair. Installation, uninstallation, cleaning and gas-refill work are priced separately. Extra work should be quoted before it starts.",
    matches: (service: ServiceListItem) => /\bac\b|air.condition/i.test(`${service.name} ${service.slug}`),
  },
  "washing-machine-repair-chennai": {
    name: "Washing Machine Repair",
    intro: "A washing machine that will not drain, spin or start needs inspection to establish the cause. Compare available washing machine repair and service packages in Chennai, and check whether your front-load or top-load model is covered. Share the symptoms and model when booking; parts and additional work depend on diagnosis.",
    pricing: "Check the live inspection or service price before selecting a package. Repair parts are not automatically included in an inspection price. Confirm the scope and any additional quote before approving work.",
    matches: (service: ServiceListItem) => /washing.machine/i.test(`${service.name} ${service.slug}`),
  },
  "refrigerator-repair-chennai": {
    name: "Refrigerator Repair",
    intro: "If your fridge is not cooling, has excess frost or makes unusual noise, select an available refrigerator inspection or repair package in Chennai. Diagnosis helps distinguish a thermostat, drainage or cooling-system problem. Gas refilling should only be selected where offered and after the cause has been checked.",
    pricing: "Compare the current package prices and inclusions below. An inspection price is not a promise that every fridge fault or replacement part is covered. Confirm additional repair costs before work begins.",
    matches: (service: ServiceListItem) => /refrigerator|\bfridge\b/i.test(`${service.name} ${service.slug}`),
  },
  "ac-repair-chennai": {
    name: "AC Repair",
    intro: "An AC that is not cooling, leaking water or making unusual noise needs diagnosis before choosing a repair. Compare the available inspection and repair packages below, check what each package includes, and choose the appropriate service before booking your visit.",
    pricing: "Inspection and gas-refill packages are listed separately. Use the live package price and included-work details to compare them; a gas refill is not a substitute for diagnosing the cause of poor cooling.",
    matches: (service: ServiceListItem) => /\bac\b|air.condition/i.test(`${service.name} ${service.slug}`) && /inspection|repair/i.test(`${service.name} ${service.slug}`),
  },
  "water-tank-cleaning-chennai": {
    name: "Water Tank Cleaning",
    intro: "Choose cleaning according to your tank's construction, location and capacity. Purple Squad lists separate overhead-tank, concrete-tank and underground-sump packages so you can compare the appropriate size range before booking. Check access and package details before selecting your visit.",
    pricing: "Prices vary by tank type and capacity. Compare the live prices below, and select the package matching your tank rather than a smaller capacity band.",
    matches: (service: ServiceListItem) => /(?:water.tank|sump)/i.test(`${service.name} ${service.slug}`) && /cleaning/i.test(`${service.name} ${service.slug}`),
  },
  "water-purifier-service-chennai": {
    name: "Water Purifier Repair and Service",
    intro: "Compare water purifier inspection and repair options in Chennai. Share the purifier brand, model and symptoms when booking so the technician can assess filtration, leakage or water-flow concerns.",
    pricing: "Check the current package price and included work before booking. Filters, membranes and other replacement parts are confirmed separately where required.",
    matches: (service: ServiceListItem) => /purifier|\bro\b/i.test(`${service.name} ${service.slug}`),
  },
  "tv-repair-chennai": {
    name: "TV Repair and Services",
    intro: "Compare TV repair and installation options in Chennai. Choose a repair visit for a display, sound or power issue, or select a wall-mount package that matches your screen size. Check the package details and confirm the wall and TV requirements before booking.",
    pricing: "The listed price applies to the selected package. Parts, special brackets and additional work may be quoted separately after the technician checks the TV and installation surface.",
    matches: (service: ServiceListItem) => /\btv\b|television|wall.mount/i.test(`${service.name} ${service.slug}`) && !/cctv/i.test(`${service.name} ${service.slug}`),
  },
  "geyser-repair-chennai": {
    name: "Geyser Repair and Services",
    intro: "Find geyser repair and installation options in Chennai. If the unit is not heating, leaks or trips the power, book an inspection so the cause can be checked before repair work is approved.",
    pricing: "Review each live package and its inclusions before booking. Replacement parts and additional work are quoted separately where required.",
    matches: (service: ServiceListItem) => /geyser|water.heater/i.test(`${service.name} ${service.slug}`),
  },
  "microwave-oven-repair-chennai": {
    name: "Microwave Oven Repair",
    intro: "Compare microwave and oven repair options in Chennai for heating, control, door and power issues. An inspection helps identify the fault before any repair or replacement is approved.",
    pricing: "Check the current inspection or repair package price and included work. Parts and additional repairs are not included unless the package says so.",
    matches: (service: ServiceListItem) => /microwave|oven/i.test(`${service.name} ${service.slug}`),
  },
  "dishwasher-repair-chennai": {
    name: "Dishwasher Repair",
    intro: "Choose a dishwasher inspection or repair option in Chennai for drainage, cleaning, leakage or starting problems. Share the model and symptoms when booking so the technician can prepare for the visit.",
    pricing: "Compare live package details. Replacement parts and work beyond the selected package are confirmed with you before proceeding.",
    matches: (service: ServiceListItem) => /dishwasher/i.test(`${service.name} ${service.slug}`),
  },
  "cctv-camera-repair-chennai": {
    name: "CCTV Camera Repair and Installation",
    intro: "Explore CCTV camera repair and installation services in Chennai. Share the number of cameras and the issue or installation requirement when booking so the visit can be matched to your needs.",
    pricing: "Review the listed package scope and current price. Cabling, equipment and additional work are quoted separately where they are not included.",
    matches: (service: ServiceListItem) => /cctv|security.camera/i.test(`${service.name} ${service.slug}`),
  },
  "chimney-cleaning-chennai": {
    name: "Chimney Cleaning and Service",
    intro: "Compare chimney inspection and cleaning options in Chennai. Choose the service that matches your chimney type and current condition, and check the package inclusions before booking.",
    pricing: "Package price and inclusions are shown with each available option. Repairs or replacement parts are quoted separately after inspection.",
    matches: (service: ServiceListItem) => /chimney/i.test(`${service.name} ${service.slug}`),
  },
  "mosquito-net-service-chennai": {
    name: "Mosquito Net Service",
    intro: "Find mosquito net inspection and repair options in Chennai. Share the window or door size and the type of mesh when booking; replacement material and custom work depend on the measurements.",
    pricing: "Check the selected visit's scope and current price. Custom mesh and additional materials are confirmed before work begins.",
    matches: (service: ServiceListItem) => /mosquito.net/i.test(`${service.name} ${service.slug}`),
  },
  "sofa-repair-chennai": {
    name: "Sofa Repair",
    intro: "Compare sofa repair and inspection options in Chennai for upholstery, cushioning and frame concerns. Share the sofa type and issue when booking to help scope the visit.",
    pricing: "The live package price covers the listed visit or work only. Fabric, materials and additional repairs are confirmed separately before proceeding.",
    matches: (service: ServiceListItem) => /sofa|upholster/i.test(`${service.name} ${service.slug}`),
  },
  "bathroom-cleaning-chennai": {
    name: "Bathroom Cleaning",
    intro: "Choose a bathroom cleaning option in Chennai based on the number of bathrooms and the work required. Check the package inclusions and any preparation instructions before booking.",
    pricing: "Compare current package prices and inclusions. Additional bathrooms or out-of-scope work may require a separate quote.",
    matches: (service: ServiceListItem) => /bathroom.clean/i.test(`${service.name} ${service.slug}`),
  },
  "house-cleaning-chennai": {
    name: "Full House Cleaning",
    intro: "Compare full-house cleaning options in Chennai and select the package that best fits your home size and cleaning needs. Check room coverage and exclusions before booking.",
    pricing: "Package scope and live pricing are listed with each option. Deep-cleaning extras and work outside the selected package are confirmed separately.",
    matches: (service: ServiceListItem) => /(?:full|house).clean/i.test(`${service.name} ${service.slug}`),
  },
};

const establishedIndexablePages = new Set([
  "ac-service-chennai", "washing-machine-repair-chennai", "refrigerator-repair-chennai",
  "ac-repair-chennai", "water-tank-cleaning-chennai", "water-purifier-service-chennai",
]);

function localityLinks(serviceSlug: string, areas: ServiceArea[], city: string): SeoPageLink[] {
  const links = areas.filter((area) => area.city.toLowerCase() === city.toLowerCase()).flatMap((area) => {
    const localities = area.localities.length ? area.localities : [{ id: area.id, name: area.name, slug: area.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }];
    return localities.map((locality) => ({
      name: locality.name,
      path: `/${serviceSlug.replace(/-chennai$/, `-${city.toLowerCase()}`)}/${locality.slug}`,
      area: locality.name,
      postal_code: area.postal_code,
    }));
  });
  return Array.from(new Map(links.map((link) => [link.path, link])).values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function localServiceFamilyLinks(availableServices: ServiceListItem[], city: string, areaSlug = ""): SeoPageLink[] {
  const representedFamilies = new Set<string>();
  return Object.entries(localCityPages).flatMap(([chennaiSlug, config]) => {
    const service = availableServices.find(config.matches);
    if (!service) return [];
    const family = packageFamilyKey(service);
    if (representedFamilies.has(family)) return [];
    representedFamilies.add(family);
    const rootSlug = chennaiSlug.replace(/-chennai$/, `-${city.toLowerCase()}`);
    const path = `/${rootSlug}${areaSlug ? `/${areaSlug}` : ""}`;
    return [{ name: config.name, path, area: "", postal_code: "" }];
  });
}

// Enhance primary city pages only; preserve published local-area content and URLs.
export function enhancePrimaryCityPage(page: SeoLandingPage): SeoLandingPage {
  if (page.area || !Object.hasOwn(localCityPages, page.page_slug)) return page;
  const config = localCityPages[page.page_slug as keyof typeof localCityPages];
  return { ...page, meta_title: `${config.name} in Chennai | Purple Squad`,
    meta_description: `Book ${config.name.toLowerCase()} in Chennai with Purple Squad. Compare available packages, current prices and included work before booking online.`,
    h1: `${config.name} in Chennai`,
    intro_content: [page.intro_content?.trim(), config.intro].filter(Boolean).filter((text, index, all) => all.indexOf(text) === index).join("\n\n"),
    pricing_intro: page.pricing_intro?.trim() || config.pricing };
}

// Call only with the API's city=Chennai availability-filtered catalogue.
export function buildLocalCityPage(slug: string, availableServices: ServiceListItem[], areas: ServiceArea[] = []): SeoLandingPage | null {
  if (!Object.hasOwn(localCityPages, slug)) return null;
  const config = localCityPages[slug as keyof typeof localCityPages];
  if (!config) return null;
  const services = availableServices.filter(config.matches);
  if (!services.length) return null;
  return {
    page_slug: slug, path: `/${slug}`, service_slug: slug, service_name: config.name,
    city: "Chennai", area: "", area_slug: "", postal_code: "", page_type: "SERVICE_CITY",
    category_slug: services[0].category.slug, is_indexable: establishedIndexablePages.has(slug), updated_at: "",
    meta_title: `${config.name} in Chennai | Purple Squad`,
    meta_description: `Compare ${config.name.toLowerCase()} packages in Chennai with Purple Squad. View current prices, included work and available options before booking.`,
    h1: `${config.name} in Chennai`, intro_content: config.intro, pricing_intro: config.pricing,
    services, coverage_areas: ["Chennai"], faqs: [], canonical_override: "", parent_page: null,
    area_pages: localityLinks(slug, areas, "Chennai"), nearby_pages: [], related_pages: [],
  };
}

export function buildLocalAreaPage(slug: string, city: string, area: ServiceArea, availableServices: ServiceListItem[]): SeoLandingPage | null {
  const [citySlug, areaSlug, extra] = slug.split("/");
  if (extra || !areaSlug || !citySlug?.endsWith(`-${city.toLowerCase()}`)) return null;
  const chennaiSlug = citySlug.replace(new RegExp(`-${city.toLowerCase()}$`), "-chennai");
  if (!Object.hasOwn(localCityPages, chennaiSlug)) return null;
  const config = localCityPages[chennaiSlug as keyof typeof localCityPages];
  const localities = area.localities.length ? area.localities : [{ id: area.id, name: area.name, slug: area.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }];
  const locality = localities.find((item) => item.slug === areaSlug);
  if (!locality || area.city.toLowerCase() !== city.toLowerCase()) return null;
  const services = availableServices.filter(config.matches);
  if (!services.length) return null;
  const location = `${locality.name}, ${city}`;
  return {
    page_slug: slug, path: `/${slug}`, service_slug: citySlug, service_name: config.name,
    city, area: locality.name, area_slug: areaSlug, postal_code: area.postal_code,
    page_type: "SERVICE_AREA", category_slug: services[0].category.slug, is_indexable: false,
    updated_at: "", meta_title: `${config.name} in ${location} | Purple Squad`,
    meta_description: `Compare available ${config.name.toLowerCase()} packages in ${location}. Check current pricing and confirm service for your address before booking.`,
    h1: `${config.name} in ${location}`,
    intro_content: `Purple Squad lists ${config.name.toLowerCase()} options for supported addresses in ${location} ${area.postal_code}. Compare currently available packages, then confirm service for your exact address before booking.`,
    pricing_intro: config.pricing, services, coverage_areas: [locality.name], faqs: [],
    canonical_override: "", parent_page: null, area_pages: [], nearby_pages: [], related_pages: [],
  };
}

// Coimbatore pages use live area/PIN and service availability. Keep them out of
// the sitemap until each page receives reviewed, original local content.
export function buildCoimbatorePage(slug: string, areas: ServiceArea[], availableServices: ServiceListItem[]): SeoLandingPage | null {
  const [citySlug, areaSlug, extra] = slug.split("/");
  if (extra || !citySlug?.endsWith("-coimbatore")) return null;
  const chennaiSlug = citySlug.replace(/-coimbatore$/, "-chennai");
  if (!Object.hasOwn(localCityPages, chennaiSlug)) return null;
  const config = localCityPages[chennaiSlug as keyof typeof localCityPages];
  if (areaSlug && !coimbatoreAreaSlugs.has(areaSlug) && !areas.some((item) => item.localities.some((locality) => locality.slug === areaSlug))) return null;
  const area = areaSlug ? areas.find((item) => item.city.toLowerCase() === "coimbatore" &&
    (item.localities.some((locality) => locality.slug === areaSlug) || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === areaSlug)) : null;
  if (areaSlug && !area) return null;
  if (areaSlug) return area ? buildLocalAreaPage(slug, "Coimbatore", area, availableServices) : null;
  const services = availableServices.filter(config.matches);
  if (!services.length) return null;
  const name = area?.localities.find((locality) => locality.slug === areaSlug)?.name || area?.name || "";
  const locality = name ? `${name}, Coimbatore` : "Coimbatore";
  return {
    page_slug: slug, path: `/${slug}`, service_slug: citySlug, service_name: config.name,
    city: "Coimbatore", area: name, area_slug: areaSlug || "", postal_code: area?.postal_code || "",
    page_type: area ? "SERVICE_AREA" : "SERVICE_CITY", category_slug: services[0].category.slug,
    is_indexable: false, updated_at: "", canonical_override: "",
    meta_title: `${config.name} in ${locality} | Purple Squad`,
    meta_description: `Compare available ${config.name.toLowerCase()} packages in ${locality} with Purple Squad. Check live pricing and confirm service at your exact address.`,
    h1: `${config.name} in ${locality}`,
    intro_content: `Purple Squad lists ${config.name.toLowerCase()} options for supported addresses in ${locality}${area ? ` ${area.postal_code}` : ""}. Compare the currently available packages, then confirm availability for your exact address before booking.`,
    pricing_intro: config.pricing, services, coverage_areas: name ? [name] : ["Coimbatore"],
    faqs: [], parent_page: null, area_pages: localityLinks(citySlug, areas, "Coimbatore"), nearby_pages: [], related_pages: [],
  };
}
