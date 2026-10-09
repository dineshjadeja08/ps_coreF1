import { env } from "@/config/env";
import { cache } from "react";
import { apiPaths } from "@/lib/api/endpoints";
import { buildLocalCityPage, localCityPages } from "@/features/catalogue/local-seo";
import type { FAQ, PaginatedResponse, Review, SeoLandingPage, SeoLandingPageSummary, ServiceCategory, ServiceDetail, ServiceListItem } from "@/types/api";

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
  try {
    return await fetchFreshJson<PaginatedResponse<ServiceListItem>>(apiPaths.services, {
      page_size: query.page_size ?? 40,
      category: query.category,
      search: query.search,
      featured: query.featured,
      city: query.city,
    });
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
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
    return await fetchJson<PaginatedResponse<Review>>(apiPaths.serviceReviews(serviceId), { page_size: 20 });
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getSeoLandingPagesForSeo() {
  try {
    const pages = await fetchJson<SeoLandingPageSummary[]>(apiPaths.seoPages);
    const services = await getChennaiServicesForSeo();
    const added = Object.keys(localCityPages).filter((slug) => !pages.some((page) => page.page_slug === slug)).flatMap((slug) => {
      const page = buildLocalCityPage(slug, services);
      return page ? [page] : [];
    });
    return [...pages, ...added];
  } catch {
    return [];
  }
}

export const getSeoLandingPageForSeo = cache(async (pageSlug: string) => {
  try {
    return await fetchJson<SeoLandingPage>(apiPaths.seoPageDetail(pageSlug));
  } catch (error) {
    if (error instanceof CatalogueError && error.status === 404) {
      if (!Object.hasOwn(localCityPages, pageSlug)) return null;
      const page = buildLocalCityPage(pageSlug, await getChennaiServicesForSeo());
      if (!page) return null;
      const faqs = await fetchJson<FAQ[]>(apiPaths.faqs, { service_id: page.services[0].id });
      page.faqs = faqs.map(({ question, answer }) => ({ question, answer }));
      page.related_pages = [{ name: "Browse available service packages", path: `/services/${page.services[0].slug}`, area: "", postal_code: "" }];
      return page;
    }
    throw error;
  }
});

// Follow pagination locally, never fetch an arbitrary URL supplied by an API.
export async function getAllServicesForSeo(city?: string) {
  const services: ServiceListItem[] = [];
  let page = 1;
  for (;;) {
    const response = await fetchJson<PaginatedResponse<ServiceListItem>>(apiPaths.services, { page_size: 100, page, city });
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
  const available = await getChennaiServicesForSeo();
  const added = Object.keys(localCityPages).filter((slug) => !pages.some((page) => page.page_slug === slug)).flatMap((slug) => {
    const page = buildLocalCityPage(slug, available);
    return page ? [page] : [];
  });
  return { services, categories, pages: [...pages, ...added] };
}
