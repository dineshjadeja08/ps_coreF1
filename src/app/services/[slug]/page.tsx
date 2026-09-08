import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ServiceDetailView } from "@/features/catalogue/components/service-detail-view";
import { getServiceDetailForSeo, getServiceReviewsForSeo } from "@/features/catalogue/server";
import { canonicalFor, compactDescription, defaultOgImagePath, serviceJsonLd } from "@/lib/seo";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  const service = await getServiceDetailForSeo(slug);
  if (service) {
    const description = compactDescription(service.short_description || service.description, `Book ${service.name} with Purple Squad.`);
    return {
      title: service.name,
      description,
      keywords: [service.name, service.category.name, `${service.name} Chennai`, `${service.name} Bangalore`, `${service.name} Coimbatore`],
      alternates: {
        canonical: canonicalFor(`/services/${service.slug}`),
      },
      openGraph: {
        title: `${service.name} | Purple Squad`,
        description,
        url: canonicalFor(`/services/${service.slug}`),
        images: [service.cover_image || defaultOgImagePath],
      },
      twitter: {
        title: `${service.name} | Purple Squad`,
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
  const service = await getServiceDetailForSeo(slug);
  const reviews = service ? await getServiceReviewsForSeo(service.id) : null;

  return (
    <>
      {service ? <JsonLd data={serviceJsonLd(service, `/services/${service.slug}`, reviews?.results)} /> : null}
      <ServiceDetailView />
    </>
  );
}
