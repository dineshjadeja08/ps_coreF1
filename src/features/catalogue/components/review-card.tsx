import { Star } from "lucide-react";
import type { Review } from "@/features/catalogue/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-1 text-warning" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-border"}`} />
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-foreground">{review.comment}</p>
      <div className="mt-5 border-t border-border pt-4">
        <p className="font-semibold text-foreground">Purple Squad customer</p>
        <p className="text-sm text-secondary">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(review.created_at))}</p>
      </div>
    </article>
  );
}
