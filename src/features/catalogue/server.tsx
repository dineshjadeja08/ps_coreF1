import { env } from "@/config/env";
import { cache } from "react";
import { apiPaths } from "@/lib/api/endpoints";
import { buildCoimbatorePage, buildLocalAreaPage, buildLocalCityPage, localCityPages, localServiceFamilyLinks } from "@/features/catalogue/local-seo";
import type { FAQ, PaginatedResponse, Review, SeoLandingPage, SeoLandingPageSummary, ServiceArea, ServiceCategory, ServiceDetail, ServiceListItem } from "@/types/api";

const revalidateSeconds = 300;

type ServiceQuery = {
  city?: string;
  category?: string;
  search?: string;
  featured?: boolean;
  page_size?: number;
};

class CatalogueError extends Error {
  constructor(public status: number) {
    super(`Catalogue request failed: ${status}`);
  }
}

function buildApiUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function fetchJson<T>(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const response = await fetch(buildApiUrl(path, query), {
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new CatalogueError(response.status);
  }

  return (await response.json()) as T;
}

async function fetchFreshJson<T>(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const response = await fetch(buildApiUrl(path, query), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new CatalogueError(response.status);
  }

  return (await response.json()) as T;
}

export const getServiceCategoriesForSeo = cache(async () => fetchJson<ServiceCategory[]>(apiPaths.serviceCategories));

export async function getServicesForSeo(query: ServiceQuery = {}) {
  return await fetchFreshJson<PaginatedResponse<ServiceListItem>>(apiPaths.services, {
    page_size: query.page_size ?? 40,
    category: query.category,
    search: query.search,
    featured: query.featured,
    city: query.city,
  });
}

export const getServiceDetailForSeo = cache(async (slug: string) => {
  try {
    return await fetchFreshJson<ServiceDetail>(apiPaths.serviceDetail(slug));
  } catch (error) {
    if (error instanceof CatalogueError && error.status === 404) return null;
    throw error;
  }
});

export async function getServiceReviewsForSeo(serviceId: string) {
  try {
    return await fetchJson<PaginatedResponse<Review>>(apiPaths.serviceReviews(serviceId), { page_size: 100 });
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getSeoLandingPagesForSeo() {
  const pages = await fetchJson<SeoLandingPageSummary[]>(apiPaths.seoPages);
  const [services, areas] = await Promise.all([
    getChennaiServicesForSeo(),
    fetchJson<ServiceArea[]>(apiPaths.serviceAreas, { city: "Chennai" }),
  ]);
  const added = Object.keys(localCityPages).filter((slug) => !pages.some((page) => page.page_slug === slug)).flatMap((slug) => {
    const page = buildLocalCityPage(slug, services, areas);
    return page ? [page] : [];
  });
  return [...pages, ...added];
}

async function addLocationServiceLinks(page: SeoLandingPage) {
  if (page.city !== "Chennai" && page.city !== "Coimbatore") return page;
  const cityServices = page.city === "Chennai" ? await getChennaiServicesForSeo() : await getAllServicesForSeo(page.city);
  const areaServices = page.postal_code
    ? await getAllServicesForSeo({ postal_code: page.postal_code })
    : cityServices;
  const availableIds = new Set(areaServices.map((service) => service.id));
  const localServices = cityServices.filter((service) => availableIds.has(service.id));
  const links = localServiceFamilyLinks(localServices, page.city, page.area_slug)
    .filter((link) => link.path !== page.path);
  const existingRelatedPages = page.related_pages ?? [];
  const existingPaths = new Set(existingRelatedPages.map((link) => link.path));
  return { ...page, related_pages: [...existingRelatedPages, ...links.filter((link) => !existingPaths.has(link.path))] };
}

export const getSeoLandingPageForSeo = cache(async (pageSlug: string) => {
  try {
    return await addLocationServiceLinks(await fetchJson<SeoLandingPage>(apiPaths.seoPageDetail(pageSlug)));
  } catch (error) {
    if (error instanceof CatalogueError && error.status === 404) {
      const [citySlug, areaSlug] = pageSlug.split("/");
      const city = citySlug?.endsWith("-coimbatore") ? "Coimbatore" : citySlug?.endsWith("-chennai") ? "Chennai" : null;
      if (!city || !Object.hasOwn(localCityPages, citySlug.replace(new RegExp(`-${city.toLowerCase()}$`), "-chennai"))) return null;
      const areas = await fetchJson<ServiceArea[]>(apiPaths.serviceAreas, { city });
      const area = areaSlug ? areas.find((item) => item.localities.some((locality) => locality.slug === areaSlug) ||
        item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === areaSlug) : null;
      if (areaSlug && !area) return null;
      const cityServices = city === "Chennai" ? await getChennaiServicesForSeo() : await getAllServicesForSeo(city);
      const selectedServices = area ? await getAllServicesForSeo({ postal_code: area.postal_code }) : cityServices;
      const availableIds = new Set(selectedServices.map((service) => service.id));
      const services = cityServices.filter((service) => availableIds.has(service.id));
      const page = area
        ? city === "Chennai"
          ? buildLocalAreaPage(pageSlug, city, area, services)
          : buildCoimbatorePage(pageSlug, areas, services)
        : city === "Chennai"
          ? buildLocalCityPage(pageSlug, services, areas)
          : buildCoimbatorePage(pageSlug, areas, services);
      if (!page) return null;
      if (!area) {
        const faqs = await fetchJson<FAQ[]>(apiPaths.faqs, { service_id: page.services[0].id });
        page.faqs = faqs.map(({ question, answer }) => ({ question, answer }));
        page.related_pages = [{ name: "Browse available service packages", path: `/services/${page.services[0].slug}`, area: "", postal_code: "" }];
      }
      return addLocationServiceLinks(page);
    }
    throw error;
  }
});

// Follow pagination locally, never fetch an arbitrary URL supplied by an API.
export async function getAllServicesForSeo(cityOrQuery?: string | { city?: string; postal_code?: string }) {
  const query = typeof cityOrQuery === "string" ? { city: cityOrQuery } : cityOrQuery;
  const services: ServiceListItem[] = [];
  let page = 1;
  for (;;) {
    const response = await fetchJson<PaginatedResponse<ServiceListItem>>(apiPaths.services, { page_size: 100, page, ...query });
    services.push(...response.results);
    if (!response.next) break;
    if (!response.results.length || page >= 500) throw new Error("Catalogue pagination did not terminate safely");
    page += 1;
  }
  return Array.from(new Map(services.map((service) => [service.id, service])).values());
}

const getChennaiServicesForSeo = cache(() => getAllServicesForSeo("Chennai"));

export async function getSitemapCatalogue() {
  const [services, categories, pages] = await Promise.all([
    getAllServicesForSeo(),
    fetchJson<ServiceCategory[]>(apiPaths.serviceCategories),
    fetchJson<SeoLandingPageSummary[]>(apiPaths.seoPages),
  ]);
  const [available, areas] = await Promise.all([
    getChennaiServicesForSeo(),
    fetchJson<ServiceArea[]>(apiPaths.serviceAreas, { city: "Chennai" }),
  ]);
  const added = Object.keys(localCityPages).filter((slug) => !pages.some((page) => page.page_slug === slug)).flatMap((slug) => {
    const page = buildLocalCityPage(slug, available, areas);
    return page ? [page] : [];
  });
  const published = pages.filter((page) => page.is_indexable && page.city === "Chennai" && page.path === `/${page.page_slug}` && /^\/[a-z0-9-]+-chennai(?:\/[a-z0-9-]+)?$/.test(page.path));
  const imagePages: SeoLandingPage[] = [];
  // Bound API concurrency as the published locality catalogue grows.
  for (let offset = 0; offset < published.length; offset += 8) {
    const batch = await Promise.all(published.slice(offset, offset + 8).map((page) => getSeoLandingPageForSeo(page.page_slug)));
    imagePages.push(...batch.filter((page): page is SeoLandingPage => Boolean(page)));
  }
  return { services, categories, categoryServices: available, pages: [...imagePages, ...added] };
}
