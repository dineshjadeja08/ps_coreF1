import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { ServicesListing } from "@/features/catalogue/components/services-listing";
import { getServiceCategoriesForSeo, getServicesForSeo } from "@/features/catalogue/server";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { canonicalFor, compactDescription, defaultOgImagePath, servicesJsonLd } from "@/lib/seo";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q, category } = await searchParams;
  const title = q ? `${q} Services` : "Search Home Services";
  const description = compactDescription(
    q
      ? `Search Purple Squad for ${q} services in Chennai and Coimbatore with clear pricing and verified professionals.`
      : "Search Purple Squad home services and book verified professionals.",
  );
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const path = params.size ? `/search?${params.toString()}` : "/search";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalFor(path),
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: `${title} | Purple Squad`,
      description,
      url: canonicalFor(path),
      images: [defaultOgImagePath],
    },
    twitter: {
      title: `${title} | Purple Squad`,
      description,
      images: [defaultOgImagePath],
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category } = await searchParams;
  const [services, categories] = await Promise.all([getServicesForSeo({ category, search: q, page_size: 40, city: "Chennai" }), getServiceCategoriesForSeo()]);
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const path = params.size ? `/search?${params.toString()}` : "/search";

  return (
    <>
      <JsonLd data={servicesJsonLd(services.results, path)} />
      <Suspense
        fallback={
          <div className="page-container py-10">
            <ServiceCardSkeletonGrid count={9} />
          </div>
        }
      >
        <ServicesListing mode="search" initialServices={services} initialCategories={categories} initialQuery={{ category, q }} />
      </Suspense>
    </>
  );
}
