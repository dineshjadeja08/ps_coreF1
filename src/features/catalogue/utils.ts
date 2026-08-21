import type { ServiceCategory, ServiceListItem } from "@/features/catalogue/types";

export function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDuration(minutes?: number) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} mins` : `${hours} hr`;
}

export function getCurrentPrice(service: ServiceListItem) {
  return service.effective_price ?? service.selling_price ?? service.base_price;
}

export function hasOfferPrice(service: ServiceListItem) {
  if (!service.selling_price) return false;
  return Number(service.selling_price) < Number(service.base_price);
}

export function filterServices(
  services: ServiceListItem[],
  filters: { category?: string | null; query?: string | null },
) {
  const category = filters.category?.trim();
  const query = filters.query?.trim().toLowerCase();

  return services.filter((service) => {
    const matchesCategory = !category || service.category.slug === category;
    const matchesQuery =
      !query ||
      service.name.toLowerCase().includes(query) ||
      service.short_description.toLowerCase().includes(query) ||
      service.category.name.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });
}

export function getCategoryName(categories: ServiceCategory[], slug?: string | null) {
  if (!slug) return "All services";
  return categories.find((category) => category.slug === slug)?.name ?? "Selected services";
}
