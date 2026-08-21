import type { Metadata } from "next";
import { Suspense } from "react";

import { ServicesListing } from "@/features/catalogue/components/services-listing";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse and search Purple Squad home services from the live catalogue.",
};

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ServiceCardSkeletonGrid count={9} />
        </div>
      }
    >
      <ServicesListing />
    </Suspense>
  );
}
