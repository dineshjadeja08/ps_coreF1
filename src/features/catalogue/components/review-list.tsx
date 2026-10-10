import { ChevronDown } from "lucide-react";

import { ReviewCard } from "@/features/catalogue/components/review-card";
import type { Review } from "@/features/catalogue/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const visible = reviews.filter((review) => review.is_visible);
  const remaining = visible.slice(3);
  return (
    <div className="mt-4 space-y-3">
      {visible.slice(0, 3).map((review) => <ReviewCard key={review.id} review={review} />)}
      {remaining.length ? (
        <details className="group/reviews">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-primary transition-colors hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
            <span className="group-open/reviews:hidden">Read more reviews ({remaining.length})</span>
            <span className="hidden group-open/reviews:inline">Show fewer reviews</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/reviews:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="mt-3 space-y-3">{remaining.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
        </details>
      ) : null}
    </div>
  );
}
