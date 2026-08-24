"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, CreditCard, MapPin, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
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
  { icon: ShieldCheck, title: "Verified Technicians", text: "Skilled local professionals for every visit." },
  { icon: CreditCard, title: "Transparent Pricing", text: "Clear catalogue prices before you book." },
  { icon: CalendarCheck, title: "Secure Booking", text: "Address, slot and payment handled safely." },
  { icon: Sparkles, title: "Easy Rescheduling", text: "Simple booking actions when plans change." },
];

const steps = [
  { icon: Wrench, title: "Choose a service" },
  { icon: MapPin, title: "Select address & time" },
  { icon: CreditCard, title: "Pay advance" },
  { icon: CheckCircle2, title: "Get service completed" },
];

export function HomeDiscovery() {
  const categories = useServiceCategories();
  const services = useServices({ page_size: 12 });
  const featured = useServices({ featured: true, page_size: 6 });

  const allServices = services.data?.results ?? [];
  const visibleServices = (featured.data?.results?.length ? featured.data.results : allServices).slice(0, 6);

  return (
    <div className="bg-background">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col justify-center"
        >
          <Badge className="w-fit">Purple Squad Care in Tirupattur</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Expert Home Services Right at Your Doorstep
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-secondary">
            Trusted AC service, repair, installation and maintenance with simple booking and clear pricing.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
          <div className="mt-7 grid gap-3 sm:grid-cols-[0.82fr_1.18fr]">
            <LocationSelector />
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-sm">
              <ServiceSearch services={allServices} />
            </div>
          </div>
        </motion.div>

        <div className="relative rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="absolute -right-3 -top-3 hidden rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-soft)] sm:block">
            PS Verified
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-primary-subtle">
            <Image
              src="/images/hero/purple-squad-home-services-hero.png"
              alt="Purple Squad technician with home appliances and cleaning services"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {trustItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl bg-background p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="mt-3 text-sm font-bold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-secondary">{item.text}</p>
                </div>
              );
            })}
            </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse"
          title="Service categories"
          description="Quickly jump into the service type you need."
          href={routes.services}
          linkLabel="View all services"
        />
        {categories.isLoading ? <CategorySkeletonGrid /> : null}
        {categories.isError ? <ErrorState error={categories.error} onRetry={() => categories.refetch()} /> : null}
        {categories.data?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={featured.data?.results?.length ? "Featured" : "Catalogue"}
          title={featured.data?.results?.length ? "Popular Services" : "Our Services"}
          description="Most useful services from the live Purple Squad catalogue."
          href={routes.services}
          linkLabel="Explore catalogue"
        />
        {services.isLoading || featured.isLoading ? <ServiceCardSkeletonGrid /> : null}
        {services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} /> : null}
        {visibleServices.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-soft">AC Deep Cleaning</p>
            <h2 className="mt-2 text-2xl font-bold">Fresh air starts with a cleaner AC.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-soft">
              Compare services, see pricing, and book a Purple Squad visit in minutes.
            </p>
            <p className="mt-4 text-lg font-bold">Starting from catalogue price</p>
          </div>
          <div className="grid gap-3">
            <Button asChild variant="secondary">
              <Link href={routes.services}>Book Now</Link>
            </Button>
            <div className="hidden rounded-2xl bg-primary-foreground/10 p-4 text-sm font-semibold md:block">Purple Squad Verified Technician</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why Purple Squad" title="Trust built into every booking" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="From service discovery to completion" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
            <div key={step.title} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-sm font-bold text-primary">{index + 1}</div>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
            </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
                <div key={item.text} className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-secondary">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Quick answers" href={routes.faq} linkLabel="Open FAQ" />
        <div className="grid gap-4 md:grid-cols-3">
          {faqPreview.slice(0, 3).map((item) => (
            <div key={item.question} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-semibold text-foreground">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
