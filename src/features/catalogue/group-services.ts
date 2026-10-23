import type { ServiceListItem } from "@/features/catalogue/types";
import { packageFamilyKey } from "@/features/catalogue/package-family";
import { getCurrentPrice } from "@/features/catalogue/utils";

export type ServiceLandingGroup = {
  slug: string;
  title: string;
  options: ServiceListItem[];
  startingService: ServiceListItem;
  startingPrice: number;
  image: string | null;
  bullets: string[];
  optionDescription?: string;
  alwaysOpenOptions?: boolean;
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

export function isTvService(service: ServiceListItem) {
  return packageFamilyKey(service) === "tv";
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

export function groupTvServicesForLanding(services: ServiceListItem[]): ServiceLandingGroup[] {
  const tvServices = services.filter(isTvService);
  const wallMountServices = tvServices.filter((service) => /wall\s*mount/i.test(`${service.name} ${service.slug}`));
  const tvSizeOptions = wallMountServices.filter((service) => /\b(?:up to|over|\d+\s*(?:to|-)?\s*\d*\s*(?:inch|inches|in\b))\b/i.test(service.name));
  const wallMountOptions = tvSizeOptions.length ? tvSizeOptions : wallMountServices;
  const repairServices = tvServices.filter((service) => !wallMountServices.includes(service));

  return [
    createLandingGroup("tv-repair-services", "TV Repair & Services", repairServices),
    createLandingGroup("tv-wall-mount-installation", "TV Wall Mount Installation", wallMountOptions, {
      optionDescription: "Choose the TV size that matches your wall-mount installation.",
      alwaysOpenOptions: true,
    }),
  ].filter((group): group is ServiceLandingGroup => Boolean(group));
}

function createLandingGroup(
  slug: string,
  title: string,
  options: ServiceListItem[],
  extra: Pick<ServiceLandingGroup, "optionDescription" | "alwaysOpenOptions"> = {},
): ServiceLandingGroup | null {
  if (!options.length) return null;
  const sortedOptions = [...options].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || numericPrice(a) - numericPrice(b),
  );
  const startingService = [...sortedOptions].sort((a, b) => numericPrice(a) - numericPrice(b))[0];
  if (!startingService) return null;

  return {
    slug,
    title,
    options: sortedOptions,
    startingService,
    startingPrice: numericPrice(startingService),
    image: sortedOptions.map((service) => service.popup_cover_image || service.landing_thumbnail || service.cover_image).find(Boolean) ?? null,
    bullets: Array.from(new Set(sortedOptions.flatMap((service) => splitServiceBullets(service.whats_included)))),
    ...extra,
  };
}
