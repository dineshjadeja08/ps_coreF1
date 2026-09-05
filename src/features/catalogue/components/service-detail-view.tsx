"use client";

import { ChevronRight, Clock, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import { PriceDisplay } from "@/features/catalogue/components/price-display";
import { ServiceCard } from "@/features/catalogue/components/service-card";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceDetailSkeleton } from "@/features/catalogue/components/skeletons";
import { useServiceDetail, useServiceReviews, useServices } from "@/features/catalogue/queries";
import { formatDuration, formatPrice, getCurrentPrice } from "@/features/catalogue/utils";

function TextSection({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) return null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">{body}</p>
    </section>
  );
}

export function ServiceDetailView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const service = useServiceDetail(slug);
  const related = useServices({
    category: service.data?.category.slug,
    page_size: 4,
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
  const duration = formatDuration(detail.estimated_duration_minutes);
  const relatedServices = (related.data?.results ?? []).filter((item) => item.slug !== detail.slug).slice(0, 3);

  return (
    <div className="bg-[#f6f7f9] pb-24 md:pb-0">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-secondary">
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

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div>
            <ServiceImage src={detail.cover_image} alt={detail.name} priority className="aspect-[16/10] rounded-lg shadow-sm" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Verified expert", "Clear pricing", "Easy support"].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-white px-3 py-3 text-center text-xs font-bold text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-[0_18px_55px_rgba(18,18,20,0.08)] lg:sticky lg:top-28">
            <div className="flex flex-wrap gap-2">
              <Badge>{detail.category.name}</Badge>
              <Badge>
                <ShieldCheck className="h-3 w-3" />
                PS Verified
              </Badge>
              {detail.is_featured || detail.is_popular ? <Badge className="bg-warning/10 text-warning">Featured</Badge> : null}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{detail.name}</h1>
            {detail.short_description ? <p className="mt-3 text-base leading-7 text-secondary">{detail.short_description}</p> : null}
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-secondary">
              <Star className="h-4 w-4 fill-warning text-warning" />
              Rated service quality when customer reviews are available
            </p>
            <div className="mt-5 rounded-lg bg-muted p-4">
              <PriceDisplay service={detail} />
              {duration ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
                  <Clock className="h-4 w-4 text-primary" />
                  Estimated duration: {duration}
                </p>
              ) : null}
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <Button asChild size="lg">
                <AuthActionLink href={`/book?service=${encodeURIComponent(detail.slug)}`} serviceSlug={detail.slug}>
                  Book Now
                </AuthActionLink>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.services}>Compare other services</Link>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:px-8">
        <TextSection title="Description" body={detail.description} />
        <TextSection title="What's included" body={detail.whats_included} />
        <TextSection title="What's excluded" body={detail.whats_excluded} />
        <TextSection title="Important notes" body={detail.important_notes} />
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

      {relatedServices.length ? (
        <section className="mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Related" title={`More in ${detail.category.name}`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((item) => (
              <ServiceCard key={item.id} service={item} />
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
