import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { ServicesListing } from "@/features/catalogue/components/services-listing";
import { getServiceCategoriesForSeo, getServicesForSeo, ServiceSeoSnapshot } from "@/features/catalogue/server";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { canonicalFor, compactDescription, defaultOgImagePath, servicesJsonLd } from "@/lib/seo";

type ServicesPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: ServicesPageProps): Promise<Metadata> {
  const { category, q } = await searchParams;
  const categories = await getServiceCategoriesForSeo();
  const selectedCategory = categories.find((item) => item.slug === category);
  const title = selectedCategory ? `${selectedCategory.name} Services in Chennai` : q ? `Search ${q}` : "Home Services in Chennai";
  const description = compactDescription(
    selectedCategory?.description,
    selectedCategory
      ? `Book ${selectedCategory.name.toLowerCase()} services with Purple Squad in Chennai.`
      : q
        ? `Search Purple Squad services for ${q} and book trusted professionals.`
        : "Browse appliance repair, cleaning, CCTV, water purifier, geyser, TV, refrigerator, washing machine, microwave, and dishwasher services.",
  );
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const path = params.size ? `/services?${params.toString()}` : "/services";

  return {
    title,
    description,
    keywords: selectedCategory ? [selectedCategory.name, `${selectedCategory.name} Chennai`] : undefined,
    alternates: {
      canonical: canonicalFor(path),
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

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { category, q } = await searchParams;
  const services = await getServicesForSeo({ category, search: q, page_size: 60 });
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const path = params.size ? `/services?${params.toString()}` : "/services";

  return (
    <>
      <JsonLd data={servicesJsonLd(services.results, path)} />
      <ServiceSeoSnapshot services={services.results} heading="Purple Squad service catalogue" />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <ServiceCardSkeletonGrid count={9} />
          </div>
        }
      >
        <ServicesListing />
      </Suspense>
    </>
  );
}
