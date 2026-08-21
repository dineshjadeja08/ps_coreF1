import type { Metadata } from "next";

import { publicCatalogueApi } from "@/features/catalogue/api";
import { ServiceDetailView } from "@/features/catalogue/components/service-detail-view";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const service = await publicCatalogueApi.getService(slug);
    return {
      title: service.name,
      description: service.short_description || service.description || `Book ${service.name} with Purple Squad.`,
      openGraph: {
        title: `${service.name} | Purple Squad`,
        description: service.short_description || service.description || `Book ${service.name} with Purple Squad.`,
        images: service.cover_image ? [service.cover_image] : undefined,
      },
    };
  } catch {
    return {
      title: "Service",
      description: "View Purple Squad service details.",
    };
  }
}

export default function ServiceDetailPage() {
  return <ServiceDetailView />;
}
