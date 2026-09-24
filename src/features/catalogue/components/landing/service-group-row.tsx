"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/features/cart/cart-controls";
import { useCart } from "@/features/cart/use-cart";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import type { ServiceLandingGroup } from "@/features/catalogue/group-services";
import { useServiceReviewsAggregate } from "@/features/catalogue/queries";
import { formatDuration, formatPrice } from "@/features/catalogue/utils";

export function ServiceGroupRow({ group, eager, onOpen }: { group: ServiceLandingGroup; eager?: boolean; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const cart = useCart();
  const reviewQuery = useServiceReviewsAggregate(group.options.map((option) => option.id));
  const groupQuantity = group.options.reduce(
    (sum, option) => sum + (cart.items.find((item) => item.id === option.id)?.quantity ?? 0),
    0,
  );
  const rating = reviewQuery.reviews.length
    ? reviewQuery.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewQuery.reviews.length
    : null;
  const visibleBullets = expanded ? group.bullets : group.bullets.slice(0, 2);

  return (
    <article className="grid grid-cols-[minmax(0,1fr)_112px] gap-3 border-b border-border px-4 py-6 sm:grid-cols-[minmax(0,1fr)_154px] sm:gap-4 sm:px-6">
      <div className="min-w-0">
        <button type="button" onClick={onOpen} className="text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <h2 className="text-lg font-extrabold leading-6 text-foreground sm:text-xl">{group.title}</h2>
        </button>
        {rating ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-secondary">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {rating.toFixed(1)} ({reviewQuery.reviews.length} reviews)
          </p>
        ) : null}
        <p className="mt-3 text-sm text-secondary">
          Starts at <strong className="text-base text-foreground">{formatPrice(group.startingPrice)}</strong>
          {formatDuration(group.startingService.estimated_duration_minutes) ? <><span className="mx-2">•</span>{formatDuration(group.startingService.estimated_duration_minutes)}</> : null}
        </p>
        {group.bullets.length ? (
          <div className="mt-4 border-t border-dashed border-border pt-3">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.ul key={expanded ? "all" : "short"} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="list-disc space-y-2 overflow-hidden pl-5 text-sm leading-5 text-secondary">
                {visibleBullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </motion.ul>
            </AnimatePresence>
            {group.bullets.length > 2 ? (
              <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {expanded ? "Show less" : "Show more"}
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : "-rotate-90"}`} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="min-w-0 text-center">
        <button type="button" onClick={onOpen} className="block w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`View ${group.title} options`}>
          <ServiceImage src={group.image} alt={group.title} priority={eager} className="aspect-square w-full rounded-lg border border-border bg-white" imageClassName="object-cover" />
        </button>
        <div className="mx-auto mt-3 w-[84px] sm:w-[96px]">
          {group.options.length === 1 ? (
            <AddToCartButton service={group.options[0]} className="min-h-10 w-full rounded-lg bg-white px-2 text-xs sm:min-h-11 sm:text-sm" />
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={onOpen} className={`min-h-10 w-full rounded-lg border-primary px-2 text-xs font-extrabold text-primary sm:min-h-11 sm:text-sm ${groupQuantity ? "bg-primary-soft" : "bg-white"}`}>
              {groupQuantity ? `${groupQuantity} added` : "Add"}
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-xs font-semibold text-muted-foreground">
          {groupQuantity ? `${groupQuantity} in cart` : `${group.options.length} ${group.options.length === 1 ? "option" : "options"}`}
        </p>
      </div>
    </article>
  );
}
