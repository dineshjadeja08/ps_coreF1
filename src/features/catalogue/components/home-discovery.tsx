"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { trustPromises } from "@/config/design";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { AddToCartButton } from "@/features/cart/cart-controls";
import { openApplianceSelector } from "@/features/catalogue/components/appliance-selector-dialog";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServices } from "@/features/catalogue/queries";
import type { ServiceListItem } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

const homeCategories = [
  { name: "Home Appliances", slug: "home-appliances-repair", description: "Repair and appliance care", image: "/images/categories/home-appliances-repair.png", opensApplianceSelector: true },
  { name: "Water Tank Cleaning", slug: "water-tank-cleaning", description: "Cleaner, safer water storage", image: "/images/service-icons/water-tank.png" },
  { name: "Sofa Repair", slug: "sofa-repair-inspection-charge", description: "Upholstery and frame fixes", image: "/images/service-icons/sofa-repair.png" },
  { name: "Mosquito Net", slug: "mosquito-net-inspection-charge", description: "Custom-fit home protection", image: "/images/service-icons/mosquito-net.png" },
];

const popularCategories = [
  { name: "Water Tank Cleaning", slug: "water-tank-cleaning", image: "/images/service-icons/water-tank.png" },
  { name: "Sofa Repair", slug: "sofa-repair-inspection-charge", image: "/images/service-icons/sofa-repair.png" },
  { name: "Mosquito Net", slug: "mosquito-net-inspection-charge", image: "/images/service-icons/mosquito-net.png" },
  { name: "AC Service", slug: "ac-services", image: "/images/service-icons/ac.png" },
  { name: "Washing Machine", slug: "washing-machine-repair-service", image: "/images/service-icons/washing-machine.png" },
  { name: "Refrigerator", slug: "refrigerator-repair-services", image: "/images/service-icons/refrigerator.png" },
  { name: "Water Purifier", slug: "water-purifier-repair-services", image: "/images/service-icons/water-purifier.png" },
  { name: "TV Repair", slug: "tv-repair-services", image: "/images/service-icons/tv.png" },
  { name: "Geyser", slug: "geyser-repair-services", image: "/images/service-icons/geyser.png" },
  { name: "Microwave", slug: "microwave-oven-repair-services", image: "/images/service-icons/microwave.png" },
  { name: "Dishwasher", slug: "dishwasher-repair-service", image: "/images/service-icons/dishwasher.png" },
  { name: "Cleaning Services", image: "/images/categories/cleaning.png", comingSoon: true },
] as const;

const spotlights = [
  { title: "Give your sofa a fresh start", label: "Sofa repair", description: "Comfort worth coming home to.", slug: "sofa-repair-inspection-charge", image: "/images/hero/sofa-repair.webp" },
  { title: "Cleaner tanks. Fresher homes.", label: "Water tank cleaning", description: "Care for your home's water storage.", slug: "water-tank-cleaning", image: "/images/hero/water-tank-cleaning.webp" },
  { title: "Everyday appliances, expert care", label: "Home appliances", description: "Keep your home running smoothly.", slug: "home-appliances-repair", image: "/images/hero/washing-machine-service.webp", opensApplianceSelector: true },
  { title: "Stay cool, all year", label: "AC service", description: "Give your cooling the care it deserves.", slug: "ac-services", image: "/images/hero/ac-service.webp" },
  { title: "Fresh air. Peaceful evenings.", label: "Mosquito net", description: "Find the right net for your home.", slug: "mosquito-net-inspection-charge", image: "/images/services/mosquito-net.png" },
  { title: "Keep the freshness going", label: "Refrigerator repair", description: "Expert care for your kitchen essential.", slug: "refrigerator-repair-services", image: "/images/services/refrigerator.png" },
];

const preferredServiceSlugs: Record<string, string> = {
  AC: "ac-service",
  appliance: "washing-machine-repair-service",
  mosquito: "mosquito-net-inspection-charge",
  refrigerator: "refrigerator-repair-services",
  sofa: "sofa-repair-inspection-charge",
  "washing machine": "washing-machine-repair-service",
  "water tank": "water-tank-cleaning",
};

