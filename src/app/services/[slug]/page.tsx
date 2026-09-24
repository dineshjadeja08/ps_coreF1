import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { ServiceDetailView } from "@/features/catalogue/components/service-detail-view";
import { ServicesListing } from "@/features/catalogue/components/services-listing";
import { WaterTankLanding } from "@/features/catalogue/components/landing/water-tank-landing";
import { isWaterTankService } from "@/features/catalogue/group-services";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { getServiceCategoriesForSeo, getServiceDetailForSeo, getServiceReviewsForSeo, getServicesForSeo } from "@/features/catalogue/server";
import { breadcrumbJsonLd, canonicalFor, compactDescription, defaultOgImagePath, localBusinessJsonLd, serviceJsonLd, servicesJsonLd } from "@/lib/seo";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getServiceCategoriesForSeo();
  const category = categories.find((item) => item.slug === slug);

  if (category) {
    const description = compactDescription(category.description, `Book ${category.name} services in Chennai with Purple Squad.`);
    return {
      title: `${category.name} Services in Chennai`,
      description,
      alternates: { canonical: canonicalFor(`/services/${category.slug}`) },
    };
  }

  const service = await getServiceDetailForSeo(slug);
  if (service) {
    const description = compactDescription(
      service.short_description || service.description,
      `Book ${service.name} at your doorstep in Chennai with Purple Squad.`,
    );
    return {
      title: `${service.name} in Chennai`,
      description,
      keywords: [service.name, service.category.name, `${service.name} Chennai`],
      alternates: {
        canonical: canonicalFor(`/services/${service.slug}`),
      },
      openGraph: {
        title: `${service.name} in Chennai | Purple Squad`,
        description,
        url: canonicalFor(`/services/${service.slug}`),
        images: [service.cover_image || defaultOgImagePath],
      },
      twitter: {
        title: `${service.name} in Chennai | Purple Squad`,
        description,
        images: [service.cover_image || defaultOgImagePath],
      },
    };
  }

  return {
    title: "Service",
    description: "View Purple Squad service details.",
    alternates: {
      canonical: canonicalFor(`/services/${slug}`),
    },
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const categories = await getServiceCategoriesForSeo();
  const category = categories.find((item) => item.slug === slug);

  if (slug === "water-tank-cleaning") {
    const sourceCategory = category ?? categories.find((item) => item.slug === "cleaning");
    const services = await getServicesForSeo({ category: sourceCategory?.slug ?? "cleaning", page_size: 100 });
    const waterServices = services.results.filter(isWaterTankService);
    const initialServices = { ...services, count: waterServices.length, results: waterServices, next: null, previous: null };
    return (
      <>
        <JsonLd data={servicesJsonLd(waterServices, "/services/water-tank-cleaning")} />
        <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-8"><ServiceCardSkeletonGrid count={3} /></div>}>
          <WaterTankLanding initialServices={initialServices} sourceCategorySlug={sourceCategory?.slug ?? "cleaning"} />
        </Suspense>
      </>
    );
  }

  if (category) {
    const services = await getServicesForSeo({ category: category.slug, page_size: 60 });
    return (
      <>
        <JsonLd data={servicesJsonLd(services.results, `/services/${category.slug}`)} />
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10"><ServiceCardSkeletonGrid count={8} /></div>}>
          <ServicesListing categorySlug={category.slug} />
        </Suspense>
      </>
    );
  }
  const service = await getServiceDetailForSeo(slug);
  const reviews = service ? await getServiceReviewsForSeo(service.id) : null;

  return (
    <>
      {service ? (
        <JsonLd
          data={[
            localBusinessJsonLd(),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: service.name, path: `/services/${service.slug}` },
            ]),
            serviceJsonLd(service, `/services/${service.slug}`, reviews?.results),
          ]}
        />
      ) : null}
      <ServiceDetailView initialService={service} />
    </>
  );
}
