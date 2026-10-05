const localSeoServiceSlugs: Record<string, string> = {
  "ac-services": "ac-service-chennai",
  "washing-machine-repair-service": "washing-machine-repair-chennai",
  "refrigerator-repair-services": "refrigerator-repair-chennai",
  "water-purifier-repair-services": "water-purifier-service-chennai",
};

export function servicePathForLocation(pathname: string, areaSlug: string, city: string) {
  const segments = pathname.split("/").filter(Boolean);
  const family = Object.entries(localSeoServiceSlugs).find(([serviceSlug, seoSlug]) =>
    (segments.length <= 2 && segments[0] === seoSlug)
    || (segments.length === 2 && segments[0] === "services" && segments[1] === serviceSlug),
  );
  if (!family) return null;

  const [serviceSlug, seoSlug] = family;
  // Only Chennai has published locality routes; other cities keep the normal service page.
  if (city !== "Chennai") return `/services/${encodeURIComponent(serviceSlug)}`;
  return `/${seoSlug}${areaSlug ? `/${encodeURIComponent(areaSlug)}` : ""}`;
}

export const routes = {
  home: "/",
  search: "/search",
  services: "/services",
  serviceCategory: (slug: string) => `/services/${encodeURIComponent(slug)}`,
  localizedServiceCategory: (slug: string, areaSlug = "") => {
    const seoServiceSlug = localSeoServiceSlugs[slug];
    if (!seoServiceSlug) return `/services/${encodeURIComponent(slug)}`;
    return `/${seoServiceSlug}${areaSlug ? `/${encodeURIComponent(areaSlug)}` : ""}`;
  },
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
