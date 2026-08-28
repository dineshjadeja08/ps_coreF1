"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { LocationSelector } from "@/features/catalogue/components/location-selector";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ServiceSearch } from "@/features/catalogue/components/service-search";
import { CategorySkeletonGrid, ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";
import type { ServiceCategory, ServiceListItem } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

const quickServices = ["AC Service", "Washing Machine", "Refrigerator", "Bathroom Cleaning", "Water Purifier", "Chimney Cleaning"];

const serviceCities = ["Chennai", "Bangalore", "Coimbatore"];

function CategoryShowcaseCard({
  category,
  services,
  onSelect,
}: {
  category: ServiceCategory;
  services: ServiceListItem[];
  onSelect: (category: ServiceCategory) => void;
}) {
  const sampleService = services.find((service) => service.category.slug === category.slug);

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ServiceImage
        src={sampleService?.cover_image}
        alt={sampleService?.name ?? category.name}
        className="aspect-[3/2] rounded-none"
      />
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary">{category.name}</h3>
        {category.description ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-secondary">{category.description}</p> : null}
      </div>
    </button>
  );
}

function CompactServiceCard({ service }: { service: ServiceListItem }) {
  const currentPrice = formatPrice(getCurrentPrice(service));
  const basePrice = formatPrice(service.base_price);
  const showOffer = hasOfferPrice(service) && basePrice;

  return (
    <Link
      href={routes.serviceDetail(service.slug)}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ServiceImage src={service.cover_image} alt={service.name} className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">{service.name}</h3>
        <div className="flex items-center gap-1 text-xs font-semibold text-secondary">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span>4.8</span>
          <span className="text-muted-foreground">PS verified</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{currentPrice ?? "View price"}</span>
          {showOffer ? <span className="text-xs text-muted-foreground line-through">{basePrice}</span> : null}
        </div>
      </div>
    </Link>
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
  const categoryServices = useMemo(() => {
    if (!category) return [];
    return services.filter((service) => service.category.slug === category.slug);
  }, [category, services]);

  return (
    <Dialog.Root open={Boolean(category)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-[var(--shadow-card)] focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border bg-surface p-5 sm:p-6">
            <div>
              <Dialog.Title className="text-2xl font-bold text-foreground">{category?.name ?? "Services"}</Dialog.Title>
              <Dialog.Description className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
                {category?.description || "Choose a service to view details, pricing and booking slots."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Close service popup">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto p-5 sm:p-6">
            {categoryServices.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {categoryServices.map((service) => (
                  <CompactServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                <h3 className="text-lg font-bold text-foreground">No services published yet</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">Add active services to this category from the backend admin.</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 border-t border-border bg-surface p-5 sm:flex-row sm:justify-between sm:p-6">
            <Button asChild variant="outline">
              <Link href={category ? `/services?category=${encodeURIComponent(category.slug)}` : routes.services}>View full category</Link>
            </Button>
            <Button asChild>
              <Link href={routes.services}>
                Explore all services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function HomeDiscovery() {
  const categories = useServiceCategories();
  const services = useServices({ page_size: 20 });
  const featured = useServices({ featured: true, page_size: 10 });
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const allServices = services.data?.results ?? [];
  const visibleServices = (featured.data?.results?.length ? featured.data.results : allServices).slice(0, 10);
  const repairServices = allServices.filter((service) => service.category.slug === "home-appliances-repair");
  const whatsappUrl = env.supportWhatsapp ? `https://wa.me/${env.supportWhatsapp.replace(/\D/g, "")}` : routes.support;

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge className="mx-auto w-fit">Live in Chennai, Bangalore & Coimbatore</Badge>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Experience finest home services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
            Home cleaning, AC service and appliance repair by trained Purple Squad professionals.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {serviceCities.map((city) => (
              <span key={city} className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-secondary">
                {city}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="mx-auto mt-7 grid max-w-5xl gap-3 lg:grid-cols-[0.82fr_1.18fr]">
          <LocationSelector />
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4 text-primary" />
              Search and book a service
            </div>
            <ServiceSearch services={allServices} />
            <div className="mt-4 flex flex-wrap gap-2">
              {quickServices.map((service) => (
                <Link
                  key={service}
                  href={`/services?q=${encodeURIComponent(service)}`}
                  className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-9">
          {categories.isLoading ? <CategorySkeletonGrid /> : null}
          {categories.isError ? <ErrorState error={categories.error} onRetry={() => categories.refetch()} /> : null}
          {categories.data?.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.data.map((category) => (
                <CategoryShowcaseCard key={category.id} category={category} services={allServices} onSelect={setSelectedCategory} />
              ))}
            </div>
          ) : null}
          {categories.data && categories.data.length === 0 ? (
            <EmptyState
              title="No categories available yet"
              description="The backend catalogue does not have active service categories right now."
              actionLabel="Refresh services"
              actionHref={routes.services}
            />
          ) : null}
        </div>
      </section>
      <CategoryServicesDialog category={selectedCategory} services={allServices} onClose={() => setSelectedCategory(null)} />

      <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Most booked"
          title="Most booked services"
          description="Popular repairs and cleaning jobs ready for quick booking."
          href={routes.services}
          linkLabel="Open full catalogue"
        />
        {services.isLoading || featured.isLoading ? <ServiceCardSkeletonGrid /> : null}
        {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
        {visibleServices.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {visibleServices.slice(0, 10).map((service) => (
              <CompactServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-card)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-80 bg-primary-subtle">
            <Image
              src="/images/hero/purple-squad-home-services-hero.png"
              alt="Purple Squad technician with home appliances and cleaning services"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <Badge className="w-fit">Purple Squad now live</Badge>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">Rediscover clean</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
              Professional deep cleaning for homes, bathrooms, kitchens and water tanks by trusted experts across Chennai, Bangalore and Coimbatore.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { title: "Fresh rooms", text: "Dust and surface care" },
                { title: "Pristine kitchens", text: "Grease and stain focus" },
                { title: "Sparkling bathrooms", text: "Tiles, mirrors and fittings" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-muted p-4">
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/services?q=cleaning">Get a Free Quote</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.services}>Browse services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Appliance Service & Repair" title="Home appliance experts" />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {repairServices.slice(0, 6).map((service) => (
              <CompactServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-muted p-6">
            <div>
              <Badge className="w-fit">Verified technicians</Badge>
              <h2 className="mt-4 text-2xl font-bold text-foreground">AC, refrigerator, TV, geyser and purifier support</h2>
              <p className="mt-3 text-sm leading-6 text-secondary">
                Find the appliance service you need, confirm your address, choose a slot and track the booking from your account.
              </p>
            </div>
            <Button asChild className="mt-6 w-fit">
              <Link href="/services?category=home-appliances-repair">
                View appliance services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-border bg-muted p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Support</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">We have a team dedicated to support you</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              Get help with service selection, booking status, payments or rescheduling.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={routes.support}>Book a call</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={whatsappUrl}>Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
