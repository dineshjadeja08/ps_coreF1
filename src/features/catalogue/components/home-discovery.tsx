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
import { AddToCartButton } from "@/features/cart/cart-controls";
import { ServiceIcon } from "@/features/catalogue/components/service-icon";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServices } from "@/features/catalogue/queries";
import type { ServiceListItem } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

const homeCategories = [
  { name: "Home Appliances", query: "appliance", image: "/images/categories/home-appliances-repair.png" },
  { name: "Water Tank Cleaning", query: "water tank", image: "/images/service-icons/water-tank.png" },
  { name: "Sofa Repair", query: "sofa", image: "/images/service-icons/sofa-repair.png" },
  { name: "Mosquito Net", query: "mosquito", image: "/images/service-icons/mosquito-net.png" },
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
  ].map(([name, query, icon]) => ({ name, query, image: `/images/service-icons/${icon}.png` })),
];

const spotlights = [
  { title: "Give your sofa a fresh start", label: "Sofa repair", description: "Comfort worth coming home to.", query: "sofa", image: "/images/hero/sofa-repair.webp" },
  { title: "Cleaner tanks. Fresher homes.", label: "Water tank cleaning", description: "Care for your home's water storage.", query: "water tank", image: "/images/hero/water-tank-cleaning.webp" },
  { title: "Everyday appliances, expert care", label: "Home appliances", description: "Keep your home running smoothly.", query: "washing machine", image: "/images/hero/washing-machine-service.webp" },
  { title: "Stay cool, all year", label: "AC service", description: "Give your cooling the care it deserves.", query: "AC", image: "/images/hero/ac-service.webp" },
  { title: "Fresh air. Peaceful evenings.", label: "Mosquito net", description: "Find the right net for your home.", query: "mosquito", image: "/images/services/mosquito-net.png" },
  { title: "Keep the freshness going", label: "Refrigerator repair", description: "Expert care for your kitchen essential.", query: "refrigerator", image: "/images/services/refrigerator.png" },
];

const appliancePopupOrder = [
  { family: "AC Service", label: "AC" },
  { family: "Washing Machine", label: "Washing Machine" },
  { family: "Refrigerator", label: "Refrigerator" },
  { family: "Microwave Oven", label: "Microwave" },
  { family: "Geyser", label: "Geyser" },
  { family: "Water Purifier", label: "Water Purifier" },
  { family: "TV Repair", label: "TV" },
  { family: "CCTV Camera", label: "CCTV" },
  { family: "Dishwasher", label: "Dishwasher" },
] as const;

const serviceSearchHref = (query: string) => `${routes.services}?q=${encodeURIComponent(query)}`;
const preferredServiceSlugs: Record<string, string> = {
  AC: "ac-service",
  appliance: "washing-machine-repair-service",
  mosquito: "mosquito-net-inspection-charge",
  refrigerator: "refrigerator-repair-services",
  sofa: "sofa-repair-inspection-charge",
  "washing machine": "washing-machine-repair-service",
  "water tank": "water-tank-cleaning",
};

function serviceDetailHrefForQuery(services: ServiceListItem[], query: string) {
  const preferred = preferredServiceSlugs[query];
  if (preferred && services.some((item) => item.slug === preferred)) {
    return routes.serviceDetail(preferred);
  }
  const normalized = query.toLowerCase();
  const service = services.find((item) => {
    const searchable = `${item.name} ${item.slug} ${item.short_description} ${item.category.name}`.toLowerCase();
    return searchable.includes(normalized);
  });
  return service ? routes.serviceDetail(service.slug) : serviceSearchHref(query);
}

