"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { trustPromises } from "@/config/design";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { AddToCartButton, CartSummary } from "@/features/cart/cart-controls";
import { ServiceIcon } from "@/features/catalogue/components/service-icon";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";
import type { ServiceCategory, ServiceListItem } from "@/features/catalogue/types";
import { formatDuration, formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

const homeCategories = [
  { name: "Home Appliances", query: "appliance", image: "/images/categories/home-appliances-repair.png" },
  { name: "Water Tank Cleaning", query: "water tank", image: "/images/service-icons/water-tank.webp" },
  { name: "Sofa Repair", query: "sofa", image: "/images/service-icons/sofa-repair.webp" },
  { name: "Mosquito Net", query: "mosquito", image: "/images/service-icons/mosquito-net.webp" },
];

const popularCategories = [
  ...homeCategories,
  ...[
    ["AC Service", "AC", "ac"],
    ["Washing Machine", "washing machine", "washing-machine"],
    ["Refrigerator", "refrigerator", "refrigerator"],
    ["Water Purifier", "water purifier", "water-purifier"],
    ["TV Repair", "TV", "tv"],
    ["Geyser", "geyser", "geyser"],
    ["Microwave", "microwave", "microwave"],
    ["Dishwasher", "dishwasher", "dishwasher"],
  ].map(([name, query, icon]) => ({ name, query, image: `/images/service-icons/${icon}.webp` })),
];

const spotlights = [
  { title: "Give your sofa a fresh start", label: "Sofa repair", description: "Comfort worth coming home to.", query: "sofa", image: "/images/hero/sofa-repair-hd.png" },
  { title: "Cleaner tanks. Fresher homes.", label: "Water tank cleaning", description: "Care for your home's water storage.", query: "water tank", image: "/images/hero/water-tank-cleaning-hd.png" },
  { title: "Everyday appliances, expert care", label: "Home appliances", description: "Keep your home running smoothly.", query: "washing machine", image: "/images/hero/washing-machine-service-hd.png" },
  { title: "Stay cool, all year", label: "AC service", description: "Give your cooling the care it deserves.", query: "AC", image: "/images/hero/ac-service-hd.png" },
  { title: "Fresh air. Peaceful evenings.", label: "Mosquito net", description: "Find the right net for your home.", query: "mosquito", image: "/images/service-icons/mosquito-net.webp" },
  { title: "Keep the freshness going", label: "Refrigerator repair", description: "Expert care for your kitchen essential.", query: "refrigerator", image: "/images/service-icons/refrigerator.webp" },
];

const serviceSearchHref = (query: string) => `${routes.services}?q=${encodeURIComponent(query)}`;

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

export function HomeDiscovery() {
  const categories = useServiceCategories();
  const services = useServices({ page_size: 80 });
  const featured = useServices({ featured: true, page_size: 10 });
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const allServices = useMemo(() => services.data?.results ?? [], [services.data?.results]);
  const visibleServices = Array.from(new Map(
    [...(featured.data?.results ?? []), ...allServices].map((service) => [service.id, service]),
  ).values());
  const selectedCategoryServices = useMemo(() => servicesForCategory(allServices, selectedCategory), [allServices, selectedCategory]);
  const whatsappUrl = env.supportWhatsapp ? `https://wa.me/${env.supportWhatsapp.replace(/\D/g, "")}` : routes.support;

  return (
    <div className="bg-white">
      <section className="overflow-hidden border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:px-8 lg:py-9">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="max-w-lg text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Home services at <span className="text-primary">your doorstep</span>
              </h1>
            </motion.div>

            <p className="mt-4 text-lg text-secondary">Trusted professionals. Hassle-free service.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {homeCategories.map((item) => {
                const category = categories.data?.find((entry) => `${entry.name} ${entry.slug}`.toLowerCase().includes(item.query));
                const content = <><Image src={item.image} alt="" width={64} height={64} className="h-16 w-16 object-contain" /><span className="text-sm font-semibold">{item.name}</span></>;
                const tileClass = "flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl bg-[#f7f5fa] p-4 text-center transition hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
                return category ? <button key={item.name} type="button" onClick={() => setSelectedCategory(category)} className={tileClass}>{content}</button> : <Link key={item.name} href={serviceSearchHref(item.query)} className={tileClass}>{content}</Link>;
              })}
            </div>
            <Button asChild className="mt-6"><Link href={routes.services}>Book a Service <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>

          <HeroImageMosaic />
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

      <section aria-label="AC service" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-xl bg-[#eee5fc] p-6 sm:p-10">
          <Image src="/images/hero/ac-service-hd.png" alt="Purple Squad AC service professional" fill sizes="(min-width: 1280px) 1200px, 100vw" className="-z-20 object-cover object-right" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#eee5fc] via-[#eee5fc]/95 to-transparent" />
          <p className="font-semibold text-primary">AC Service</p>
          <h2 className="mt-2 max-w-64 text-3xl font-bold sm:max-w-none sm:text-4xl">Stay Cool, All Year</h2>
          <p className="mt-3 max-w-56 text-sm text-secondary sm:max-w-none">Professional AC service at your doorstep.</p>
          <Button asChild className="mt-5"><Link href={serviceSearchHref("AC")}>Book AC Service <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <SpotlightCarousel />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Popular service categories</h2>
          <Link href={routes.services} className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <HorizontalServiceRow label="Popular service categories" cardWidth="w-36 sm:w-40">
          {popularCategories.map((item) => (
            <Link key={item.name} href={serviceSearchHref(item.query)} className="group flex flex-col items-center gap-3 rounded-xl border border-purple-100 bg-[#f8f5fc] p-5 text-center transition hover:border-primary/40 hover:bg-primary-soft">
              <Image src={item.image} alt="" width={88} height={88} className="h-20 w-20 object-contain transition group-hover:scale-105" />
              <h3 className="text-sm font-semibold group-hover:text-primary">{item.name}</h3>
            </Link>
          ))}
        </HorizontalServiceRow>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
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
            <HorizontalServiceRow label="Popular services near you" cardWidth="w-52 sm:w-60">
              {visibleServices.map((service) => (
                <CompactPackageCard key={service.id} service={service} />
              ))}
            </HorizontalServiceRow>
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

function HorizontalServiceRow({ label, cardWidth, children }: { label: string; cardWidth: string; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  function scroll(direction: number) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.current?.scrollBy({ left: direction * row.current.clientWidth * 0.85, behavior: reducedMotion ? "instant" : "smooth" });
  }
  return (
    <div className="min-w-0">
      <div className="mb-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="icon" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div ref={row} role="region" aria-label={label} tabIndex={0} className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-primary">
        {Array.isArray(children) ? children.map((child, index) => <div key={index} className={`${cardWidth} shrink-0 snap-start`}>{child}</div>) : children}
      </div>
    </div>
  );
}

function SpotlightCarousel() {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || hovered || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !motionPreference.matches) setStart((value) => (value + 1) % spotlights.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused]);

  function change(direction: number) {
    setPaused(true);
    setStart((value) => (value + direction + spotlights.length) % spotlights.length);
  }

  return (
    <section aria-label="Service spotlights" aria-roledescription="carousel" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">In the spotlight</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" aria-label="Previous spotlight" onClick={() => change(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button type="button" variant="outline" size="icon" aria-label={paused ? "Play spotlights" : "Pause spotlights"} onClick={() => setPaused((value) => !value)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
          <Button type="button" variant="outline" size="icon" aria-label="Next spotlight" onClick={() => change(1)}><ChevronRight className="h-4 w-4" /></Button>
          <Link href={routes.services} className="ml-2 text-sm font-semibold text-primary">View all</Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3" aria-live="off">
        {[0, 1, 2].map((offset) => {
          const item = spotlights[(start + offset) % spotlights.length];
          return (
            <Link key={offset} href={serviceSearchHref(item.query)} className="group relative isolate flex min-h-80 flex-col items-start justify-end overflow-hidden rounded-xl bg-[#e9dff7] p-5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <Image src={item.image} alt="" fill sizes="(min-width: 1280px) 390px, (min-width: 640px) 33vw, 100vw" className={`-z-20 transition duration-300 group-hover:scale-105 motion-reduce:transition-none ${item.image.endsWith("webp") ? "object-contain p-6" : "object-cover"}`} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1e1036]/95 via-[#1e1036]/35 to-transparent" />
              <span className="mb-auto rounded bg-primary px-2.5 py-1 text-xs font-semibold">{item.label}</span>
              <h3 className="mt-8 max-w-60 text-2xl font-bold leading-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-white/90">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary">Explore <ArrowRight className="h-4 w-4" /></span>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {spotlights.map((item, index) => <button key={item.query} type="button" aria-label={`Show spotlight: ${item.label}`} aria-current={start === index ? "true" : undefined} onClick={() => { setPaused(true); setStart(index); }} className="grid h-8 w-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"><span className={`h-2 rounded-full ${start === index ? "w-6 bg-primary" : "w-2 bg-primary/25"}`} /></button>)}
      </div>
    </section>
  );
}

function HeroImageMosaic() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-3">
        <ServiceImage src="/images/hero/ac-service-hd.png" alt="Purple Squad technician servicing an air conditioner" priority className="h-40 rounded-xl sm:h-56" />
        <ServiceImage src="/images/hero/water-tank-cleaning-hd.png" alt="Purple Squad technician cleaning a rooftop water tank" className="h-40 rounded-xl sm:h-56" />
      </div>
      <div className="grid gap-3">
        <ServiceImage src="/images/hero/washing-machine-service-hd.png" alt="Purple Squad technician servicing a washing machine" priority className="h-40 rounded-xl sm:h-56" />
        <ServiceImage src="/images/hero/sofa-repair-hd.png" alt="Purple Squad technician repairing a sofa" className="h-40 rounded-xl sm:h-56" />
      </div>
    </div>
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
        <AddToCartButton service={service} />
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
              <div className="border-b border-border bg-white p-4 lg:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-foreground">{selectedFamily}</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-secondary">
                      Select a package and continue to booking.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label="Close package popup">
                      <X className="h-5 w-5" />
                    </Button>
                  </Dialog.Close>
                </div>
                <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => setSelectedFamily(null)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back to services
                </Button>
              </div>

              <aside className="hidden min-h-0 overflow-y-auto border-r border-border bg-white p-4 lg:block">
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

              <main className="min-h-0 flex-1 overflow-y-auto p-4 [-webkit-overflow-scrolling:touch] sm:p-6 lg:flex-none">
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
                <CartSummary />
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
        <AddToCartButton service={service} />
      </div>
    </article>
  );
}
