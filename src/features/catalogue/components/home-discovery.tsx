"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { trustPromises } from "@/config/design";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import { ServiceIcon } from "@/features/catalogue/components/service-icon";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { CategorySkeletonGrid, ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";
import type { ServiceCategory, ServiceListItem } from "@/features/catalogue/types";
import { formatDuration, formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

const popularSearches = ["AC Service", "Bathroom Cleaning", "Washing Machine", "Refrigerator", "Water Purifier", "Chimney"];
const heroVisuals = ["Bathroom Cleaning", "AC Service", "Chimney Cleaning", "Refrigerator Repair"];

function servicesForCategory(services: ServiceListItem[], category: ServiceCategory | null) {
  if (!category) return [];
  return services.filter((service) => service.category.slug === category.slug);
}

function serviceFamilyFor(service: ServiceListItem) {
  const text = `${service.name} ${service.short_description} ${service.category.name}`.toLowerCase();
  if (text.includes("washing")) return "Washing Machine";
  if (text.includes("refrigerator") || text.includes("fridge")) return "Refrigerator";
  if (text.includes("wall mount")) return "TV Wall Mount";
  if (text.includes("tv")) return "TV Repair";
  if (text.includes("geyser")) return "Geyser";
  if (text.includes("purifier")) return "Water Purifier";
  if (text.includes("microwave")) return "Microwave Oven";
  if (text.includes("dishwasher")) return "Dishwasher";
  if (text.includes("cctv")) return "CCTV Camera";
  if (text.includes("chimney")) return "Chimney";
  if (text.includes("full house")) return "Full House Cleaning";
  if (text.includes("bathroom")) return "Bathroom Cleaning";
  if (text.includes("water tank")) return "Water Tank Cleaning";
  if (text.includes("ac")) return "AC Service";
  return service.category.name;
}

function serviceFamilies(services: ServiceListItem[]) {
  const groups = new Map<string, ServiceListItem[]>();
  for (const service of services) {
    const family = serviceFamilyFor(service);
    groups.set(family, [...(groups.get(family) ?? []), service]);
  }
  return Array.from(groups.entries()).map(([name, items]) => ({ name, services: items }));
}

function getCategoryVisualSrc(category: ServiceCategory) {
  const text = `${category.name} ${category.slug}`.toLowerCase();
  if (text.includes("clean")) return "/images/categories/cleaning.png";
  if (text.includes("appliance") || text.includes("repair") || text.includes("home")) {
    return "/images/categories/home-appliances-repair.png";
  }
  return category.image_url ?? null;
}

export function HomeDiscovery() {
  const categories = useServiceCategories();
  const services = useServices({ page_size: 80 });
  const featured = useServices({ featured: true, page_size: 10 });
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const allServices = useMemo(() => services.data?.results ?? [], [services.data?.results]);
  const visibleServices = (featured.data?.results?.length ? featured.data.results : allServices).slice(0, 8);
  const selectedCategoryServices = useMemo(() => servicesForCategory(allServices, selectedCategory), [allServices, selectedCategory]);
  const whatsappUrl = env.supportWhatsapp ? `https://wa.me/${env.supportWhatsapp.replace(/\D/g, "")}` : routes.support;

  return (
    <div className="bg-[#f7f7f7]">
      <section className="overflow-hidden border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(460px,0.78fr)_1fr] lg:px-8 lg:py-9">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="max-w-lg text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Home services at your doorstep
              </h1>
            </motion.div>

            <div className="mt-9 rounded-lg border border-[#d9d9d9] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">What are you looking for?</h2>
                <Link href={routes.services} className="text-sm font-bold text-primary hover:text-primary-hover">
                  View all
                </Link>
              </div>
              {categories.isLoading ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : null}
              {categories.data?.length ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
                  {categories.data.slice(0, 6).map((category) => (
                    <HeroCategoryButton key={category.id} category={category} services={allServices} onSelect={setSelectedCategory} />
                  ))}
                </div>
              ) : null}
              <div className="mt-7 border-t border-border pt-5">
                <h3 className="text-lg font-semibold text-foreground">Popular searches</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularSearches.slice(0, 4).map((item) => (
                    <Link
                      key={item}
                      href={`${routes.search}?q=${encodeURIComponent(item)}`}
                      className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <HeroImageMosaic services={allServices} />
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px border-t border-border bg-border px-0 sm:grid-cols-4 lg:px-0">
          {[
            ["Transparent pricing", "View price before booking"],
            ["Trained experts", "Verified technicians"],
            ["On-time slots", "Pick your preferred time"],
            ["Support included", "Help before and after service"],
          ].map(([title, description]) => (
            <div key={title} className="bg-white px-4 py-4 sm:px-6 lg:px-8">
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-5 text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Explore</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">All service categories</h2>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.services}>More Categories</Link>
          </Button>
        </div>

        <div className="mt-5">
          {categories.isLoading ? <CategorySkeletonGrid /> : null}
          {categories.isError ? <ErrorState error={categories.error} onRetry={() => categories.refetch()} /> : null}
          {categories.data?.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.data.slice(0, 12).map((category) => (
                <CategoryTile key={category.id} category={category} services={allServices} onSelect={setSelectedCategory} />
              ))}
            </div>
          ) : null}
          {categories.data && categories.data.length === 0 ? (
            <EmptyState title="No categories available yet" description="Add active categories from the admin catalogue." actionLabel="Refresh" actionHref={routes.home} />
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_330px] lg:px-8">
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Frequently booked</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">Popular services near you</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href={routes.services}>
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {services.isLoading || featured.isLoading ? <ServiceCardSkeletonGrid /> : null}
          {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
          {visibleServices.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {visibleServices.map((service) => (
                <CompactPackageCard key={service.id} service={service} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="space-y-3 rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Why choose Purple Squad?</h2>
          {trustPromises.map((promise) => (
            <div key={promise.title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-bold text-foreground">{promise.title}</p>
                <p className="mt-1 text-sm leading-5 text-secondary">{promise.description}</p>
              </div>
            </div>
          ))}
          <Button asChild className="w-full">
            <Link href={whatsappUrl}>Need help choosing?</Link>
          </Button>
        </aside>
      </section>

      <CategoryServicesDialog category={selectedCategory} services={selectedCategoryServices} onClose={() => setSelectedCategory(null)} />
    </div>
  );
}

function HeroCategoryButton({
  category,
  services,
  onSelect,
}: {
  category: ServiceCategory;
  services: ServiceListItem[];
  onSelect: (category: ServiceCategory) => void;
}) {
  const count = services.filter((service) => service.category.slug === category.slug).length;
  const visualSrc = getCategoryVisualSrc(category);

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group grid min-h-28 place-items-center rounded-lg bg-white p-2 text-center transition hover:bg-[#f6f6f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="relative grid h-16 w-full max-w-32 place-items-center overflow-hidden rounded-md bg-[#f5f5f5] text-primary transition duration-300 group-hover:scale-105">
        {visualSrc ? (
          <Image src={visualSrc} alt="" fill unoptimized={visualSrc.startsWith("http")} className="object-cover" />
        ) : (
          <ServiceIcon label={category.name} className="h-full w-full" />
        )}
      </span>
      <span className="mt-2 line-clamp-2 text-xs font-bold leading-4 text-foreground group-hover:text-primary">{category.name}</span>
      <span className="text-[11px] font-semibold leading-4 text-secondary">{count || "New"}</span>
    </button>
  );
}

function HeroImageMosaic({ services }: { services: ServiceListItem[] }) {
  const visuals = heroVisuals.map((label) => ({
    label,
    service: services.find((service) => `${service.name} ${service.category.name}`.toLowerCase().includes(label.split(" ")[0].toLowerCase())),
  }));

  return (
    <div className="hidden min-h-[500px] grid-cols-[1fr_1fr] gap-3 lg:grid">
      <div className="grid gap-3 pt-6">
        <ServiceImage src={visuals[0]?.service?.cover_image} alt={visuals[0].label} priority className="h-[292px] rounded-md" />
        <ServiceImage src={visuals[2]?.service?.cover_image} alt={visuals[2].label} className="h-[210px] rounded-md" />
      </div>
      <div className="grid gap-3">
        <ServiceImage src={visuals[1]?.service?.cover_image} alt={visuals[1].label} priority className="h-[270px] rounded-md" />
        <ServiceImage src={visuals[3]?.service?.cover_image} alt={visuals[3].label} className="h-[238px] rounded-md" />
      </div>
    </div>
  );
}

function CategoryTile({
  category,
  services,
  onSelect,
}: {
  category: ServiceCategory;
  services: ServiceListItem[];
  onSelect: (category: ServiceCategory) => void;
}) {
  const count = services.filter((service) => service.category.slug === category.slug).length;
  const visualSrc = getCategoryVisualSrc(category);

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group overflow-hidden rounded-lg border border-border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_50px_rgba(18,18,20,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="relative block aspect-[4/3] bg-primary-soft">
        {visualSrc ? (
          <Image
            src={visualSrc}
            alt={category.name}
            fill
            unoptimized={visualSrc.startsWith("http")}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center">
            <ServiceIcon label={category.name} className="h-16 w-16" />
          </span>
        )}
      </span>
      <span className="block p-3">
        <span className="block text-sm font-bold leading-5 text-foreground group-hover:text-primary">{category.name}</span>
        <span className="mt-1 block text-xs font-semibold text-secondary">{count || "New"} options</span>
      </span>
    </button>
  );
}

function CompactPackageCard({ service }: { service: ServiceListItem }) {
  const currentPrice = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)]">
      <Link href={routes.serviceDetail(service.slug)} aria-label={`View ${service.name}`}>
        <ServiceImage src={service.cover_image} alt={service.name} className="aspect-[4/3] rounded-none" />
      </Link>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-foreground">
          <Link href={routes.serviceDetail(service.slug)}>{service.name}</Link>
        </h3>
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-secondary">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span>4.8</span>
          <span>Verified</span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{currentPrice ?? "View price"}</span>
          {showOffer ? <span className="text-xs text-muted-foreground line-through">{basePrice}</span> : null}
        </div>
        <Button asChild size="sm" className="mt-3 w-full">
          <AuthActionLink href={`/book?service=${encodeURIComponent(service.slug)}`} serviceSlug={service.slug}>
            Book Now
          </AuthActionLink>
        </Button>
      </div>
    </article>
  );
}

function CategoryServicesDialog({
  category,
  services,
  onClose,
}: {
  category: ServiceCategory | null;
  services: ServiceListItem[];
  onClose: () => void;
}) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const families = useMemo(() => serviceFamilies(services), [services]);
  const selectedServices = selectedFamily ? services.filter((service) => serviceFamilyFor(service) === selectedFamily) : [];
  const showFamilies = !selectedFamily || selectedServices.length === 0;

  function closeDialog() {
    setSelectedFamily(null);
    onClose();
  }

  return (
    <Dialog.Root open={Boolean(category)} onOpenChange={(open) => !open && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          className={
            showFamilies
              ? "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-[0_22px_80px_rgba(0,0,0,0.28)] focus:outline-none sm:p-6"
              : "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94dvh] w-full max-w-7xl flex-col overflow-hidden rounded-t-lg bg-[#f7f7f7] shadow-[0_-22px_80px_rgba(0,0,0,0.28)] focus:outline-none sm:inset-x-4 sm:bottom-4 sm:top-4 sm:rounded-lg lg:grid lg:grid-cols-[230px_minmax(0,1fr)_260px]"
          }
        >
          {showFamilies ? (
            <>
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" size="icon" className="absolute -right-3 -top-12 rounded-md bg-white shadow-sm" aria-label="Close service popup">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
              <Dialog.Title className="text-2xl font-bold text-foreground">{category?.name ?? "Services"}</Dialog.Title>
              <Dialog.Description className="sr-only">Choose a service type to view packages.</Dialog.Description>

              {families.length ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {families.map((family) => (
                    <button
                      key={family.name}
                      type="button"
                      onClick={() => setSelectedFamily(family.name)}
                      className="group text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span className="grid h-20 place-items-center overflow-hidden rounded-lg bg-[#f5f5f5]">
                        <ServiceIcon label={family.name} className="h-full w-full rounded-lg" imageClassName="p-3" />
                      </span>
                      <span className="mt-3 block text-sm font-semibold leading-5 text-foreground group-hover:text-primary">{family.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title="No services published yet" description="Add services under this category from the admin catalogue." />
              )}
            </>
          ) : (
            <>
              <aside className="min-h-0 overflow-y-auto border-b border-border bg-white p-4 lg:border-b-0 lg:border-r">
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" className="mb-4" aria-label="Close package popup">
                    <X className="h-5 w-5" />
                  </Button>
                </Dialog.Close>
                <Dialog.Title className="text-xl font-bold text-foreground">{selectedFamily}</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-secondary">
                  Select a package and continue to booking.
                </Dialog.Description>
                <Button type="button" variant="ghost" size="sm" className="mt-4" onClick={() => setSelectedFamily(null)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1">
                  {families.map((family) => (
                    <button
                      key={family.name}
                      type="button"
                      onClick={() => setSelectedFamily(family.name)}
                      className={`rounded-lg border p-2 text-left transition ${
                        family.name === selectedFamily ? "border-primary bg-primary-soft" : "border-border bg-white hover:border-primary/40"
                      }`}
                    >
                      <ServiceIcon label={family.name} className="h-16 w-full rounded-md" imageClassName="p-2" />
                      <span className="mt-2 block text-xs font-bold leading-4 text-foreground">{family.name}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="min-h-0 overflow-y-auto p-4 [-webkit-overflow-scrolling:touch] sm:p-6">
                <ServiceImage src={selectedServices[0]?.cover_image} alt={selectedFamily ?? category?.name ?? "Service"} priority className="h-48 rounded-lg sm:h-64" />
                <section className="mt-5 rounded-lg border border-border bg-white p-5">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">Packages</p>
                      <h3 className="mt-1 text-2xl font-bold text-foreground">{selectedFamily}</h3>
                    </div>
                    <p className="text-sm font-semibold text-secondary">{selectedServices.length} available</p>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedServices.map((service) => (
                      <DialogPackageRow key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              </main>

              <aside className="hidden min-h-0 overflow-y-auto border-l border-border bg-white p-4 lg:block">
                <div className="rounded-lg border border-border p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    Purple Squad promise
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-secondary">
                    <p>Clear price before booking</p>
                    <p>Verified service professionals</p>
                    <p>Support for reschedule and payment</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-border p-4 text-center">
                  <p className="text-sm font-bold text-foreground">Cart</p>
                  <p className="mt-2 text-sm text-secondary">Select a package to continue.</p>
                </div>
              </aside>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogPackageRow({ service }: { service: ServiceListItem }) {
  const price = formatPrice(getCurrentPrice(service));
  const duration = formatDuration(service.estimated_duration_minutes);

  return (
    <article className="grid gap-4 bg-white py-5 sm:grid-cols-[1fr_116px] sm:items-start">
      <div>
        <h3 className="text-base font-bold text-foreground">{service.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-secondary">{service.short_description || service.category.name}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-secondary">
          {duration ? <span>{duration}</span> : null}
          <span>4.8 rated</span>
          <span>PS verified</span>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={routes.serviceDetail(service.slug)}>View details</Link>
        </Button>
      </div>
      <div className="grid gap-2 rounded-lg bg-[#f4f4f5] p-3 sm:w-28">
        <p className="text-center text-lg font-bold text-foreground">{price ?? "View price"}</p>
        <Button asChild size="sm">
          <AuthActionLink href={`/book?service=${encodeURIComponent(service.slug)}`} serviceSlug={service.slug}>
            Add
          </AuthActionLink>
        </Button>
      </div>
    </article>
  );
}
