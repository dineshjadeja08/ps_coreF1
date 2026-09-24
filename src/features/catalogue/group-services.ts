import type { ServiceListItem } from "@/features/catalogue/types";
import { getCurrentPrice } from "@/features/catalogue/utils";

export type ServiceLandingGroup = {
  slug: string;
  title: string;
  options: ServiceListItem[];
  startingService: ServiceListItem;
  startingPrice: number;
  image: string | null;
  bullets: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function numericPrice(service: ServiceListItem) {
  const price = Number(getCurrentPrice(service));
  return Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;
}

export function isWaterTankService(service: ServiceListItem) {
  const value = `${service.name} ${service.slug} ${service.landing_group ?? ""}`.toLowerCase();
  return value.includes("water tank") || value.includes("water-tank") || value.includes("sump");
}

export function deriveGroupTitle(service: ServiceListItem) {
  const explicit = service.landing_group?.trim();
  if (explicit) return explicit;
  const inferred = service.name.split(/\s[-–—]\s/, 1)[0]?.trim();
  return inferred || service.name;
}

export function stripGroupPrefix(name: string, groupTitle: string) {
  const escaped = groupTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripped = name.replace(new RegExp(`^${escaped}\\s*(?:[-–—:]\\s*)?`, "i"), "").trim();
  return stripped || name;
}

export function splitServiceBullets(value?: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

export function groupServicesForLanding(services: ServiceListItem[]): ServiceLandingGroup[] {
  const waterServices = services.filter(isWaterTankService);
  const hasSpecificOptions = waterServices.some((service) => /\s[-–—]\s/.test(service.name));
  const candidates = hasSpecificOptions
    ? waterServices.filter((service) => /\s[-–—]\s/.test(service.name) || Boolean(service.landing_group?.trim()))
    : waterServices;
  const grouped = new Map<string, { title: string; options: ServiceListItem[] }>();

  for (const service of candidates) {
    const title = deriveGroupTitle(service);
    const slug = slugify(title);
    const current = grouped.get(slug) ?? { title, options: [] };
    current.options.push(service);
    grouped.set(slug, current);
  }

  return Array.from(grouped.entries())
    .map(([slug, group]) => {
      const options = [...group.options].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || numericPrice(a) - numericPrice(b),
      );
      const startingService = [...options].sort((a, b) => numericPrice(a) - numericPrice(b))[0];
      if (!startingService) return null;
      const image = options
        .map((service) => service.popup_cover_image || service.landing_thumbnail || service.cover_image)
        .find(Boolean) ?? null;
      const bullets = Array.from(
        new Set(options.flatMap((service) => splitServiceBullets(service.whats_included))),
      );
      return {
        slug,
        title: group.title,
        options,
        startingService,
        startingPrice: numericPrice(startingService),
        image,
        bullets,
      } satisfies ServiceLandingGroup;
    })
    .filter((group): group is ServiceLandingGroup => Boolean(group))
    .sort(
      (a, b) =>
        (a.options[0]?.display_order ?? 0) - (b.options[0]?.display_order ?? 0),
    );
}
