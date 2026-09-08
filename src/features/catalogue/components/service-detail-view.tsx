"use client";

import { Check, ChevronRight, Clock, Percent, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import { ServiceIcon } from "@/features/catalogue/components/service-icon";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceDetailSkeleton } from "@/features/catalogue/components/skeletons";
import { useServiceDetail, useServiceReviews, useServices } from "@/features/catalogue/queries";
import type { ServiceDetail, ServiceListItem } from "@/features/catalogue/types";
import { formatDuration, formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

function TextSection({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) return null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">{body}</p>
    </section>
  );
}

function packageFamilyKey(service: Pick<ServiceListItem, "name" | "short_description" | "category">) {
  const text = `${service.name} ${service.short_description} ${service.category.name}`.toLowerCase();
  if (text.includes("ac ")) return "ac";
  if (text.includes("washing")) return "washing";
  if (text.includes("refrigerator") || text.includes("fridge")) return "refrigerator";
  if (text.includes("wall mount")) return "tv-wall-mount";
  if (text.includes("tv")) return "tv";
  if (text.includes("purifier")) return "water-purifier";
  if (text.includes("geyser")) return "geyser";
  if (text.includes("cctv")) return "cctv";
  if (text.includes("dishwasher")) return "dishwasher";
  if (text.includes("chimney")) return "chimney";
  if (text.includes("water tank") || text.includes("sump")) return "water-tank";
  if (text.includes("mosquito")) return "mosquito-net";
  if (text.includes("sofa")) return "sofa";
  if (text.includes("bathroom")) return "bathroom";
  if (text.includes("house")) return "house-cleaning";
  return service.category.slug;
}

function packageSectionTitle(service: ServiceDetail) {
  const family = packageFamilyKey(service);
  if (family === "ac") return "AC service packages";
  if (family === "water-tank") return "Water tank and sump cleaning packages";
  if (family === "chimney") return "Chimney cleaning packages";
  if (family === "tv-wall-mount") return "TV wall mount packages";
  return `${service.name} packages`;
}

