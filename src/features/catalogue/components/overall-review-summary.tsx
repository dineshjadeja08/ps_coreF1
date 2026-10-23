"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";

import type { Review } from "@/features/catalogue/types";

export function OverallReviewSummary({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(true);
  const visibleReviews = reviews.filter((review) => review.is_visible);
  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: visibleReviews.filter((review) => review.rating === rating).length,
  }));
  const average = visibleReviews.length
    ? visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length
    : 0;

  return (
    <section aria-label="Overall customer rating" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600">
          <Star className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">Overall customer rating</h3>
          <p className="mt-0.5 text-xs text-slate-500">Feedback shared by Purple Squad customers</p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Hide rating breakdown" : "Show rating breakdown"}
          onClick={() => setExpanded((value) => !value)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {visibleReviews.length ? (
        <div className="grid gap-5 p-4 sm:grid-cols-[auto_1fr] sm:gap-7 sm:p-5">
          <div className="flex items-center gap-4 sm:block sm:min-w-28">
            <p className="text-4xl font-bold tracking-tight text-slate-950">{average.toFixed(1)}</p>
            <div>
              <div className="flex items-center gap-0.5 text-amber-500" role="img" aria-label={`${average.toFixed(1)} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < Math.round(average) ? "fill-current" : "text-slate-200"}`} />)}
              </div>
              <p className="mt-1 text-xs text-slate-500">{visibleReviews.length.toLocaleString()} {visibleReviews.length === 1 ? "review" : "reviews"}</p>
            </div>
          </div>

          {expanded ? (
            <div className="space-y-2.5" aria-label="Rating distribution">
              {counts.map(({ rating, count }) => (
                <div key={rating} className="grid grid-cols-[1.75rem_1fr_2.5rem] items-center gap-2 text-xs text-slate-600">
                  <span>{rating}.0</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${rating} star reviews`} aria-valuemin={0} aria-valuemax={visibleReviews.length} aria-valuenow={count}>
                    <div className="h-full rounded-full bg-amber-400 transition-[width]" style={{ width: `${visibleReviews.length ? (count / visibleReviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-right tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="p-4 text-sm text-slate-600">No customer reviews have been published yet.</p>
      )}
    </section>
  );
}
