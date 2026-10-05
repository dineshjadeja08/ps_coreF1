import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { ServiceDetailView } from "@/features/catalogue/components/service-detail-view";
import { ServiceDetailSkeleton } from "@/features/catalogue/components/skeletons";
import { getSeoLandingPageForSeo, getSeoLandingPagesForSeo } from "@/features/catalogue/server";
import { breadcrumbJsonLd, canonicalFor, localBusinessJsonLd, serviceJsonLd } from "@/lib/seo";

type SeoLandingPageProps = {
  params: Promise<{ serviceSlug: string; areaSlug?: string[] }>;
};

function pageSlug(serviceSlug: string, areaSlug?: string[]) {
  if (areaSlug && areaSlug.length > 1) return null;
  return [serviceSlug, areaSlug?.[0]].filter(Boolean).join("/");
}

export async function generateStaticParams() {
  const pages = await getSeoLandingPagesForSeo();
  return pages.map((page) => {
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
    title: page.meta_title.replace(/\s*\|\s*Purple Squad$/i, ""),
    description: page.meta_description,
    alternates: { canonical: page.canonical_override || canonicalFor(page.path) },
    robots: { index: page.is_indexable, follow: true },
    openGraph: {
      type: "website",
      title: page.meta_title,
      description: page.meta_description,
      url: canonicalFor(page.path),
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta_title,
      description: page.meta_description,
    },
  };
}

export default async function SeoLandingPage({ params }: SeoLandingPageProps) {
  const values = await params;
  const slug = pageSlug(values.serviceSlug, values.areaSlug);
  const page = slug ? await getSeoLandingPageForSeo(slug) : null;
  if (!page || page.page_slug !== slug) notFound();

  const primaryService = page.services[0];
  if (!primaryService) notFound();

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
        <ServiceDetailView initialService={primaryService} serviceSlug={primaryService.slug} />
      </Suspense>
    </>
  );
}
