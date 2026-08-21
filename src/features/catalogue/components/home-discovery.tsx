"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Clock, CreditCard, MapPin, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { faqPreview } from "@/constants/faq";
import { routes } from "@/constants/routes";
import { CategoryCard } from "@/features/catalogue/components/category-card";
import { LocationSelector } from "@/features/catalogue/components/location-selector";
import { ServiceCard } from "@/features/catalogue/components/service-card";
import { ServiceSearch } from "@/features/catalogue/components/service-search";
import { CategorySkeletonGrid, ServiceCardSkeletonGrid } from "@/features/catalogue/components/skeletons";
import { useServiceCategories, useServices } from "@/features/catalogue/queries";

const trustItems = [
  { icon: ShieldCheck, title: "Trusted technicians", text: "Service delivered by skilled local professionals." },
  { icon: CreditCard, title: "Transparent pricing", text: "Catalogue prices come directly from the backend." },
  { icon: CalendarCheck, title: "Convenient scheduling", text: "The booking flow is prepared for address and slot selection." },
  { icon: Sparkles, title: "Clean experience", text: "Search, compare, and start from the service that fits." },
];

const steps = [
  "Choose a service",
  "Pick your address and time",
  "Pay the advance",
  "Get your service completed",
];

export function HomeDiscovery() {
  const categories = useServiceCategories();
  const services = useServices({ page_size: 12 });
  const featured = useServices({ featured: true, page_size: 6 });

  const allServices = services.data?.results ?? [];
  const visibleServices = (featured.data?.results?.length ? featured.data.results : allServices).slice(0, 6);

  return (
    <div className="bg-background">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col justify-center"
        >
          <Badge className="w-fit">Tirupattur home services</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Expert Home Services Right at Your Doorstep
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-secondary">
            Professional AC service, repair and maintenance from trusted technicians.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={routes.services}>
                Book a Service
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.services}>Explore Services</Link>
            </Button>
          </div>
        </motion.div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="rounded-lg bg-primary-subtle p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg bg-surface p-4 shadow-xs">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-secondary">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <LocationSelector />
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Find your service</p>
          <ServiceSearch services={allServices} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse"
          title="Service categories"
          description="Choose a category from the backend catalogue and continue to filtered services."
          href={routes.services}
          linkLabel="View all services"
        />
        {categories.isLoading ? <CategorySkeletonGrid /> : null}
        {categories.isError ? <ErrorState error={categories.error} onRetry={() => categories.refetch()} /> : null}
        {categories.data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.data.map((category) => (
              <CategoryCard key={category.id} category={category} />
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
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={featured.data?.results?.length ? "Featured" : "Catalogue"}
          title={featured.data?.results?.length ? "Popular services" : "Our services"}
          description="Compare service duration, pricing, and details before starting the booking flow."
          href={routes.services}
          linkLabel="Explore catalogue"
        />
        {services.isLoading || featured.isLoading ? <ServiceCardSkeletonGrid /> : null}
        {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
        {visibleServices.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}
        {services.data && allServices.length === 0 ? (
          <EmptyState
            title="No services published yet"
            description="The backend is reachable, but the public catalogue is empty. Add active services in the backend admin to display them here."
            actionLabel="Check again"
            actionHref={routes.services}
          />
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-lg border border-border bg-primary text-primary-foreground p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-soft">Ready when you are</p>
            <h2 className="mt-2 text-2xl font-bold">Find the right AC service in minutes</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-soft">
              Phase 2 connects discovery to the real catalogue. Booking starts from the prepared service entry point.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href={routes.services}>Explore Services</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why Purple Squad" title="Simple, clear, and service-focused" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-lg border border-border bg-surface p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="From service discovery to completion" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-lg border border-border bg-surface p-5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-sm font-bold text-primary">{index + 1}</div>
              <h3 className="mt-4 font-semibold text-foreground">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Customer trust" title="Built around clarity" description="Customers can inspect services and pricing before moving into booking." />
          </div>
          <div className="grid gap-3">
            {[
              { icon: Wrench, text: "Service details come from the backend contract." },
              { icon: Clock, text: "Duration is shown when the catalogue exposes it." },
              { icon: MapPin, text: "Serviceability is checked by pincode, not guessed." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex gap-3 rounded-lg border border-border bg-surface p-4">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-secondary">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Quick answers" href={routes.faq} linkLabel="Open FAQ" />
        <div className="grid gap-4 md:grid-cols-3">
          {faqPreview.map((item) => (
            <div key={item.question} className="rounded-lg border border-border bg-surface p-5">
              <h3 className="font-semibold text-foreground">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
