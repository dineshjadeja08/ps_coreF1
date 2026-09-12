"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronRight, Clock, Percent, ShieldCheck, Star, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeading } from "@/components/common/section-heading";
import { routes } from "@/constants/routes";
import { AddToCartButton, CartSummary } from "@/features/cart/cart-controls";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceDetailSkeleton } from "@/features/catalogue/components/skeletons";
import { useServiceDetail, useServiceFaqs, useServiceReviews, useServices } from "@/features/catalogue/queries";
import type { ServiceDetail, ServiceListItem } from "@/features/catalogue/types";
import type { FAQ } from "@/types/api";
import { formatDuration, formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

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

export function ServiceDetailView({ initialService }: { initialService?: ServiceDetail | null }) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const service = useServiceDetail(slug, initialService ?? undefined);
  const related = useServices({
    category: service.data?.category.slug,
    page_size: 80,
  });
  const reviews = useServiceReviews(service.data?.id);
  const [selectedPackage, setSelectedPackage] = useState<ServiceListItem | null>(null);
  const selectedPackageDetail = useServiceDetail(selectedPackage?.slug ?? "");
  const selectedPackageFaqs = useServiceFaqs(selectedPackage?.id);

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
  const packageServices = familyPackages.length > 1 ? familyPackages : [detail];

  return (
    <div className="overflow-x-clip bg-[#f7f7f7]">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-1.5 text-xs text-secondary sm:mb-5 sm:gap-2 sm:text-sm">
            <Link href={routes.home} className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={routes.services} className="hover:text-primary">
              Services
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="min-w-0 truncate text-foreground">{detail.name}</span>
          </nav>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="min-w-0 rounded-lg border border-border bg-white p-3 shadow-sm sm:p-4">
              <ServiceImage
                src={detail.cover_image}
                alt={`${detail.name} service by Purple Squad in Chennai`}
                priority
                className="aspect-[16/10] h-auto w-full rounded-lg bg-white sm:aspect-[16/7]"
                imageClassName="object-contain sm:object-cover"
              />
              <div className="mt-5">
                <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{detail.name} in Chennai</h1>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-secondary">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  4.8 service quality
                </p>
              </div>
            </div>

            <aside className="hidden space-y-5 lg:block">
              <CartSummary />
              <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <p className="flex items-center gap-2 text-lg font-bold text-foreground"><ShieldCheck className="h-5 w-5 text-primary" />Why Purple Squad?</p>
                <div className="mt-4 space-y-4 text-sm text-secondary">
                  {["Verified and vetted professionals", "Transparent package pricing", "Matched to your service needs"].map((item) => <p key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</p>)}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid min-w-0 max-w-7xl gap-0 px-3 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
        <main className="min-w-0 border-border bg-white p-4 sm:p-5 lg:border-r lg:p-7">
          <div className="border-b border-border pb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Available services</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{packageSectionTitle(detail)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              Tap a service to view its full details and add it to your cart.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {packageServices.map((item, index) => (
              <PackageRow key={item.id} service={item} featured={index === 0} onReadMore={() => setSelectedPackage(item)} />
            ))}
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

            <CartSummary />
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

      <PackageDetailsDialog
        open={Boolean(selectedPackage)}
        service={selectedPackageDetail.data ?? selectedPackage}
        loading={selectedPackageDetail.isLoading}
        faqs={selectedPackageFaqs.data ?? []}
        onOpenChange={(open) => { if (!open) setSelectedPackage(null); }}
      />
    </div>
  );
}

function PackageRow({ service, featured, onReadMore }: { service: ServiceListItem; featured?: boolean; onReadMore: () => void }) {
  const price = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;
  const duration = formatDuration(service.estimated_duration_minutes);

  return (
    <button
      id={`package-${service.slug}`}
      type="button"
      onClick={onReadMore}
      className="group grid min-w-0 gap-4 rounded-lg border border-border bg-white p-4 text-left transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-success">Service</p>
        <h3 className="mt-1 break-words text-lg font-bold text-foreground">{service.name}</h3>
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
      </div>
      <span className="inline-flex items-center gap-1 self-end text-sm font-bold text-primary sm:self-center">
        Read more
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function PackageDetailsDialog({
  open,
  service,
  loading,
  faqs,
  onOpenChange,
}: {
  open: boolean;
  service: ServiceListItem | ServiceDetail | null;
  loading: boolean;
  faqs: FAQ[];
  onOpenChange: (open: boolean) => void;
}) {
  const detail = service as ServiceDetail | null;
  const price = service ? formatPrice(getCurrentPrice(service)) : null;
  const basePrice = service ? formatPrice(service.base_price) : null;
  const showOffer = Boolean(service && hasOfferPrice(service) && basePrice);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed inset-x-2 top-1/2 z-50 max-h-[94vh] -translate-y-1/2 overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-2xl outline-none sm:inset-x-auto sm:left-1/2 sm:max-h-[92vh] sm:w-[min(680px,calc(100vw-2rem))] sm:-translate-x-1/2">
          {service ? <ServiceImage src={service.cover_image} alt={service.name} className="aspect-[16/10] h-auto w-full rounded-none bg-white sm:h-64 sm:aspect-auto" imageClassName="object-contain sm:object-cover" /> : null}
          <Dialog.Close className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-foreground shadow-md hover:bg-white" aria-label="Close package details">
            <X className="h-5 w-5" />
          </Dialog.Close>

          <div className="min-w-0 border-b border-border p-4 sm:p-6">
            {loading && !service ? <p className="text-sm text-secondary">Loading package details...</p> : null}
            {service ? (
              <div className="min-w-0 pr-10">
                <Dialog.Title className="text-xl font-bold text-foreground sm:text-2xl">{service.name}</Dialog.Title>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-secondary"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />4.8 customer rating</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2"><span className="text-xl font-bold text-foreground">{price ?? "Price unavailable"}</span>{showOffer ? <span className="text-sm text-muted-foreground line-through">{basePrice}</span> : null}</div>
                  <AddToCartButton service={service} className="shrink-0" />
                </div>
              </div>
            ) : null}
          </div>

          {detail ? (
            <div className="min-w-0 divide-y divide-border px-4 sm:px-6">
              <ModalSection title="Our Process" body={detail.description || detail.short_description} />
              <ModalSection title="Included" body={detail.whats_included} />
              <ModalSection title="Warranty & Important notes" body={detail.important_notes} />
              <ModalSection title="Not Included" body={detail.whats_excluded} />
              <section className="py-6">
                <h3 className="text-lg font-bold text-foreground">Frequently Asked Questions</h3>
                {faqs.length ? <div className="mt-3 divide-y divide-border rounded-md border border-border">{faqs.map((faq) => <details key={faq.id} className="group p-4"><summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-foreground">{faq.question}</summary><p className="mt-3 whitespace-pre-line text-sm leading-6 text-secondary">{faq.answer}</p></details>)}</div> : <p className="mt-2 text-sm text-secondary">No package-specific questions have been added yet.</p>}
              </section>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModalSection({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) return null;
  return <section className="min-w-0 py-5 sm:py-6"><h3 className="text-lg font-bold text-foreground">{title}</h3><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-secondary">{body}</p></section>;
}
