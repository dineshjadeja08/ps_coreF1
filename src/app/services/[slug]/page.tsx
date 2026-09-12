import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ServiceDetailView } from "@/features/catalogue/components/service-detail-view";
import { getServiceDetailForSeo, getServiceReviewsForSeo } from "@/features/catalogue/server";
import { breadcrumbJsonLd, canonicalFor, compactDescription, defaultOgImagePath, localBusinessJsonLd, serviceJsonLd } from "@/lib/seo";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

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
