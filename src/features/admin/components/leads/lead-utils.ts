import { z } from "zod";

export const leadCreateSchema = z.object({
  customer_name: z.string().trim().min(1, "Enter the customer name."),
  primary_mobile: z.string().transform(normalizeIndianMobile).refine(isValidIndianMobile, "Enter a valid 10-digit Indian mobile number."),
  required_service: z.string().trim().min(1, "Select a service."),
  city: z.string().trim().min(1, "Enter the city."),
  address: z.string().trim().min(1, "Select or enter an address."),
  pincode: z.string().trim().max(12, "Enter a valid pincode."),
  latitude: z.string().trim(),
  longitude: z.string().trim(),
});

export type LeadCreateValues = z.input<typeof leadCreateSchema>;

export function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

export function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
}

export function formatInr(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function formatLeadStatus(status: string) {
  if (status === "NEW") return "OPEN";
  return status.replaceAll("_", " ");
}

export function extractPincode(value: string) {
  return value.match(/\b[1-9]\d{5}\b/)?.[0] ?? "";
}

export function calculateDraftTotal(
  items: Array<{ quantity: number; unitCost: string | number }>,
) {
  return items.reduce((total, item) => total + item.quantity * Number(item.unitCost), 0);
}
