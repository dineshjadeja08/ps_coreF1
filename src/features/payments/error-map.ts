import { ApiError } from "@/lib/api/errors";

export function getOrderCreationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "We couldn't start the payment. Please try again.";
  }

  if (error.status === 400) return "This booking can no longer accept payment.";
  if (error.status === 401) return "Please log in again before paying.";
  if (error.status === 403) return "This booking cannot be paid from your account.";
  if (error.status === 409) return "This booking has already been paid or is no longer payable.";
  if (error.status === 429) return "Too many payment attempts. Please wait a moment and try again.";
  if (error.status >= 500) return "We couldn't start the payment. Please try again.";

  return "We couldn't start the payment. Please try again.";
}

export function getVerificationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "We're confirming your payment. Please don't make another payment yet.";
  }

  if (error.status === 400) return "Payment verification failed. Please do not pay again until we check the booking status.";
  if (error.status === 401) return "Please log in again so we can check this payment.";
  if (error.status === 403) return "This payment could not be verified from your account.";
  if (error.status === 404) return "We couldn't find the payment order. Please check the booking status before trying again.";
  if (error.status === 429) return "Payment verification is rate limited. Please wait while we re-check the booking.";
  if (error.status >= 500) return "We're confirming your payment. Please don't make another payment yet.";

  return "Payment verification did not complete. Please check the booking status before trying again.";
}

export function getCheckoutFailureMessage() {
  return "Payment failed. You can try another payment attempt if the booking is still unpaid.";
}
