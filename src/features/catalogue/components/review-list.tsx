"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";

import type { Review } from "@/features/catalogue/types";

type ReviewSort = "detailed" | "highest" | "newest";

export function ReviewList({ reviews, showAll = false, serviceName }: { reviews: Review[]; showAll?: boolean; serviceName?: string }) {
  const [sort, setSort] = useState<ReviewSort>("detailed");
  const sorted = useMemo(() => reviews.filter((review) => review.is_visible).sort((first, second) => {
    if (sort === "highest") return second.rating - first.rating || second.created_at.localeCompare(first.created_at);
    if (sort === "newest") return second.created_at.localeCompare(first.created_at);
    return second.comment.length - first.comment.length || second.created_at.localeCompare(first.created_at);
  }), [reviews, sort]);
  const visible = sorted;
  const remaining = visible.slice(3);
  const displayed = showAll ? visible : visible.slice(0, 3);
  const filters: { value: ReviewSort; label: string }[] = [
    { value: "detailed", label: "Most detailed" },
    { value: "highest", label: "Highest rated" },
    { value: "newest", label: "Newest" },
  ];

  function reviewRows(items: Review[]) {
    return items.map((review) => {
      const name = review.reviewer_name || (typeof review.customer.name === "string" && review.customer.name) || "Purple Squad customer";
      return (
        <article key={review.id} className="border-b border-slate-200 py-5 last:border-b-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold leading-6 text-slate-900">{name}</h3>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-700 px-2 py-1 text-xs font-bold text-white">
              <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />{review.rating}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(review.created_at))}
            {review.is_booking_review ? " · Completed booking review" : " · Customer feedback"}
            {serviceName ? ` · ${serviceName}` : ""}
          </p>
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-slate-800">{review.comment}</p>
        </article>
      );
    });
  }

  return (
    <section className="mt-5" aria-label="All reviews">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">All reviews</h2>
        <span className="text-sm text-slate-500">{visible.length} {visible.length === 1 ? "review" : "reviews"}</span>
      </div>
      <div className="mobile-scroll-row mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Sort reviews">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={sort === filter.value}
            onClick={() => setSort(filter.value)}
            className={`min-h-10 shrink-0 rounded-lg border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${sort === filter.value ? "border-violet-300 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >{filter.label}</button>
        ))}
      </div>

      <div className="mt-2">
        {reviewRows(displayed)}
      </div>
      {!showAll && remaining.length ? (
        <details className="group/reviews">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-800 transition-colors hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
            <span className="group-open/reviews:hidden">Read more reviews ({remaining.length})</span>
            <span className="hidden group-open/reviews:inline">Show fewer reviews</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/reviews:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="mt-2">{reviewRows(remaining)}</div>
        </details>
      ) : null}
    </section>
  );
}
