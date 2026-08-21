"use client";

import { Loader2, Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getReviewErrorMessage } from "@/features/reviews/errors";
import { useCreateBookingReview } from "@/features/reviews/mutations";
import { createReviewPayload } from "@/features/reviews/utils";
import { cn } from "@/lib/utils";

type BookingReviewFormProps = {
  bookingId: string;
};

export function BookingReviewForm({ bookingId }: BookingReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createReview = useCreateBookingReview();
  const canSubmit = rating >= 1 && rating <= 5 && comment.trim().length > 0 && !createReview.isPending && !submitted;

  async function submitReview() {
    if (!canSubmit) return;
    setMessage("");
    try {
      await createReview.mutateAsync({
        bookingId,
        body: createReviewPayload({ rating, comment }),
      });
      setSubmitted(true);
      setMessage("Thank you. Your review has been submitted.");
    } catch (error) {
      setMessage(getReviewErrorMessage(error));
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-xl font-bold text-foreground">Rate this service</h2>
      <p className="mt-2 text-sm leading-6 text-secondary">Share feedback after a completed visit.</p>

      <div className="mt-5">
        <p className="text-sm font-semibold text-foreground">Rating</p>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={submitted}
              aria-label={`Rate ${value} out of 5`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60",
                value <= rating ? "border-primary bg-primary-soft text-primary" : "border-border bg-background text-secondary hover:bg-muted",
              )}
            >
              <Star className={cn("h-5 w-5", value <= rating ? "fill-current" : "")} />
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="review-comment" className="mt-5 block text-sm font-semibold text-foreground">
        Comment
      </label>
      <textarea
        id="review-comment"
        value={comment}
        disabled={submitted}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Tell us how the service went."
        className="mt-2 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      />

      {message ? (
        <p className={cn("mt-4 rounded-lg p-3 text-sm", submitted ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>{message}</p>
      ) : null}

      <Button type="button" className="mt-5 w-full sm:w-auto" disabled={!canSubmit} onClick={submitReview}>
        {createReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Submit review
      </Button>
    </section>
  );
}
