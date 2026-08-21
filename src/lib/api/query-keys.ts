export const queryKeys = {
  health: ["health"] as const,
  authMe: ["auth", "me"] as const,
  serviceCategories: ["catalogue", "categories"] as const,
  services: (params?: Record<string, unknown>) => ["catalogue", "services", params ?? {}] as const,
  serviceDetail: (slug: string) => ["catalogue", "services", slug] as const,
  serviceReviews: (serviceId: string) => ["catalogue", "services", serviceId, "reviews"] as const,
  serviceArea: (postalCode: string) => ["service-area", postalCode] as const,
  addresses: ["addresses"] as const,
  addressServiceability: (postalCode: string) => ["addresses", "serviceability", postalCode] as const,
  slots: (params: Record<string, unknown>) => ["slots", params] as const,
  bookings: (params?: Record<string, unknown>) => ["bookings", params ?? {}] as const,
  bookingDetail: (id: string) => ["bookings", id] as const,
};
