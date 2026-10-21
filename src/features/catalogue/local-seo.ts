import { coimbatoreAreaSlugs } from "@/constants/routes";
import type { SeoLandingPage, ServiceArea, ServiceListItem } from "@/types/api";

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
};

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
export function buildLocalCityPage(slug: string, availableServices: ServiceListItem[]): SeoLandingPage | null {
  if (!Object.hasOwn(localCityPages, slug)) return null;
  const config = localCityPages[slug as keyof typeof localCityPages];
  if (!config) return null;
  const services = availableServices.filter(config.matches);
  if (!services.length) return null;
  return {
    page_slug: slug, path: `/${slug}`, service_slug: slug, service_name: config.name,
    city: "Chennai", area: "", area_slug: "", postal_code: "", page_type: "SERVICE_CITY",
    category_slug: services[0].category.slug, is_indexable: true, updated_at: "",
    meta_title: `${config.name} in Chennai | Purple Squad`,
    meta_description: `Compare ${config.name.toLowerCase()} packages in Chennai with Purple Squad. View current prices, included work and available options before booking.`,
    h1: `${config.name} in Chennai`, intro_content: config.intro, pricing_intro: config.pricing,
    services, coverage_areas: ["Chennai"], faqs: [], canonical_override: "", parent_page: null,
    area_pages: [], nearby_pages: [], related_pages: [],
  };
}

// Coimbatore pages use live area/PIN and service availability. Keep them out of
// the sitemap until each page receives reviewed, original local content.
export function buildCoimbatorePage(slug: string, areas: ServiceArea[], availableServices: ServiceListItem[]): SeoLandingPage | null {
  const [citySlug, areaSlug, extra] = slug.split("/");
  if (extra || !citySlug?.endsWith("-coimbatore")) return null;
  const chennaiSlug = citySlug.replace(/-coimbatore$/, "-chennai");
  if (!Object.hasOwn(localCityPages, chennaiSlug)) return null;
  if (areaSlug && !coimbatoreAreaSlugs.has(areaSlug)) return null;
  const config = localCityPages[chennaiSlug as keyof typeof localCityPages];
  const area = areaSlug ? areas.find((item) => item.city.toLowerCase() === "coimbatore" &&
    (item.localities.some((locality) => locality.slug === areaSlug) || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === areaSlug)) : null;
  if (areaSlug && !area) return null;
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
    faqs: [], parent_page: null, area_pages: [], nearby_pages: [], related_pages: [],
  };
}
