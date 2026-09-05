import type { Metadata } from "next";
import { Suspense } from "react";

import { ServicesListing } from "@/features/catalogue/components/services-listing";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";

export const metadata: Metadata = {
  title: "Search Services",
  description: "Search Purple Squad home services and book verified professionals.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-10">
          <ServiceCardSkeletonGrid count={9} />
        </div>
      }
    >
      <ServicesListing mode="search" />
    </Suspense>
  );
}
