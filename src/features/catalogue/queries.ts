"use client";

import { useQueries, useQuery } from "@tanstack/react-query";

import { publicCatalogueApi } from "@/features/catalogue/api";
import type { PaginatedResponse, ServiceDetail, ServiceListItem } from "@/features/catalogue/types";
import type { HomepageBanner } from "@/types/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useServiceCategories() {
  return useQuery({
    queryKey: queryKeys.serviceCategories,
    queryFn: publicCatalogueApi.listCategories,
    staleTime: 5 * 60_000,
  });
}

export function useHomepageBanners(placement: HomepageBanner["placement"] = "MAIN") {
  return useQuery({
    queryKey: ["homepage-banners", placement],
    queryFn: () => publicCatalogueApi.listHomepageBanners(placement),
    staleTime: 60_000,
  });
}

export function useServices(
  params?: { category?: string; search?: string; featured?: boolean; city?: string; postal_code?: string; page_size?: number },
  initialData?: PaginatedResponse<ServiceListItem>,
) {
  return useQuery({
    queryKey: queryKeys.services(params),
    queryFn: () => publicCatalogueApi.listServices(params),
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
    staleTime: 2 * 60_000,
  });
}

export function usePublicServiceAreas(city?: string) {
  return useQuery({
    queryKey: ["service-areas", city ?? "all"],
    queryFn: () => publicCatalogueApi.listServiceAreas(city),
    staleTime: 5 * 60_000,
  });
}

export function useServiceDetail(slug: string, initialData?: ServiceDetail) {
  return useQuery({
    queryKey: queryKeys.serviceDetail(slug),
    queryFn: () => publicCatalogueApi.getService(slug),
    enabled: Boolean(slug),
    initialData,
    staleTime: 2 * 60_000,
  });
}

export function useServiceReviews(serviceId?: string) {
  return useQuery({
    queryKey: serviceId ? queryKeys.serviceReviews(serviceId) : ["catalogue", "reviews", "missing"],
    queryFn: () => publicCatalogueApi.listServiceReviews(serviceId ?? ""),
    enabled: Boolean(serviceId),
  });
}

export function useServiceReviewsAggregate(serviceIds: string[]) {
  const uniqueIds = Array.from(new Set(serviceIds.filter(Boolean)));
  const queries = useQueries({
    queries: uniqueIds.map((serviceId) => ({
      queryKey: queryKeys.serviceReviews(serviceId),
      queryFn: () => publicCatalogueApi.listServiceReviews(serviceId),
      staleTime: 2 * 60_000,
    })),
  });
  return {
    reviews: queries.flatMap((query) => query.data?.results ?? []),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  };
}

export function useServiceFaqs(serviceId?: string) {
  return useQuery({
    queryKey: ["catalogue", "faqs", serviceId ?? "missing"],
    queryFn: () => publicCatalogueApi.listServiceFaqs(serviceId ?? ""),
    enabled: Boolean(serviceId),
  });
}

export function useServiceAreaCheck(postalCode: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.serviceArea(postalCode),
    queryFn: () => publicCatalogueApi.checkServiceArea(postalCode),
    enabled,
    retry: 0,
  });
}