export function ServiceDetailView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const service = useServiceDetail(slug);
  const related = useServices({
    category: service.data?.category.slug,
    page_size: 80,
  });
  const reviews = useServiceReviews(service.data?.id);

  if (service.isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (service.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="We could not load this service" error={service.error} onRetry={() => service.refetch()} />
      </div>
    );
  }

  if (!service.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState title="Service not found" description="This service is not available in the public catalogue." />
      </div>
    );
  }

  const detail = service.data;
  const allRelated = related.data?.results ?? [];
  const currentFamily = packageFamilyKey(detail);
  const familyPackages = allRelated.filter((item) => packageFamilyKey(item) === currentFamily);
  const packageServices = familyPackages.length > 1 ? familyPackages : [detail, ...allRelated.filter((item) => item.slug !== detail.slug).slice(0, 5)];
  const serviceOptions = allRelated.length ? allRelated : [detail];

  return (
    <div className="bg-[#f7f7f7] pb-24 md:pb-0">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-secondary">
            <Link href={routes.home} className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={routes.services} className="hover:text-primary">
              Services
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{detail.name}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-foreground">{detail.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-secondary">
                <Star className="h-4 w-4 fill-primary text-primary" />
                4.8 service quality when customer reviews are available
              </p>

              <aside className="mt-6 hidden rounded-lg border border-border bg-white p-4 lg:block">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-secondary">Select a service</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {serviceOptions.slice(0, 8).map((item) => (
                    <Link key={item.id} href={routes.serviceDetail(item.slug)} className="group text-center">
                      <ServiceIcon label={item.name} className="h-16 w-full rounded-md bg-[#f5f5f5]" imageClassName="p-2" />
                      <span className="mt-2 line-clamp-2 block text-xs font-bold leading-4 text-foreground group-hover:text-primary">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </aside>
            </div>

            <ServiceImage src={detail.cover_image} alt={detail.name} priority className="h-64 rounded-lg sm:h-[380px]" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)_280px] lg:px-8">
        <aside className="hidden border-r border-border bg-white p-4 lg:block">
          <div className="sticky top-28">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-secondary">Packages</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="mt-4 space-y-2">
              {packageServices.slice(0, 10).map((item) => (
                <a key={item.id} href={`#package-${item.slug}`} className="block rounded-md px-3 py-2 text-sm font-semibold text-secondary hover:bg-muted hover:text-foreground">
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <main className="border-border bg-white p-5 lg:border-r lg:p-7">
          <div className="border-b border-border pb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Recommended</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{packageSectionTitle(detail)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              Select a package, confirm your address, pick a slot, and pay the booking advance.
            </p>
          </div>

          <div className="divide-y divide-border">
            {packageServices.map((item, index) => (
              <PackageRow key={item.id} service={item} featured={index === 0} />
            ))}
          </div>

          <div className="mt-7 grid gap-4">
            <TextSection title="Description" body={detail.description} />
            <TextSection title="What's included" body={detail.whats_included} />
            <TextSection title="What's excluded" body={detail.whats_excluded} />
            <TextSection title="Important notes" body={detail.important_notes} />
          </div>
        </main>

        <aside className="hidden bg-[#f7f7f7] p-5 lg:block">
          <div className="sticky top-28 space-y-4">
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-success/10 text-success">
                  <Percent className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">Transparent pricing</p>
                  <p className="mt-1 text-xs leading-5 text-secondary">Final extra work is quoted before repair starts.</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-5">
              <p className="flex items-center gap-2 text-lg font-bold text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Purple Squad Promise
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-secondary">
                {["Verified professionals", "Clear package pricing", "Support for reschedule and payment"].map((item) => (
                  <p key={item} className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-foreground" />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-5 text-center">
              <p className="text-sm font-bold text-foreground">Cart</p>
              <p className="mt-2 text-sm text-secondary">Select a package to continue booking.</p>
            </div>
          </div>
        </aside>
      </section>

      {reviews.data?.results?.length ? (
        <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Reviews" title="Customer feedback" />
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.data.results.map((review) => (
              <article key={review.id} className="rounded-lg border border-border bg-surface p-5">
                <p className="font-semibold text-foreground">Rating {review.rating}/5</p>
                <p className="mt-2 text-sm leading-6 text-secondary">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface p-3 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-secondary">Starts at</p>
            <p className="text-lg font-bold text-foreground">{formatPrice(getCurrentPrice(detail)) ?? "Price unavailable"}</p>
          </div>
          <Button asChild>
            <AuthActionLink href={`/book?service=${encodeURIComponent(detail.slug)}`} serviceSlug={detail.slug}>
              Book Now
            </AuthActionLink>
          </Button>
        </div>
      </div>
    </div>
  );
}

function PackageRow({ service, featured }: { service: ServiceListItem; featured?: boolean }) {
  const price = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;
  const duration = formatDuration(service.estimated_duration_minutes);

  return (
    <article id={`package-${service.slug}`} className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_116px] sm:items-start">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-success">Package</p>
        <h3 className="mt-1 text-lg font-bold text-foreground">{service.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-secondary">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            4.8
          </span>
          {duration ? (
            <>
              <span>-</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
            </>
          ) : null}
          {featured ? (
            <>
              <span>-</span>
              <span>Popular choice</span>
            </>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{price ?? "View price"}</span>
          {showOffer ? <span className="text-xs text-muted-foreground line-through">{basePrice}</span> : null}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-secondary">{service.short_description || service.category.name}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={routes.serviceDetail(service.slug)}>View details</Link>
        </Button>
      </div>
      <div className="grid gap-2 rounded-lg bg-[#f1f1f3] p-3 text-center">
        {showOffer ? <p className="text-3xl font-extrabold leading-8 text-success">Save</p> : null}
        <Button asChild size="sm">
          <AuthActionLink href={`/book?service=${encodeURIComponent(service.slug)}`} serviceSlug={service.slug}>
            Add
          </AuthActionLink>
        </Button>
      </div>
    </article>
  );
}
