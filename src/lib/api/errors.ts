export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  fieldErrors?: ApiFieldErrors;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.fieldErrors = fieldErrors;
  }
}

export function getFriendlyApiMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 401) return "Please log in to continue.";
  if (error.status === 403) return "You do not have permission to do that.";
  if (error.status === 404) return "We could not find that item.";
  if (error.status === 409) return "That option is no longer available. Please choose another.";
  if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (error.status >= 500) return "Purple Squad is temporarily unavailable. Please try again shortly.";

  return error.message || "Please check the details and try again.";
}

export function parseApiErrorPayload(payload: unknown) {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return {
      message: trimmed ? trimmed.slice(0, 240) : "Request failed.",
      fieldErrors: undefined,
    };
  }

  if (!payload || typeof payload !== "object") {
    return { message: "Request failed.", fieldErrors: undefined };
  }

  const record = payload as Record<string, unknown>;
  const detail = record.detail;
  const error = record.error;

  if (typeof detail === "string") {
    return { message: detail, fieldErrors: undefined };
  }

  if (error && typeof error === "object") {
    const nested = error as Record<string, unknown>;
    const nestedMessage = nested.message;
    const nestedDetails = nested.details;
    if (typeof nestedMessage === "string") {
      const detailErrors = extractFieldErrors(nestedDetails);
      const detailedMessage = detailErrors ? Object.values(detailErrors).flat()[0] : undefined;
      return { message: detailedMessage ?? nestedMessage, fieldErrors: detailErrors };
    }
  }

  const nestedFieldErrors = extractFieldErrors(record);
  if (nestedFieldErrors) {
    return {
      message: Object.values(nestedFieldErrors).flat()[0] ?? "Please check the details and try again.",
      fieldErrors: nestedFieldErrors,
    };
  }

  return { message: "Please check the details and try again.", fieldErrors: undefined };
}

function extractFieldErrors(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  const fieldErrors: ApiFieldErrors = {};
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      fieldErrors[key] = value.map(String);
    } else if (typeof value === "string") {
      fieldErrors[key] = [value];
    }
  }

  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
}
