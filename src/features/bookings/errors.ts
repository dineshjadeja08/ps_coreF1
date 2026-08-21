import { ApiError } from "@/lib/api/errors";

export function getCancelBookingErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "We could not cancel this booking. Please try again.";
  if (error.status === 400) return "This booking can no longer be cancelled online.";
  if (error.status === 401) return "Please log in again to cancel this booking.";
  if (error.status === 403) return "You do not have permission to cancel this booking.";
  if (error.status === 404) return "We could not find this booking.";
  if (error.status === 409) return "This booking can no longer be cancelled from its current status.";
  if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (error.status >= 500) return "Purple Squad could not cancel this booking right now. Please try again shortly.";
  return "We could not cancel this booking. Please try again.";
}

export function getRescheduleBookingErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "We could not reschedule this booking. Please try again.";
  if (error.status === 400) return "This booking cannot be rescheduled to that slot. Please choose another time.";
  if (error.status === 401) return "Please log in again to reschedule this booking.";
  if (error.status === 403) return "You do not have permission to reschedule this booking.";
  if (error.status === 404) return "We could not find this booking or slot.";
  if (error.status === 409) return "That time was just taken. Please choose another slot.";
  if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (error.status >= 500) return "Purple Squad could not reschedule this booking right now. Please try again shortly.";
  return "We could not reschedule this booking. Please try again.";
}
