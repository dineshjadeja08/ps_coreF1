import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { ServiceDetailView } from "@/features/catalogue/components/service-detail-view";
import { ServiceDetailSkeleton } from "@/features/catalogue/components/skeletons";
import { getSeoLandingPageForSeo, getSeoLandingPagesForSeo, getServiceReviewsForSeo } from "@/features/catalogue/server";
import { breadcrumbJsonLd, canonicalFor, localBusinessJsonLd, serviceJsonLd } from "@/lib/seo";
import { publicPageMetadata } from "@/lib/page-metadata";
import { serviceHeroImage } from "@/lib/service-images";

type SeoLandingPageProps = {
  params: Promise<{ serviceSlug: string; areaSlug?: string[] }>;
};

function pageSlug(serviceSlug: string, areaSlug?: string[]) {
  if (areaSlug && areaSlug.length > 1) return null;
  return [serviceSlug, areaSlug?.[0]].filter(Boolean).join("/");
}

export async function generateStaticParams() {
  const pages = await getSeoLandingPagesForSeo();
  // Prebuild city pages only; existing area URLs resolve on demand without
  // multiplying builds and API traffic for near-identical locality pages.
  return pages.filter((page) => page.is_indexable && page.city === "Chennai" && !page.area).map((page) => {
    const [serviceSlug, area] = page.page_slug.split("/");
    return { serviceSlug, areaSlug: area ? [area] : [] };
  });
}

export async function generateMetadata({ params }: SeoLandingPageProps): Promise<Metadata> {
  const values = await params;
  const slug = pageSlug(values.serviceSlug, values.areaSlug);
  const page = slug ? await getSeoLandingPageForSeo(slug) : null;
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };

  return {
    ...publicPageMetadata(page.path, page.meta_title.replace(/\s*\|\s*Purple Squad$/i, ""), page.meta_description, page.services[0] ? serviceHeroImage(page.services[0]) : undefined),
    alternates: { canonical: canonicalFor(page.canonical_override || page.path) },
    robots: { index: page.is_indexable, follow: true },
  };
}

export default async function SeoLandingPage({ params }: SeoLandingPageProps) {
  const values = await params;
  const slug = pageSlug(values.serviceSlug, values.areaSlug);
  const page = slug ? await getSeoLandingPageForSeo(slug) : null;
  if (!page || page.page_slug !== slug) notFound();

  const primaryService = page.services[0];
  if (!primaryService) notFound();
  const reviews = await getServiceReviewsForSeo(primaryService.id);

  const currentName = page.area ? `${page.service_name} in ${page.area}` : `${page.service_name} in ${page.city}`;

  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: currentName, path: page.path },
          ]),
          serviceJsonLd(primaryService, page.path),
        ]}
      />
      <Suspense fallback={<ServiceDetailSkeleton />}>
        <ServiceDetailView initialService={primaryService} serviceSlug={primaryService.slug} landingTitle={page.service_name} initialServices={{ count: page.services.length, next: null, previous: null, results: page.services }} initialReviews={reviews} seoContent={page} />
      </Suspense>
    </>
  );
}
