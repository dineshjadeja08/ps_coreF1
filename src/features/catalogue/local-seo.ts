import type { SeoLandingPage, ServiceListItem } from "@/types/api";

export const localCityPages = {
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
