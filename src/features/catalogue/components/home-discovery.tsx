"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  CheckCircle2,
  Droplets,
  Fan,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  WashingMachine,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { CategorySkeletonGrid, ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";
import type { ServiceCategory, ServiceListItem } from "@/features/catalogue/types";
import { formatDuration, formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

const cityOptions = ["Chennai", "Bangalore", "Coimbatore"];
const popularSearches = ["AC Service", "Bathroom Cleaning", "Washing Machine", "Refrigerator", "Water Purifier", "Chimney"];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const text = name.toLowerCase();
  if (text.includes("clean")) return <Sparkles className={className} />;
  if (text.includes("ac")) return <Fan className={className} />;
  if (text.includes("washing")) return <WashingMachine className={className} />;
  if (text.includes("tv")) return <Tv className={className} />;
  if (text.includes("purifier") || text.includes("tank")) return <Droplets className={className} />;
  if (text.includes("home") || text.includes("appliance")) return <Home className={className} />;
  return <Wrench className={className} />;
}

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
  const router = useRouter();
  const categories = useServiceCategories();
  const services = useServices({ page_size: 80 });
  const featured = useServices({ featured: true, page_size: 10 });
  const [selectedCity, setSelectedCity] = useState(cityOptions[0]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const allServices = useMemo(() => services.data?.results ?? [], [services.data?.results]);
  const visibleServices = (featured.data?.results?.length ? featured.data.results : allServices).slice(0, 8);
  const selectedCategoryServices = useMemo(() => servicesForCategory(allServices, selectedCategory), [allServices, selectedCategory]);
  const whatsappUrl = env.supportWhatsapp ? `https://wa.me/${env.supportWhatsapp.replace(/\D/g, "")}` : routes.support;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchText.trim();
    if (query) {
      router.push(`/services?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <div className="bg-[#f7f8fb]">
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_430px] lg:px-8 lg:py-12">
          <div className="flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Badge className="w-fit bg-primary-soft text-primary">
                <BadgeCheck className="h-3 w-3" />
                Verified home service professionals
              </Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Hiring service experts made easy
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
                Select your city, search the service you need, choose a package, and book a technician in a few taps.
              </p>
            </motion.div>

            <div className="mt-6 rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
              <div className="grid gap-3 md:grid-cols-[190px_1fr_auto] md:items-center">
                <div className="rounded-lg border border-border bg-muted px-3 py-2">
                  <label htmlFor="home-city" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-secondary">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Select city
                  </label>
                  <select
                    id="home-city"
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-bold text-foreground outline-none"
                  >
                    {cityOptions.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <form onSubmit={submitSearch} className="relative">
                  <label htmlFor="home-service-search" className="sr-only">
                    What service do you need?
                  </label>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="home-service-search"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="What service do you need?"
                    className="h-14 rounded-lg pl-12 text-base"
                  />
                </form>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => searchText.trim() && router.push(`/services?q=${encodeURIComponent(searchText.trim())}`)}
                >
                  Search
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <Link
                    key={item}
                    href={`/services?q=${encodeURIComponent(item)}`}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-border bg-primary-subtle">
            <Image
              src="/images/hero/purple-squad-home-services-hero.png"
              alt="Purple Squad technician with home appliances"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 430px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">What service do you need?</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Choose a category</h2>
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
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Popular packages</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">Book most requested services</h2>
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
          {[
            ["Verified technicians", "Screened service partners for household jobs."],
            ["Matched to your needs", "Category and package based flow keeps booking clear."],
            ["Support at every step", "Help for service selection, payment and rescheduling."],
          ].map(([title, text]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-5 text-secondary">{text}</p>
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

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group min-h-36 rounded-lg border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <CategoryIcon name={category.name} className="h-6 w-6" />
      </span>
      <span className="mt-4 block text-sm font-bold leading-5 text-foreground">{category.name}</span>
      <span className="mt-2 block text-xs font-semibold text-secondary">{count || "New"} services</span>
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-[var(--shadow-card)] focus:outline-none lg:grid lg:grid-cols-[280px_1fr]">
          <aside className="shrink-0 border-b border-border bg-white p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-2xl font-bold text-foreground">{category?.name ?? "Services"}</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 text-secondary">
                  {showFamilies
                    ? "Choose the appliance or service type first."
                    : "Choose the exact package and book your preferred slot."}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Close service popup">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>
            <div className="mt-5 space-y-3 rounded-lg bg-muted p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                How this works
              </p>
              {["Choose type", "Choose package", "Confirm address"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm font-semibold text-secondary">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs text-primary">{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-secondary">
                  {showFamilies
                    ? services.length
                      ? `${families.length} options`
                      : "No options yet"
                    : `${selectedServices.length} package options`}
                </p>
                {!showFamilies ? <h3 className="mt-1 text-xl font-bold text-foreground">{selectedFamily}</h3> : null}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={category ? `/services?category=${encodeURIComponent(category.slug)}` : routes.services}>Open full list</Link>
              </Button>
            </div>

            {showFamilies && families.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {families.map((family) => (
                  <button
                    key={family.name}
                    type="button"
                    onClick={() => setSelectedFamily(family.name)}
                    className="group overflow-hidden rounded-lg border border-border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <ServiceImage src={family.services[0]?.cover_image} alt={family.name} className="aspect-[4/3] rounded-none" />
                    <span className="block p-3">
                      <span className="block text-sm font-bold leading-5 text-foreground group-hover:text-primary">{family.name}</span>
                      <span className="mt-1 block text-xs font-semibold text-secondary">{family.services.length} services</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {!showFamilies && selectedServices.length ? (
              <div className="space-y-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFamily(null)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back to {category?.name}
                </Button>
                {selectedServices.map((service) => (
                  <DialogPackageRow key={service.id} service={service} />
                ))}
              </div>
            ) : null}

            {services.length === 0 ? (
              <EmptyState title="No services published yet" description="Add services under this category from the admin catalogue." />
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogPackageRow({ service }: { service: ServiceListItem }) {
  const price = formatPrice(getCurrentPrice(service));
  const duration = formatDuration(service.estimated_duration_minutes);

  return (
    <article className="grid gap-3 rounded-lg border border-border bg-white p-3 sm:grid-cols-[120px_1fr_auto] sm:items-center">
      <ServiceImage src={service.cover_image} alt={service.name} className="aspect-[16/10] rounded-lg sm:h-24" />
      <div>
        <h3 className="text-base font-bold text-foreground">{service.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-secondary">{service.short_description || service.category.name}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-secondary">
          {duration ? <span>{duration}</span> : null}
          <span>4.8 rated</span>
          <span>PS verified</span>
        </div>
      </div>
      <div className="grid gap-2 sm:w-32">
        <p className="text-lg font-bold text-foreground sm:text-right">{price ?? "View price"}</p>
        <Button asChild size="sm">
          <AuthActionLink href={`/book?service=${encodeURIComponent(service.slug)}`} serviceSlug={service.slug}>
            Book Now
          </AuthActionLink>
        </Button>
      </div>
    </article>
  );
}
