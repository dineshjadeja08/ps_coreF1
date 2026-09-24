export type ServiceOffer = {
  id: string;
  title: string;
  subtitle: string;
  active: boolean;
  serviceCategorySlugs: string[];
};

// Keep offers CMS-style and evidence based. Example only (do not enable without
// an approved commercial offer):
// { id: "upi-cashback", title: "Get cashback up to ₹2k", subtitle: "First order via UPI", active: true, serviceCategorySlugs: ["water-tank-cleaning"] }
export const serviceOffers: ServiceOffer[] = [];

export function getActiveOffers(categorySlug: string) {
  return serviceOffers.filter(
    (offer) => offer.active && offer.serviceCategorySlugs.includes(categorySlug),
  );
}
