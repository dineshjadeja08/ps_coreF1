"use client";

import { useQuery } from "@tanstack/react-query";

import { publicCatalogueApi } from "@/features/catalogue/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useServiceCategories() {
  return useQuery({
    queryKey: queryKeys.serviceCategories,
    queryFn: publicCatalogueApi.listCategories,
  });
}

export function useServices(params?: { category?: string; search?: string; featured?: boolean; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.services(params),
    queryFn: () => publicCatalogueApi.listServices(params),
  });
}

export function useServiceDetail(slug: string) {
  return useQuery({
    queryKey: queryKeys.serviceDetail(slug),
    queryFn: () => publicCatalogueApi.getService(slug),
    enabled: Boolean(slug),
  });
}

export function useServiceReviews(serviceId?: string) {
  return useQuery({
    queryKey: serviceId ? queryKeys.serviceReviews(serviceId) : ["catalogue", "reviews", "missing"],
    queryFn: () => publicCatalogueApi.listServiceReviews(serviceId ?? ""),
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
