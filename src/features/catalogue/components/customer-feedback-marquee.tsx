import type { Review } from "@/types/api";

function reviewerName(review: Review) {
  const customerName = typeof review.customer.name === "string" ? review.customer.name : "";
  return review.reviewer_name?.trim() || customerName.trim() || "Purple Squad customer";
}

function FeedbackCard({ review }: { review: Review }) {
  const name = reviewerName(review);
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className="feedback-marquee-card relative flex h-full w-[min(82vw,360px)] shrink-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.035)] sm:w-[340px] sm:p-6">
      <div aria-label={`${review.rating} out of 5 stars`} className="flex gap-1 text-[17px] leading-none text-emerald-600">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} aria-hidden="true" className={index < Math.round(review.rating) ? "opacity-100" : "opacity-25"}>★</span>
        ))}
      </div>
      <p className="relative z-10 mt-4 line-clamp-4 min-h-[6rem] text-[15px] leading-6 text-slate-700">“{review.comment}”</p>
      <div className="relative z-10 mt-auto flex items-center gap-3 pt-5">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-700">{initial}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">Customer feedback</p>
        </div>
      </div>
    </article>
  );
}

function ReviewTrack({ reviews, direction, label }: { reviews: Review[]; direction: "left" | "right"; label: string }) {
  if (!reviews.length) return null;
  return (
    <div className="feedback-marquee overflow-hidden" role="region" aria-label={label}>
      <div className={`feedback-marquee-track feedback-marquee-track-${direction}`}>
        <div className="flex w-max shrink-0 gap-4 pr-4">
          {reviews.map((review) => <FeedbackCard key={review.id} review={review} />)}
        </div>
        <div className="flex w-max shrink-0 gap-4 pr-4" aria-hidden="true">
          {reviews.map((review, index) => <FeedbackCard key={`${review.id}-duplicate-${index}`} review={review} />)}
        </div>
      </div>
    </div>
  );
}

export function CustomerFeedbackMarquee({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const upperRow = reviews.filter((_, index) => index % 2 === 0);
  const lowerRow = reviews.filter((_, index) => index % 2 === 1);

  return (
    <div className="space-y-4" aria-label="Customer reviews">
      <ReviewTrack reviews={upperRow} direction="left" label="Customer reviews, first row" />
      <ReviewTrack reviews={lowerRow.length ? lowerRow : upperRow} direction="right" label="Customer reviews, second row" />
    </div>
  );
}
