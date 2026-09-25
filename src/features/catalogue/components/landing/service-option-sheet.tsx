"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Star, X } from "lucide-react";
import { useRef } from "react";

import { AddToCartButton } from "@/features/cart/cart-controls";
import { CartStickyBar } from "@/features/catalogue/components/landing/cart-sticky-bar";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { ReviewCard } from "@/features/catalogue/components/review-card";
import { splitServiceBullets, stripGroupPrefix, type ServiceLandingGroup } from "@/features/catalogue/group-services";
import { useServiceDetail, useServiceFaqs, useServiceReviews } from "@/features/catalogue/queries";
import type { ServiceDetail } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

export function ServiceOptionSheet({ group, onClose }: { group: ServiceLandingGroup; onClose: () => void }) {
  const representative = group.options[0];
  const detailQuery = useServiceDetail(representative.slug);
  const faqQuery = useServiceFaqs(representative.id);
  const reviews = useServiceReviews(representative.id);
  const pointerStart = useRef<number | null>(null);
  const detail = detailQuery.data as ServiceDetail | undefined;
  const averageRating = reviews.data?.results.length
    ? reviews.data.results.reduce((sum, review) => sum + review.rating, 0) / reviews.data.results.length
    : null;
  const process = splitServiceBullets(detail?.description || detail?.short_description || representative.short_description);
  const contentImage = detail?.popup_content_image || group.options.map((option) => option.popup_content_image).find(Boolean);

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px]" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-white shadow-2xl focus:outline-none md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:w-[min(672px,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
          >
            <div className="overflow-y-auto overscroll-contain">
              <div
                className="absolute left-1/2 top-2 z-20 h-7 w-24 -translate-x-1/2 md:hidden"
                onPointerDown={(event) => { pointerStart.current = event.clientY; }}
                onPointerUp={(event) => {
                  if (pointerStart.current !== null && event.clientY - pointerStart.current > 70) onClose();
                  pointerStart.current = null;
                }}
              >
                <span className="mx-auto block h-1.5 w-12 rounded-full bg-white/80 shadow" />
              </div>

              <div className="relative">
                <ServiceImage src={group.image} alt={group.title} priority className="h-[300px] w-full rounded-none bg-white md:aspect-[16/10] md:h-auto" imageClassName="object-cover" />
                <Dialog.Close className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Close service options">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>

              <div className="px-4 pb-5 pt-5 sm:px-6">
                <Dialog.Title className="text-[22px] font-extrabold leading-7 text-foreground">{group.title}</Dialog.Title>
                <Dialog.Description className="sr-only">Choose the tank size that matches your service requirement.</Dialog.Description>
                {averageRating ? <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-secondary"><Star className="h-4 w-4 fill-warning text-warning" />{averageRating.toFixed(1)} ({reviews.data?.results.length} reviews)</p> : null}
              </div>

              <div className="border-t border-border px-4 py-5 sm:px-6">
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                  {group.options.map((option) => {
                    const price = formatPrice(getCurrentPrice(option));
                    const basePrice = formatPrice(option.base_price);
                    return (
                      <article key={option.id} className="flex min-w-0 flex-col rounded-xl border border-border bg-white p-3">
                        <h3 className="min-h-12 break-words text-sm font-semibold leading-5 text-foreground sm:text-base">{stripGroupPrefix(option.name, group.title)}</h3>
                        <p className="mt-2 text-base font-extrabold text-foreground">{price ?? "View price"}</p>
                        {hasOfferPrice(option) && basePrice ? <p className="text-xs text-muted-foreground line-through">{basePrice}</p> : <span className="h-4" />}
                        <div className="mt-auto pt-3"><AddToCartButton service={option} className="min-h-11 w-full rounded-lg px-1" /></div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="h-2 bg-muted" />
              <div className="divide-y divide-border px-4 sm:px-6">
                {process.length ? (
                  <section className="py-6">
                    <h2 className="text-base font-extrabold text-secondary">Process</h2>
                    <ol className="mt-4 space-y-4">
                      {process.map((step, index) => <li key={step} className="grid grid-cols-[28px_1fr] gap-3 text-sm leading-6 text-foreground"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-extrabold text-primary">{index + 1}</span><span>{step}</span></li>)}
                    </ol>
                  </section>
                ) : null}
                <TextSection title="Included" body={detail?.whats_included || representative.whats_included} />
                <TextSection title="Not included" body={detail?.whats_excluded} />
                {contentImage ? (
                  <section className="py-6">
                    <ServiceImage
                      src={contentImage}
                      alt={`${detail?.name || representative.name} service details`}
                      className="aspect-video w-full rounded-xl border border-border bg-white"
                      imageClassName="object-cover"
                    />
                  </section>
                ) : null}
                <section className="py-6">
                  <h2 className="text-base font-extrabold text-foreground">Frequently Asked Questions</h2>
                  {faqQuery.data?.length ? (
                    <div className="mt-3 divide-y divide-border rounded-xl border border-border">
                      {faqQuery.data.map((faq) => <details key={faq.id} className="p-4"><summary className="cursor-pointer text-sm font-bold text-foreground">{faq.question}</summary><p className="mt-3 whitespace-pre-line text-sm leading-6 text-secondary">{faq.answer}</p></details>)}
                    </div>
                  ) : <p className="mt-2 text-sm text-secondary">No service-specific FAQs have been published yet.</p>}
                </section>
                <section className="py-6">
                  <h2 className="text-base font-extrabold text-foreground">Customer Reviews</h2>
                  {reviews.data?.results.length ? <div className="mt-4 grid gap-3">{reviews.data.results.map((review) => <ReviewCard key={review.id} review={review} />)}</div> : <p className="mt-2 text-sm text-secondary">No customer reviews have been published yet.</p>}
                </section>
              </div>
            </div>
            <CartStickyBar insideSheet />
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function TextSection({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) return null;
  return <section className="py-6"><h2 className="text-base font-extrabold text-foreground">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-secondary">{body}</p></section>;
}
