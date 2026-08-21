import { getFriendlyApiMessage } from "@/lib/api/errors";

export function mapBackendAuthError(error: unknown) {
  return getFriendlyApiMessage(error);
}

export function mapOtpAuthError(error: unknown) {
  const message = getFriendlyApiMessage(error);
  if (message === "Please check the details and try again.") {
    return "We could not complete OTP verification. Please try again.";
  }
  return message;
}