export function HomeDiscovery() {
  const services = useServices({ page_size: 80 });
  const featured = useServices({ featured: true, page_size: 10 });

  const allServices = useMemo(() => services.data?.results ?? [], [services.data?.results]);
  const servicePool = Array.from(new Map(
    [...(featured.data?.results ?? []), ...allServices].map((service) => [service.id, service]),
  ).values());
  const visibleServices = ["sofa", "water tank", "mosquito"].flatMap((query) => {
    const preferredSlug = preferredServiceSlugs[query];
    const service = servicePool.find((item) => item.slug === preferredSlug) ?? servicePool.find((item) => {
      const searchable = `${item.name} ${item.slug} ${item.short_description} ${item.category.name}`.toLowerCase();
      return searchable.includes(query);
    });
    return service ? [service] : [];
  });
  const whatsappUrl = env.supportWhatsapp ? `https://wa.me/${env.supportWhatsapp.replace(/\D/g, "")}` : routes.support;

  return (
    <div className="min-w-0 bg-white">
      <section className="overflow-hidden border-b border-border bg-white lg:flex lg:h-[calc(100svh-5.5rem)] lg:max-h-[calc(100svh-5.5rem)] lg:flex-col">
        <div className="mx-auto grid w-full max-w-7xl gap-6 overflow-hidden px-4 py-6 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(1rem,2vw,2rem)] lg:px-8 lg:py-[clamp(1rem,2.2vh,2rem)]">
          <div className="flex min-w-0 flex-col justify-center lg:max-h-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="max-w-xl text-[2.15rem] font-bold leading-[1.08] text-foreground sm:text-[3.25rem] lg:text-[clamp(2.25rem,4.8vh,3.4rem)]">
                Home Appliance Services at <span className="text-primary">Your Doorstep in Chennai</span>
              </h1>
            </motion.div>

            <p className="mt-4 text-lg text-secondary sm:text-xl lg:mt-[clamp(.5rem,1.3vh,1rem)] lg:text-[clamp(1rem,2vh,1.25rem)]">Trusted professionals. Hassle-free service.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:mt-[clamp(.6rem,1.5vh,1.25rem)] lg:gap-[clamp(.5rem,1vh,.75rem)]">
              {homeCategories.map((item) => {
                const className = "flex min-h-36 min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-[0_2px_8px_rgba(24,24,27,0.04)] transition hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5 lg:min-h-[clamp(6.75rem,14vh,9rem)] lg:p-[clamp(.65rem,1.5vh,1.25rem)]";
                const content = <><Image src={item.image} alt="" width={88} height={88} className="h-16 w-16 object-contain sm:h-20 sm:w-20 lg:h-[clamp(3.25rem,7.5vh,5rem)] lg:w-[clamp(3.25rem,7.5vh,5rem)]" /><span className="line-clamp-2 text-sm font-bold leading-5">{item.name}</span><span className="line-clamp-1 text-[11px] font-medium text-zinc-500 sm:text-xs">{item.description}</span></>;

                return item.opensApplianceSelector ? (
                  <button key={item.name} type="button" className={className} onClick={openApplianceSelector}>{content}</button>
                ) : (
                  <Link key={item.name} href={routes.serviceCategory(item.slug)} className={className}>{content}</Link>
                );
              })}
            </div>
            <Button asChild className="mt-6 lg:mt-[clamp(.6rem,1.5vh,1.25rem)]"><Link href={routes.services}>Book a Service <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>

          <HeroImageMosaic />
        </div>
      </section>
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-2 gap-px border-y border-border bg-border px-0 sm:grid-cols-4 lg:px-0">
          {[
            ["Transparent pricing", "View price before booking"],
            ["Trained experts", "Verified technicians"],
            ["On-time slots", "Pick your preferred time"],
            ["Support included", "Help before and after service"],
          ].map(([title, description]) => (
            <div key={title} className="bg-white px-4 py-4 sm:px-6 lg:px-8 lg:py-[clamp(.6rem,1.2vh,1rem)]">
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-5 text-secondary">{description}</p>
            </div>
          ))}
      </div>

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
              <Button asChild size="sm"><Link href={routes.serviceCategory("ac-services")}>Book now <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </div>
      </section>

      <SpotlightCarousel />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold sm:text-2xl">Popular service categories</h2>
          <Link href={routes.services} className="flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-primary/30 px-3 text-xs font-bold text-primary transition hover:bg-primary-soft sm:text-sm">See all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
          {popularCategories.map((item) => {
            const content = <><Image src={item.image} alt="" width={88} height={88} className={`h-12 w-12 object-contain transition sm:h-16 sm:w-16 ${"comingSoon" in item ? "grayscale opacity-55" : "group-hover:scale-105"}`} /><h3 className={`line-clamp-2 text-xs font-semibold leading-4 sm:text-sm ${"comingSoon" in item ? "text-zinc-500" : "group-hover:text-primary"}`}>{item.name}</h3>{"comingSoon" in item ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-800 sm:text-[10px]">Coming soon</span> : null}</>;

            if ("comingSoon" in item) {
              return <div key={item.name} aria-disabled="true" className="relative flex aspect-square min-w-0 cursor-not-allowed flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-center shadow-[0_2px_8px_rgba(24,24,27,0.04)] sm:p-4">{content}</div>;
            }

            return <Link key={item.name} href={routes.serviceCategory(item.slug)} className="group flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 text-center shadow-[0_2px_8px_rgba(24,24,27,0.04)] transition hover:border-primary/40 hover:bg-primary-soft sm:p-4">{content}</Link>;
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Frequently booked</p>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Popular services near you</h2>
            </div>
            <Button asChild variant="outline" className="h-9 shrink-0 rounded-full border-primary/30 px-3 text-xs text-primary sm:text-sm">
              <Link href={routes.services}>
                See all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {services.isLoading || featured.isLoading ? <ServiceCardSkeletonGrid /> : null}
          {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
          {visibleServices.length ? (
            <div className="mobile-scroll-row flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {visibleServices.map((service) => (
                <div key={service.id} className="w-[82%] shrink-0 snap-start sm:w-[56%] md:w-auto">
                  <CompactPackageCard service={service} />
                </div>
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

    </div>
  );
}
function SpotlightCarousel() {
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
          <Link href={routes.services} className="ml-1 inline-flex min-h-9 items-center rounded-full border border-primary/30 px-3 text-xs font-bold text-primary transition hover:bg-primary-soft sm:text-sm">See all</Link>
        </div>
      </div>
      <div ref={row} role="group" aria-label="Swipe to browse service spotlights" className="mobile-scroll-row flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-0.5 pb-2" onTouchStart={() => setPaused(true)} onScroll={() => {
        const element = row.current;
        const card = element?.firstElementChild as HTMLElement | null;
        if (element && card) setStart(Math.min(last, Math.round(element.scrollLeft / (card.offsetWidth + 16))));
      }}>
        {spotlights.map((item) => {
          const className = "group relative aspect-[3/2] w-[84%] shrink-0 snap-start overflow-hidden rounded-lg text-left sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] focus-visible:outline-2 focus-visible:outline-primary";
          const content = <><Image src={item.image} alt={item.label} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 84vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" /><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" /><div className="absolute inset-0 flex max-w-[76%] flex-col items-start justify-end p-4 text-white sm:p-5"><span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">{item.label}</span><h3 className="mt-2 text-lg font-bold leading-tight sm:text-xl">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-white/85 sm:text-sm">{item.description}</p><span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">Explore <ArrowRight className="h-4 w-4" /></span></div></>;

          return item.opensApplianceSelector ? (
            <button key={item.slug} type="button" onClick={openApplianceSelector} className={className}>{content}</button>
          ) : (
            <Link key={item.slug} href={routes.serviceCategory(item.slug)} className={className}>{content}</Link>
          );
        })}
      </div>
      <div className="mt-1 flex justify-center gap-1">{Array.from({ length: last + 1 }, (_, index) => <button key={index} type="button" aria-label={`Show spotlight ${index + 1}`} aria-current={start === index ? "true" : undefined} onClick={() => { setPaused(true); goTo(index); }} className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"><span className={`h-2 rounded-full ${start === index ? "w-6 bg-primary" : "w-2 bg-primary/25"}`} /></button>)}</div>
    </section>
  );
}

function HeroImageMosaic() {
  const cards = [
    { image: "/images/hero/ac-service.webp", title: "AC Service", slug: "ac-services" },
    { image: "/images/hero/washing-machine-service.webp", title: "Appliance Repair", slug: "home-appliances-repair", opensApplianceSelector: true },
    { image: "/images/hero/water-tank-cleaning.webp", title: "Water Tank Cleaning", slug: "water-tank-cleaning" },
    { image: "/images/hero/sofa-repair.webp", title: "Sofa Repair", slug: "sofa-repair-inspection-charge" },
  ];
  return <div className="hidden min-w-0 grid-cols-2 content-center gap-3 lg:grid lg:w-full lg:gap-[clamp(.5rem,1vh,.75rem)]">{cards.map((card) => {
    const className = "group relative aspect-[4/3] min-h-0 overflow-hidden rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary";
    const content = <><Image src={card.image} alt={`Purple Squad ${card.title}`} fill priority sizes="(min-width: 1024px) 28vw, 46vw" className="object-cover object-center transition duration-300 group-hover:scale-[1.02]" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-xs font-bold text-white sm:text-sm">{card.title}</span></>;

    return card.opensApplianceSelector ? <button key={card.image} type="button" onClick={openApplianceSelector} className={className}>{content}</button> : <Link key={card.image} href={routes.serviceCategory(card.slug)} className={className}>{content}</Link>;
  })}</div>;
}

function CompactPackageCard({ service }: { service: ServiceListItem }) {
  const currentPrice = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;

  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_3px_12px_rgba(24,24,27,0.06)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)]">
      {showOffer ? <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-extrabold text-white">SPECIAL OFFER</span> : null}
      <Link href={routes.serviceDetail(service.slug)} aria-label={`View ${service.name}`} className="block">
        <ServiceImage src={service.cover_image} alt={service.name} fit="contain" className="aspect-[3/2] rounded-none" />
      </Link>
      <div className="border-t border-zinc-100 bg-[#faf8fc] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-primary">{service.category.name}</div>
      <div className="p-3 pt-2">
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
        <AddToCartButton service={service} className="mt-3 w-full whitespace-nowrap rounded-full px-2 text-xs sm:text-sm" />
      </div>
    </article>
  );
}
