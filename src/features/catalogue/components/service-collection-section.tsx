import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { routes } from "@/constants/routes";
import { ServiceCard } from "@/features/catalogue/components/service-card";
import type { ServiceListItem } from "@/features/catalogue/types";

export function ServiceCollectionSection({
  title,
  description,
  services,
}: {
  title: string;
  description?: string;
  services: ServiceListItem[];
}) {
  if (!services.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Explore" title={title} description={description} href={routes.services} linkLabel="See all" />
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {services.slice(0, 4).map((service) => (
          <div key={service.id} className="min-w-[260px] snap-start lg:min-w-0">
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
      <Link href={routes.services} className="sr-only">
        Browse all Purple Squad services
      </Link>
    </section>
  );
}
