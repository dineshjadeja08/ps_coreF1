import { BadgeCheck, Star } from "lucide-react";
import type { Review } from "@/features/catalogue/types";

export function ReviewCard({ review }: { review: Review }) {
  const name = review.reviewer_name || (typeof review.customer.name === "string" && review.customer.name) || "Purple Squad customer";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <article className="flex h-full flex-col rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">{initials}</div>
        <div className="min-w-0"><p className="font-semibold text-foreground">{name}</p><p className="mt-0.5 text-xs text-secondary">Customer feedback</p></div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-amber-500" role="img" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />
        ))}
        <span aria-hidden="true" className="ml-2 text-xs font-semibold text-secondary">{review.rating}/5</span>
      </div>
      <p className="mb-5 mt-4 flex-1 break-words text-sm leading-7 text-slate-700">{review.comment}</p>
      {review.is_booking_review ? <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-secondary"><span className="inline-flex items-center gap-1.5 text-emerald-700"><BadgeCheck aria-hidden="true" className="h-4 w-4" />Completed booking review</span><time dateTime={review.created_at}>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(review.created_at))}</time></div> : <p className="border-t border-slate-100 pt-4 text-xs text-secondary">Shared customer experience</p>}
    </article>
  );
}
