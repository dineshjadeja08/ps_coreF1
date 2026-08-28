import { Star } from "lucide-react";

export type DemoReview = {
  name: string;
  location: string;
  service: string;
  text: string;
};

export function ReviewCard({ review }: { review: DemoReview }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-1 text-warning" aria-label="5 star demo review">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-foreground">{review.text}</p>
      <div className="mt-5 border-t border-border pt-4">
        <p className="font-semibold text-foreground">{review.name}</p>
        <p className="text-sm text-secondary">
          {review.location} · {review.service} · Demo review
        </p>
      </div>
    </article>
  );
}
