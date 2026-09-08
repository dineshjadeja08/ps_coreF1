import { env } from "@/config/env";
import { apiPaths } from "@/lib/api/endpoints";
import type { PaginatedResponse, Review, ServiceCategory, ServiceDetail, ServiceListItem } from "@/types/api";

const revalidateSeconds = 300;

type ServiceQuery = {
  category?: string;
  search?: string;
  featured?: boolean;
  page_size?: number;
};

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
    throw new Error(`Catalogue request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getServiceCategoriesForSeo() {
  try {
    return await fetchJson<ServiceCategory[]>(apiPaths.serviceCategories);
  } catch {
    return [];
  }
}

export async function getServicesForSeo(query: ServiceQuery = {}) {
  try {
    return await fetchJson<PaginatedResponse<ServiceListItem>>(apiPaths.services, {
      page_size: query.page_size ?? 40,
      category: query.category,
      search: query.search,
      featured: query.featured,
    });
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getServiceDetailForSeo(slug: string) {
  try {
    return await fetchJson<ServiceDetail>(apiPaths.serviceDetail(slug));
  } catch {
    return null;
  }
}

export async function getServiceReviewsForSeo(serviceId: string) {
  try {
    return await fetchJson<PaginatedResponse<Review>>(apiPaths.serviceReviews(serviceId), { page_size: 20 });
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export function ServiceSeoSnapshot({ services, heading }: { services: ServiceListItem[]; heading: string }) {
  if (!services.length) return null;

  return (
    <section className="sr-only" aria-label={heading}>
      <h2>{heading}</h2>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <a href={`/services/${service.slug}`}>{service.name}</a>
            <p>{service.short_description || service.category.name}</p>
            <p>
              Starts at ₹{service.effective_price || service.selling_price || service.base_price}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
