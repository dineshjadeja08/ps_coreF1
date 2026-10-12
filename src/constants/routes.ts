const localSeoServiceSlugs: Record<string, string> = {
  "ac-services": "ac-service-chennai",
  "washing-machine-repair-service": "washing-machine-repair-chennai",
  "refrigerator-repair-services": "refrigerator-repair-chennai",
  "water-purifier-repair-services": "water-purifier-service-chennai",
};
export const coimbatoreAreaSlugs = new Set(["coimbatore-central", "rs-puram", "peelamedu", "saibaba-colony", "gandhipuram", "race-course", "saravanampatti", "vadavalli"]);

function localizedServicePath(slug: string, areaSlug: string, city: string) {
  const chennaiSlug = localSeoServiceSlugs[slug];
  if (!chennaiSlug) return `/services/${encodeURIComponent(slug)}`;
  if (city === "Coimbatore") {
    const citySlug = chennaiSlug.replace(/-chennai$/, "-coimbatore");
    return `/${citySlug}${coimbatoreAreaSlugs.has(areaSlug) ? `/${encodeURIComponent(areaSlug)}` : ""}`;
  }
  if (city !== "Chennai") return `/services/${encodeURIComponent(slug)}`;
  return `/${chennaiSlug}${areaSlug ? `/${encodeURIComponent(areaSlug)}` : ""}`;
}

export function isServiceBrowsingRoute(pathname: string) {
  if (["/", "/services", "/search"].includes(pathname) || pathname.startsWith("/services/")) return true;
  const segments = pathname.split("/").filter(Boolean);
  return segments.length <= 2 && /^[a-z0-9-]+-(?:chennai|coimbatore)$/.test(segments[0] ?? "");
}

export function servicePathForLocation(pathname: string, areaSlug: string, city: string) {
  const segments = pathname.split("/").filter(Boolean);
  const family = Object.entries(localSeoServiceSlugs).find(([serviceSlug, seoSlug]) =>
    (segments.length <= 2 && (segments[0] === seoSlug || segments[0] === seoSlug.replace(/-chennai$/, "-coimbatore")))
    || (segments.length === 2 && segments[0] === "services" && segments[1] === serviceSlug),
  );
  if (!family) return null;

  return localizedServicePath(family[0], areaSlug, city);
}

export const routes = {
  home: "/",
  search: "/search",
  services: "/services",
  serviceCategory: (slug: string) => `/services/${encodeURIComponent(slug)}`,
  localizedServiceCategory: (slug: string, areaSlug = "", city = "Chennai") => localizedServicePath(slug, areaSlug, city),
  serviceDetail: (slug: string) => `/services/${slug}`,
  book: "/book",
  bookingPayment: (bookingId: string) => `/book/pay/${bookingId}`,
  bookingSuccess: (bookingId: string) => `/booking-success/${bookingId}`,
  bookings: "/bookings",
  bookingDetail: (id: string) => `/bookings/${id}`,
  profile: "/profile",
  admin: "/admin",
  technicianJobs: "/technician/jobs",
  about: "/about",
  support: "/support",
  joinAsTechnician: "/join-as-technician",
  partnerSupport: "/partner-support",
  serviceStandards: "/service-standards",
  faq: "/faq",
  privacy: "/privacy-policy",
  terms: "/terms",
  cancellationPolicy: "/cancellation-policy",
};
