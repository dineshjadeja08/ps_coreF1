"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowLeft, Search, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { routes } from "@/constants/routes";
import { CartStickyBar } from "@/features/catalogue/components/landing/cart-sticky-bar";
import { ServiceGroupRow } from "@/features/catalogue/components/landing/service-group-row";
import { groupTvServicesForLanding } from "@/features/catalogue/group-services";
import { useServiceReviewsAggregate, useServices } from "@/features/catalogue/queries";
import type { PaginatedResponse, ServiceListItem } from "@/features/catalogue/types";
import { useSelectedLocation } from "@/features/location/selected-location";

const ServiceOptionSheet = dynamic(
  () => import("@/features/catalogue/components/landing/service-option-sheet").then((module) => module.ServiceOptionSheet),
  { loading: () => null },
);

export function TvLanding({ initialServices, sourceCategorySlug }: { initialServices: PaginatedResponse<ServiceListItem>; sourceCategorySlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pushedSheet = useRef(false);
  const location = useSelectedLocation();
  const services = useServices(
    { category: sourceCategorySlug, page_size: 100, ...(location.pincode ? { postal_code: location.pincode } : { city: location.city }) },
    initialServices,
  );
  const groups = useMemo(() => groupTvServicesForLanding(services.data?.results ?? []), [services.data?.results]);
  const selectedSlug = searchParams.get("service");
  const selectedGroup = groups.find((group) => group.slug === selectedSlug) ?? null;
  const aggregate = useServiceReviewsAggregate(groups.flatMap((group) => group.options.map((option) => option.id)));
  const averageRating = aggregate.reviews.length
    ? aggregate.reviews.reduce((sum, review) => sum + review.rating, 0) / aggregate.reviews.length
    : null;

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
          <h1 className="max-w-xl text-2xl font-extrabold leading-[1.18] tracking-tight text-foreground sm:text-3xl">TV Repair &amp; Services in {location.city}</h1>
          {averageRating ? <p className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-foreground"><Star className="h-4 w-4 fill-warning text-warning" />{averageRating.toFixed(1)} ({aggregate.reviews.length} reviews)</p> : null}
        </section>

        <section className="px-4 pb-5 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted sm:aspect-[2/1]">
            <Image src="/images/services/tv.png" alt="TV repair and wall-mount services by Purple Squad" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-contain" />
          </div>
        </section>

        <div className="h-2 bg-muted" aria-hidden="true" />
        <section aria-label="TV repair and wall-mount services">
          {services.isError ? <div className="p-4"><ErrorState title="We could not load TV services" error={services.error} onRetry={() => services.refetch()} /></div> : null}
          {groups.map((group, index) => <ServiceGroupRow key={group.slug} group={group} eager={index === 0} onOpen={() => openGroup(group.slug)} />)}
          {!services.isError && !groups.length ? <div className="p-4"><EmptyState title="TV services are unavailable" description="No active TV repair or wall-mount options are published for this location right now." /></div> : null}
        </section>
        <div className="h-2 bg-muted" aria-hidden="true" />
      </div>

      <CartStickyBar />
      {selectedGroup ? <ServiceOptionSheet group={selectedGroup} onClose={closeGroup} /> : null}
    </div>
  );
}
