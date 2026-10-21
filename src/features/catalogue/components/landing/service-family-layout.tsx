"use client";

import { Check, ChevronRight, Percent, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/constants/routes";
import { CartSummary } from "@/features/cart/cart-controls";
import { ServiceImage } from "@/features/catalogue/components/service-image";

type ServiceFamilyLayoutProps = {
  title: string;
  sectionTitle: string;
  image: string;
  imageAlt: string;
  rating?: number | null;
  reviewCount?: number;
  onRatingClick?: () => void;
  introduction?: string;
  heroSupplement?: ReactNode;
  children: ReactNode;
};

/** Shared desktop and mobile presentation for grouped service-family landings. */
export function ServiceFamilyLayout({
  title,
  sectionTitle,
  image,
  imageAlt,
  rating,
  reviewCount = 0,
  onRatingClick,
  introduction,
  heroSupplement,
  children,
}: ServiceFamilyLayoutProps) {
  const ratingContent = rating ? (
    <>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)} ({reviewCount} customer reviews)
    </>
  ) : null;

  return (
    <div className="overflow-x-clip bg-[#f7f7f7] pb-24 lg:pb-8">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-1.5 text-xs text-secondary sm:mb-5 sm:gap-2 sm:text-sm">
            <Link href={routes.home} className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={routes.services} className="hover:text-primary">Services</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="min-w-0 truncate text-foreground">{title}</span>
          </nav>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="min-w-0 rounded-lg border border-border bg-white p-3 shadow-sm sm:p-4">
              <ServiceImage
                src={image}
                alt={imageAlt}
                priority
                sizes="(min-width: 1280px) 800px, (min-width: 1024px) 65vw, 100vw"
                className="aspect-[16/10] h-auto w-full rounded-lg bg-white sm:aspect-[16/7]"
                imageClassName="object-contain sm:object-cover"
              />
              <div className="mt-5">
                <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{title}</h1>
                {ratingContent ? onRatingClick ? (
                  <button type="button" onClick={onRatingClick} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {ratingContent}
                  </button>
                ) : (
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-secondary">{ratingContent}</p>
                ) : null}
                {introduction ? <p className="mt-3 text-sm leading-6 text-secondary">{introduction}</p> : null}
              </div>
              {heroSupplement ? <div className="mt-5 border-t border-border pt-4">{heroSupplement}</div> : null}
            </div>

            <aside className="hidden space-y-5 lg:block">
              <CartSummary />
              <TrustCard title="Why Purple Squad?" items={["Verified and vetted professionals", "Transparent package pricing", "Matched to your service needs"]} />
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid min-w-0 max-w-7xl gap-0 px-3 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
        <div className="min-w-0 border-border bg-white p-4 sm:p-5 lg:border-r lg:p-7">
          <div className="border-b border-border pb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Available services</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{sectionTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">Choose a service group to view available options and package details.</p>
          </div>
          <div className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
            {children}
          </div>
        </div>

        <aside className="hidden bg-[#f7f7f7] p-5 lg:block">
          <div className="sticky top-28 space-y-4">
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-success/10 text-success"><Percent className="h-4 w-4" /></span>
                <div><p className="text-sm font-bold text-foreground">Transparent pricing</p><p className="mt-1 text-xs leading-5 text-secondary">Final extra work is quoted before repair starts.</p></div>
              </div>
            </div>
            <TrustCard title="Purple Squad Promise" items={["Verified professionals", "Clear package pricing", "Support for reschedule and payment"]} />
            <CartSummary />
          </div>
        </aside>
      </section>
    </div>
  );
}

function TrustCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-lg font-bold text-foreground"><ShieldCheck className="h-5 w-5 text-primary" />{title}</p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-secondary">
        {items.map((item) => <p key={item} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</p>)}
      </div>
    </div>
  );
}
