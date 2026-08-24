"use client";

import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeading } from "@/components/common/section-heading";
import { routes } from "@/constants/routes";
import { CategoryFilter } from "@/features/catalogue/components/category-filter";
import { LocationSelector } from "@/features/catalogue/components/location-selector";
import { ServiceCard } from "@/features/catalogue/components/service-card";
import { ServiceSearch } from "@/features/catalogue/components/service-search";
import { CategorySkeletonGrid, ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";
import { getCategoryName } from "@/features/catalogue/utils";

export function ServicesListing() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  const categories = useServiceCategories();
  const services = useServices({
    category: category ?? undefined,
    search: query ?? undefined,
    page_size: 24,
  });
  const allServices = useServices({ page_size: 24 });

  const title = getCategoryName(categories.data ?? [], category);
  const serviceResults = services.data?.results ?? [];
  const searchPool = allServices.data?.results ?? serviceResults;

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
          <SectionHeading
            eyebrow="Services"
            title={query ? `Results for "${query}"` : title}
            description="Search, filter, and compare Purple Squad services from the live catalogue."
          />
          <ServiceSearch services={searchPool} initialValue={query ?? ""} compact />
          </div>
        </div>

        <LocationSelector />

        {categories.isLoading ? <CategorySkeletonGrid /> : null}
        {categories.isError ? <ErrorState error={categories.error} onRetry={() => categories.refetch()} /> : null}
        {categories.data?.length ? <CategoryFilter categories={categories.data} activeCategory={category} query={query} /> : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {services.isLoading ? <ServiceCardSkeletonGrid count={9} /> : null}
        {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
        {serviceResults.length ? (
          <>
          <p className="mb-4 text-sm font-semibold text-secondary">Showing {serviceResults.length} services</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {serviceResults.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          </>
        ) : null}
        {services.data && serviceResults.length === 0 ? (
          <EmptyState
            title={query ? "No results for this search" : category ? "No services available in this category" : "No services found"}
            description={
              query
                ? "Try a different search term or clear the filters."
                : category
                  ? "This category is available, but no active services are published under it yet."
                  : "The backend catalogue is reachable, but no active services are published yet."
            }
            actionLabel="Clear filters"
            actionHref={routes.services}
          />
        ) : null}
      </section>
    </div>
  );
}