function serviceFamilyFor(service: ServiceListItem) {
  const text = `${service.name} ${service.short_description} ${service.category.name}`.toLowerCase();
  if (text.includes("washing")) return "Washing Machine";
  if (text.includes("refrigerator") || text.includes("fridge")) return "Refrigerator";
  if (text.includes("cctv")) return "CCTV Camera";
  if (text.includes("wall mount")) return "TV Wall Mount";
  if (text.includes("tv")) return "TV Repair";
  if (text.includes("geyser")) return "Geyser";
  if (text.includes("purifier")) return "Water Purifier";
  if (text.includes("microwave")) return "Microwave Oven";
  if (text.includes("dishwasher")) return "Dishwasher";
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
  const services = useServices({ page_size: 80 });
  const featured = useServices({ featured: true, page_size: 10 });
  const [applianceDialogOpen, setApplianceDialogOpen] = useState(false);

  const allServices = useMemo(() => services.data?.results ?? [], [services.data?.results]);
  const visibleServices = Array.from(new Map(
    [...(featured.data?.results ?? []), ...allServices].map((service) => [service.id, service]),
  ).values());
  const applianceServices = useMemo(() => {
    const allowedFamilies = new Set<string>(appliancePopupOrder.map((item) => item.family));
    return allServices.filter((service) => allowedFamilies.has(serviceFamilyFor(service)));
  }, [allServices]);
  const whatsappUrl = env.supportWhatsapp ? `https://wa.me/${env.supportWhatsapp.replace(/\D/g, "")}` : routes.support;

  return (
    <div className="min-w-0 bg-white">
      <section className="overflow-hidden border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:px-8 lg:py-9">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="max-w-lg text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                Home Appliance Services at <span className="text-primary">Your Doorstep in Chennai</span>
              </h1>
            </motion.div>

            <p className="mt-3 text-base text-secondary sm:text-lg">Trusted professionals. Hassle-free service.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {homeCategories.map((item) => {
                const content = <><Image src={item.image} alt="" width={64} height={64} className="h-16 w-16 object-contain" /><span className="text-sm font-semibold">{item.name}</span></>;
                const tileClass = "flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl bg-[#f7f5fa] p-4 text-center transition hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
                if (item.query === "appliance") {
                  return <button key={item.name} type="button" onClick={() => setApplianceDialogOpen(true)} className={tileClass}>{content}</button>;
                }
                return <Link key={item.name} href={serviceDetailHrefForQuery(allServices, item.query)} className={tileClass}>{content}</Link>;
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
        <div className="relative isolate min-h-56 overflow-hidden rounded-lg bg-[#eee5fc] sm:aspect-[5/1] sm:min-h-0">
          <Image
            src="/images/hero/ac-service.webp"
            alt="Purple Squad AC service professional"
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-[72%_42%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#eee5fc] via-[#eee5fc]/95 to-[#eee5fc]/5 sm:via-[#eee5fc]/80 sm:to-transparent" />
          <div className="relative z-10 flex h-full max-w-[72%] flex-col justify-center p-5 sm:max-w-[48%] sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Limited-time offer</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Stay Cool, All Year</h2>
            <p className="mt-2 text-sm text-secondary">Professional AC service at your doorstep.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-foreground shadow-sm">AC Service from <strong className="text-lg text-primary">₹399</strong></span>
              <Button asChild size="sm"><Link href={serviceDetailHrefForQuery(allServices, "AC")}>Book now <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </div>
      </section>

      <SpotlightCarousel services={allServices} />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold sm:text-2xl">Popular service categories</h2>
          <Link href={routes.services} className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <HorizontalServiceRow label="Popular service categories" cardWidth="w-28 sm:w-40">
          {popularCategories.map((item) => (
            <Link key={item.name} href={serviceSearchHref(item.query)} className="group flex flex-col items-center gap-3 rounded-xl border border-purple-100 bg-[#f8f5fc] p-3 text-center sm:p-5 transition hover:border-primary/40 hover:bg-primary-soft">
              <Image src={item.image} alt="" width={88} height={88} className="h-14 w-14 object-contain sm:h-20 sm:w-20 transition group-hover:scale-105" />
              <h3 className="text-sm font-semibold group-hover:text-primary">{item.name}</h3>
            </Link>
          ))}
        </HorizontalServiceRow>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Frequently booked</p>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Popular services near you</h2>
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
            <HorizontalServiceRow label="Popular services near you" cardWidth="w-[70vw] max-w-64 sm:w-60">
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

      <CategoryServicesDialog open={applianceDialogOpen} services={applianceServices} onClose={() => setApplianceDialogOpen(false)} />
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
      <div className="mb-3 hidden justify-end gap-2 sm:flex">
        <Button type="button" variant="outline" size="icon" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div ref={row} role="region" aria-label={label} tabIndex={0} className="mobile-scroll-row flex max-w-full snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain px-0.5 pb-4 pt-1 focus-visible:outline-2 focus-visible:outline-primary">
        {Array.isArray(children) ? children.map((child, index) => <div key={index} className={`${cardWidth} min-w-0 shrink-0 snap-start`}>{child}</div>) : children}
      </div>
    </div>
  );
}

function SpotlightCarousel({ services }: { services: ServiceListItem[] }) {
  const row = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(5);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  function goTo(index: number) {
    const element = row.current;
    const card = element?.firstElementChild as HTMLElement | null;
    if (!element || !card) return;
    element.scrollTo({ left: index * (card.offsetWidth + 16), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const card = element.firstElementChild as HTMLElement | null;
      if (card) setLast(Math.max(0, spotlights.length - Math.floor((element.clientWidth + 16) / (card.offsetWidth + 16))));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (paused || hovered || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) goTo(start >= last ? 0 : start + 1);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, start, last]);

  return (
    <section aria-label="Service spotlights" aria-roledescription="carousel" className="mx-auto max-w-7xl min-w-0 px-4 pt-6 sm:px-6 lg:px-8" onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">In the spotlight</h2>
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="Previous spotlight" onClick={() => { setPaused(true); goTo(start <= 0 ? last : start - 1); }}><ChevronLeft className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={paused ? "Play spotlights" : "Pause spotlights"} onClick={() => setPaused((value) => !value)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
          <Button type="button" variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="Next spotlight" onClick={() => { setPaused(true); goTo(start >= last ? 0 : start + 1); }}><ChevronRight className="h-4 w-4" /></Button>
          <Link href={routes.services} className="ml-1 whitespace-nowrap text-sm font-semibold text-primary">View all</Link>
        </div>
      </div>
      <div ref={row} role="group" aria-label="Swipe to browse service spotlights" className="mobile-scroll-row flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-0.5 pb-2" onTouchStart={() => setPaused(true)} onScroll={() => {
        const element = row.current;
        const card = element?.firstElementChild as HTMLElement | null;
        if (element && card) setStart(Math.min(last, Math.round(element.scrollLeft / (card.offsetWidth + 16))));
      }}>
        {spotlights.map((item) => <Link key={item.query} href={serviceDetailHrefForQuery(services, item.query)} className="group relative aspect-[3/2] w-[84%] shrink-0 snap-start overflow-hidden rounded-lg sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] focus-visible:outline-2 focus-visible:outline-primary">
          <Image src={item.image} alt={item.label} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 84vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
          <div className="absolute inset-0 flex max-w-[76%] flex-col items-start justify-end p-4 text-white sm:p-5">
            <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">{item.label}</span>
            <h3 className="mt-2 text-lg font-bold leading-tight sm:text-xl">{item.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/85 sm:text-sm">{item.description}</p>
            <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">Explore <ArrowRight className="h-4 w-4" /></span>
          </div>
        </Link>)}
      </div>
      <div className="mt-1 flex justify-center gap-1">{Array.from({ length: last + 1 }, (_, index) => <button key={index} type="button" aria-label={`Show spotlight ${index + 1}`} aria-current={start === index ? "true" : undefined} onClick={() => { setPaused(true); goTo(index); }} className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"><span className={`h-2 rounded-full ${start === index ? "w-6 bg-primary" : "w-2 bg-primary/25"}`} /></button>)}</div>
    </section>
  );
}

function HeroImageMosaic() {
  const cards = [
    { image: "/images/hero/ac-service.webp", title: "AC Service", query: "AC" },
    { image: "/images/hero/washing-machine-service.webp", title: "Appliance Repair", query: "washing machine" },
    { image: "/images/hero/water-tank-cleaning.webp", title: "Water Tank Cleaning", query: "water tank" },
    { image: "/images/hero/sofa-repair.webp", title: "Sofa Repair", query: "sofa" },
  ];
  return <div className="grid min-w-0 grid-cols-2 content-start gap-3">{cards.map((card) => <Link key={card.image} href={serviceSearchHref(card.query)} className="group relative aspect-[3/2] overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-primary"><Image src={card.image} alt={`Purple Squad ${card.title}`} fill priority sizes="(min-width: 1024px) 28vw, 46vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-xs font-bold text-white sm:text-sm">{card.title}</span></Link>)}</div>;
}

function CompactPackageCard({ service }: { service: ServiceListItem }) {
  const currentPrice = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)]">
      <Link href={routes.serviceDetail(service.slug)} aria-label={`View ${service.name}`}>
        <ServiceImage src={service.cover_image} alt={service.name} fit="contain" className="aspect-[3/2] rounded-none" />
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
  open,
  services,
  onClose,
}: {
  open: boolean;
  services: ServiceListItem[];
  onClose: () => void;
}) {
  const families = useMemo(() => {
    const byName = new Map(serviceFamilies(services).map((family) => [family.name, family]));
    return appliancePopupOrder.flatMap((item) => {
      const family = byName.get(item.family);
      return family ? [{ ...family, label: item.label }] : [];
    });
  }, [services]);

  function closeDialog() {
    onClose();
  }

  function landingHrefForFamily(family: string) {
    const preferredSlugs: Record<string, string> = {
      "AC Service": "ac-service",
      "CCTV Camera": "cctv-cameras-repair-installation",
      Dishwasher: "dishwasher-repair-service",
      Geyser: "geyser-repair-services",
      "Microwave Oven": "microwave-oven-repair-services",
      Refrigerator: "refrigerator-repair-services",
      "TV Repair": "tv-repair-services",
      "TV Wall Mount": "tv-wall-mount-installation",
      "Washing Machine": "washing-machine-repair-service",
      "Water Purifier": "water-purifier-repair-services",
    };
    const preferred = preferredSlugs[family];
    const service = services.find((item) => item.slug === preferred) ?? services.find((item) => serviceFamilyFor(item) === family);
    return service ? routes.serviceDetail(service.slug) : routes.services;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-5 shadow-[0_22px_80px_rgba(0,0,0,0.28)] focus:outline-none sm:p-6"
        >
          <Dialog.Close asChild>
            <Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 rounded-md bg-white shadow-sm" aria-label="Close appliance popup">
              <X className="h-5 w-5" />
            </Button>
          </Dialog.Close>
          <Dialog.Title className="pr-12 text-2xl font-bold text-foreground">Home appliances</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-secondary">Select an appliance to open its service page.</Dialog.Description>

          {families.length ? (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {families.map((family) => (
                <Link
                  key={family.name}
                  href={landingHrefForFamily(family.name)}
                  onClick={closeDialog}
                  className="group text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="grid h-20 place-items-center">
                    <ServiceIcon label={family.name} className="h-full w-full overflow-visible rounded-none bg-transparent" imageClassName="p-0" />
                  </span>
                  <span className="mt-3 block text-sm font-semibold leading-5 text-foreground group-hover:text-primary">{family.label}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No appliances published yet" description="Add appliance services from the admin catalogue." />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
