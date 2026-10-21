"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowLeft, Search, Star, Tag } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { routes } from "@/constants/routes";
import { CartStickyBar } from "@/features/catalogue/components/landing/cart-sticky-bar";
import { ServiceGroupRow } from "@/features/catalogue/components/landing/service-group-row";
import { groupServicesForLanding } from "@/features/catalogue/group-services";
import { useServiceReviewsAggregate, useServices } from "@/features/catalogue/queries";
import type { PaginatedResponse, ServiceListItem } from "@/features/catalogue/types";
import { getActiveOffers } from "@/config/offers";
import { useSelectedLocation } from "@/features/location/selected-location";

const ServiceOptionSheet = dynamic(
  () => import("@/features/catalogue/components/landing/service-option-sheet").then((module) => module.ServiceOptionSheet),
  { loading: () => null },
);
const ReviewsSheet = dynamic(
  () => import("@/features/catalogue/components/landing/reviews-sheet").then((module) => module.ReviewsSheet),
  { loading: () => null },
);

export function WaterTankLanding({ initialServices, sourceCategorySlug }: { initialServices: PaginatedResponse<ServiceListItem>; sourceCategorySlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pushedSheet = useRef(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const location = useSelectedLocation();
  const services = useServices(
    { category: sourceCategorySlug, page_size: 100, ...(location.pincode ? { postal_code: location.pincode } : { city: location.city }) },
    initialServices,
  );
  const groups = useMemo(() => groupServicesForLanding(services.data?.results ?? []), [services.data?.results]);
  const selectedSlug = searchParams.get("service");
  const selectedGroup = groups.find((group) => group.slug === selectedSlug) ?? null;
  const aggregate = useServiceReviewsAggregate(groups.flatMap((group) => group.options.map((option) => option.id)));
  const averageRating = aggregate.reviews.length
    ? aggregate.reviews.reduce((sum, review) => sum + review.rating, 0) / aggregate.reviews.length
    : null;
  const offers = getActiveOffers("water-tank-cleaning");

  useEffect(() => {
    if (selectedSlug && groups.length && !selectedGroup) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("service");
      router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [groups.length, pathname, router, searchParams, selectedGroup, selectedSlug]);

  function openGroup(groupSlug: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("service", groupSlug);
    pushedSheet.current = true;
    router.push(`${pathname}?${next}`, { scroll: false });
  }

  function closeGroup() {
    if (pushedSheet.current) {
      pushedSheet.current = false;
      router.back();
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete("service");
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(routes.services);
  }

  return (
    <div className="overflow-x-clip bg-white pb-24 lg:pb-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex h-16 items-center justify-between px-4 lg:hidden">
          <button type="button" onClick={goBack} aria-label="Go back" className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => router.push(routes.search)} aria-label="Search services" className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Search className="h-5 w-5" /></button>
        </header>

        <section className="px-4 pb-5 pt-2 sm:px-6 lg:pt-8">
          <h1 className="max-w-xl text-2xl font-extrabold leading-[1.18] tracking-tight text-foreground sm:text-3xl">Water Tank &amp; Sump Cleaning in {location.city}</h1>
          {averageRating ? (
            <button type="button" onClick={() => setReviewsOpen(true)} className="mt-3 inline-flex min-h-11 items-center gap-2 border-b border-dashed border-secondary text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-success text-white"><Star className="h-3.5 w-3.5 fill-current" /></span>
              {averageRating.toFixed(1)} ({aggregate.reviews.length} reviews)
            </button>
          ) : null}
        </section>

        {offers.length ? (
          <section aria-label="Available offers" className="mobile-scroll-row flex snap-x gap-3 overflow-x-auto px-4 pb-5 sm:flex-wrap sm:px-6">
            {offers.map((offer) => <article key={offer.id} className="flex min-w-[250px] snap-start items-center gap-3 rounded-lg border border-border bg-white p-3"><Tag className="h-5 w-5 shrink-0 text-success" /><div><p className="truncate text-sm font-extrabold">{offer.title}</p><p className="mt-0.5 text-xs text-secondary">{offer.subtitle}</p></div></article>)}
          </section>
        ) : null}

        <SectionDivider />
        <section className="px-4 py-5 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl sm:aspect-[2/1]">
            <Image src="/images/hero/water-tank-cleaning.webp" alt="Purple Squad water tank cleaning service" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover object-center" />
          </div>
        </section>
        <SectionDivider />

        <section aria-label="Water tank cleaning services">
          {services.isError ? <div className="p-4"><ErrorState title="We could not load water tank services" error={services.error} onRetry={() => services.refetch()} /></div> : null}
          {groups.map((group, index) => <ServiceGroupRow key={group.slug} group={group} eager={index === 0} onOpen={() => openGroup(group.slug)} />)}
          {!services.isError && !groups.length ? <div className="p-4"><EmptyState title="Water tank services are unavailable" description="No active tank or sump cleaning options are published right now." /></div> : null}
        </section>
        <SectionDivider />
      </div>

      <CartStickyBar />
      {selectedGroup ? <ServiceOptionSheet group={selectedGroup} onClose={closeGroup} /> : null}
      {reviewsOpen ? <ReviewsSheet open reviews={aggregate.reviews} onOpenChange={setReviewsOpen} /> : null}
    </div>
  );
}

function SectionDivider() {
  return <div className="h-2 bg-muted" aria-hidden="true" />;
}
