import { ApiError } from "@/lib/api/errors";

export function getReviewErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "We could not submit your review. Please try again.";
  if (error.status === 400) return "Only completed bookings can be reviewed, and each booking can be reviewed once.";
  if (error.status === 401) return "Please log in again to submit your review.";
  if (error.status === 403) return "You do not have permission to review this booking.";
  if (error.status === 404) return "We could not find this booking.";
  if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (error.status >= 500) return "Purple Squad could not save your review right now. Please try again shortly.";
  return "We could not submit your review. Please try again.";
}
