"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, CheckCircle2, Clock, Grid2X2, ListFilter, Search, ShieldCheck, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { CategorySkeletonGrid, ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";
import type { ServiceCategory, ServiceListItem } from "@/features/catalogue/types";
import { formatDuration, formatPrice, getCategoryName, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";
import { cn } from "@/lib/utils";

const popularSearches = ["AC Service", "Bathroom Cleaning", "Washing Machine", "Refrigerator", "Water Purifier", "CCTV"];

export function ServicesListing() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");
  const query = searchParams.get("q") ?? "";
  const [searchText, setSearchText] = useState(query);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const categories = useServiceCategories();
  const services = useServices({
    category: category ?? undefined,
    search: query || undefined,
    page_size: 40,
  });
  const allServices = useServices({ page_size: 80 });

  const categoryTitle = getCategoryName(categories.data ?? [], category);
  const selectedCategory = useMemo(
    () => (categories.data ?? []).find((item) => item.slug === category) ?? null,
    [categories.data, category],
  );
  const serviceResults = services.data?.results ?? [];
  const servicePool = allServices.data?.results ?? serviceResults;
  const serviceCounts = useMemo(() => getServiceCounts(servicePool), [servicePool]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (searchText.trim()) params.set("q", searchText.trim());
    router.push(params.toString() ? `/services?${params.toString()}` : routes.services);
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <Badge className="w-fit">Book in a few clicks</Badge>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Select a category, choose your service
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary sm:text-base">
              Browse Purple Squad services with live pricing, verified technicians and quick booking for Chennai, Bangalore and Coimbatore.
            </p>
          </div>
          <form onSubmit={submitSearch} className="self-end">
            <label htmlFor="service-marketplace-search" className="sr-only">
              Search services
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="service-marketplace-search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search AC, cleaning, purifier..."
                className="h-12 rounded-lg pl-9"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularSearches.map((item) => (
                <Link
                  key={item}
                  href={`/services?q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
                >
                  {item}
                </Link>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 pb-20 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <CategoryPanel
              categories={categories.data ?? []}
              activeCategory={category}
              query={query}
              serviceCounts={serviceCounts}
              loading={categories.isLoading}
              error={categories.isError ? categories.error : null}
              onRetry={() => categories.refetch()}
            />
            <BookingHelpPanel />
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(true)}>
              <ListFilter className="h-4 w-4" />
              Categories
            </Button>
            <p className="text-sm font-semibold text-secondary">{serviceResults.length ? `${serviceResults.length} services` : "Services"}</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {query ? "Search results" : selectedCategory ? "Selected category" : "All services"}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-foreground">
                  {query ? `Results for "${query}"` : categoryTitle}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
                  {selectedCategory?.description || "Pick the exact service you need, then continue straight to address and slot selection."}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={routes.services}>Clear filters</Link>
              </Button>
            </div>
          </div>

          {services.isLoading ? <ServiceCardSkeletonGrid count={8} /> : null}
          {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
          {serviceResults.length ? (
            <div className="space-y-3">
              {serviceResults.map((service, index) => (
                <ServicePackageRow key={service.id} service={service} highlight={index === 0 && Boolean(category || query)} />
              ))}
            </div>
          ) : null}
          {services.data && serviceResults.length === 0 ? (
            <EmptyState
              title={query ? "No results for this search" : category ? "No services available in this category" : "No services found"}
              description={
                query
                  ? "Try a simpler term like AC, cleaning, washing machine, purifier or refrigerator."
                  : category
                    ? "This category is active, but no services are published under it yet."
                    : "The catalogue is reachable, but no active services are published yet."
              }
              actionLabel="Show all services"
              actionHref={routes.services}
            />
          ) : null}
        </div>
      </section>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categories={categories.data ?? []}
        activeCategory={category}
        query={query}
        serviceCounts={serviceCounts}
      />
    </div>
  );
}

function CategoryPanel({
  categories,
  activeCategory,
  query,
  serviceCounts,
  loading,
  error,
  onRetry,
}: {
  categories: ServiceCategory[];
  activeCategory?: string | null;
  query?: string | null;
  serviceCounts: Map<string, number>;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  if (loading) return <CategorySkeletonGrid />;
  if (error) return <ErrorState title="We could not load categories" error={error} onRetry={onRetry} />;

  return (
    <section className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 px-2 py-1">
        <Grid2X2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Categories</h2>
      </div>
      <div className="space-y-1">
        <CategoryLink label="All services" href={query ? `/services?q=${encodeURIComponent(query)}` : routes.services} active={!activeCategory} count={sumCounts(serviceCounts)} />
        {categories.map((category) => (
          <CategoryLink
            key={category.id}
            label={category.name}
            href={buildCategoryHref(category.slug, query)}
            active={activeCategory === category.slug}
            count={serviceCounts.get(category.slug) ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  categories,
  activeCategory,
  query,
  serviceCounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ServiceCategory[];
  activeCategory?: string | null;
  query?: string | null;
  serviceCounts: Map<string, number>;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed inset-x-4 top-16 z-50 max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background p-4 shadow-[var(--shadow-card)] focus:outline-none">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">Choose category</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-secondary">Select a category to see matching services.</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Close categories">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="space-y-2">
            <CategoryLink label="All services" href={query ? `/services?q=${encodeURIComponent(query)}` : routes.services} active={!activeCategory} count={sumCounts(serviceCounts)} />
            {categories.map((category) => (
              <CategoryLink
                key={category.id}
                label={category.name}
                href={buildCategoryHref(category.slug, query)}
                active={activeCategory === category.slug}
                count={serviceCounts.get(category.slug) ?? 0}
              />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CategoryLink({ label, href, active, count }: { label: string; href: string; active: boolean; count: number }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
        active ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "text-secondary hover:bg-muted hover:text-foreground",
      )}
    >
      <span>{label}</span>
      <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
        {count}
      </span>
    </Link>
  );
}

function ServicePackageRow({ service, highlight }: { service: ServiceListItem; highlight?: boolean }) {
  const currentPrice = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;
  const duration = formatDuration(service.estimated_duration_minutes);

  return (
    <article
      className={cn(
        "grid gap-0 overflow-hidden rounded-lg border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)] sm:grid-cols-[156px_1fr]",
        highlight ? "border-primary/40 ring-2 ring-primary/10" : "border-border",
      )}
    >
      <Link href={routes.serviceDetail(service.slug)} aria-label={`View ${service.name}`} className="block">
        <ServiceImage src={service.cover_image} alt={service.name} className="aspect-[16/10] rounded-none sm:h-full sm:min-h-40" />
      </Link>
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_190px] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
            {highlight ? <Badge className="bg-warning/10 text-warning">Popular choice</Badge> : null}
          </div>
          <h3 className="mt-3 text-xl font-bold text-foreground">
            <Link href={routes.serviceDetail(service.slug)} className="hover:text-primary">
              {service.name}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-secondary">{service.short_description || service.category.name}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary">
            {duration ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {duration}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" />
              4.8 rated
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Starts at</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{currentPrice ?? "View price"}</span>
            {showOffer ? <span className="text-sm text-muted-foreground line-through">{basePrice}</span> : null}
          </div>
          <div className="mt-3 grid gap-2">
            <Button asChild>
              <AuthActionLink href={`/book?service=${encodeURIComponent(service.slug)}`} serviceSlug={service.slug}>
                Book now
              </AuthActionLink>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.serviceDetail(service.slug)}>
                Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BookingHelpPanel() {
  return (
    <section className="rounded-lg border border-border bg-muted p-4">
      <h2 className="text-sm font-bold text-foreground">How booking works</h2>
      <div className="mt-3 space-y-3">
        {["Select service", "Confirm address", "Pick slot", "Pay advance"].map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-primary">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{step}</p>
              <p className="text-xs leading-5 text-secondary">
                {index === 0 ? "Choose exactly what you need." : index === 1 ? "Use a saved service address." : index === 2 ? "All available slots are shown." : "Secure checkout opens next."}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 flex gap-2 rounded-lg bg-surface p-3 text-xs font-semibold leading-5 text-secondary">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        No long enquiry form before service selection.
      </p>
    </section>
  );
}

function buildCategoryHref(slug: string, query?: string | null) {
  return `/services?category=${encodeURIComponent(slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
}

function getServiceCounts(services: ServiceListItem[]) {
  const counts = new Map<string, number>();
  for (const service of services) {
    counts.set(service.category.slug, (counts.get(service.category.slug) ?? 0) + 1);
  }
  return counts;
}

function sumCounts(counts: Map<string, number>) {
  return Array.from(counts.values()).reduce((total, count) => total + count, 0);
}
