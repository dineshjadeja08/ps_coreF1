import { ApiError } from "@/lib/api/errors";

import { formatSlotTime } from "@/features/slots/utils";

import type { Booking, BookingAddressSnapshot, BookingServiceSnapshot, BookingStatus, PaymentStatus, TimeSlot } from "./types";

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Payment pending",
  PAYMENT_FAILED: "Payment failed",
  CONFIRMED: "Confirmed",
  TECHNICIAN_ASSIGNED: "Technician assigned",
  TECHNICIAN_EN_ROUTE: "Technician en route",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Not paid",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export function getBookingStatusLabel(status: BookingStatus | string) {
  return bookingStatusLabels[status as BookingStatus] ?? status;
}

export function getPaymentStatusLabel(status: PaymentStatus | string) {
  return paymentStatusLabels[status as PaymentStatus] ?? status;
}

export function formatMoney(amount?: string | number | null) {
  if (amount === undefined || amount === null || amount === "") return "Not available";
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(numericAmount)) return String(amount);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
  }).format(numericAmount);
}

export function formatDisplayDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function toPlainRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function getSnapshotText(snapshot: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = snapshot[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return "";
}

export function getBookingServiceSnapshot(booking: Booking): BookingServiceSnapshot {
  return toPlainRecord(booking.service) as BookingServiceSnapshot;
}

export function getBookingAddressSnapshot(booking: Booking): BookingAddressSnapshot {
  return toPlainRecord(booking.address_snapshot) as BookingAddressSnapshot;
}

export function getBookingTimeSlot(booking: Booking): Partial<TimeSlot> {
  return toPlainRecord(booking.time_slot) as Partial<TimeSlot>;
}

export function getBookingServiceName(booking: Booking) {
  return getSnapshotText(getBookingServiceSnapshot(booking), ["name", "title"]) || "Selected service";
}

export function getBookingAddressLine(booking: Booking) {
  const snapshot = getBookingAddressSnapshot(booking);
  return [
    snapshot.label,
    snapshot.address_line_1,
    snapshot.address_line_2,
    snapshot.locality,
    snapshot.city,
    snapshot.state,
    snapshot.postal_code,
  ]
    .filter(Boolean)
    .join(", ") || "Booking address";
}

export function getBookingSchedule(booking: Booking) {
  const slot = getBookingTimeSlot(booking);
  const start = typeof slot.start_time === "string" ? formatSlotTime(slot.start_time) : "";
  const end = typeof slot.end_time === "string" ? formatSlotTime(slot.end_time) : "";

  return `${formatDisplayDate(booking.service_date)}${start && end ? `, ${start} - ${end}` : ""}`;
}

export function formatDisplayDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function getBookingTimeline(booking: Booking) {
  return [...booking.status_history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function canCustomerCancelBooking(booking: Booking) {
  return ["PENDING_PAYMENT", "CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(booking.booking_status);
}

export function canCustomerRescheduleBooking(booking: Booking) {
  return ["CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(booking.booking_status);
}

export function getBookingServiceId(booking: Booking) {
  return getSnapshotText(getBookingServiceSnapshot(booking), ["id"]);
}

export function getBookingPostalCode(booking: Booking) {
  return getSnapshotText(getBookingAddressSnapshot(booking), ["postal_code"]);
}

export function createBookingPayload(input: {
  serviceId: string;
  addressId: string;
  slotId: string;
  problemDescription: string;
  customerNotes?: string;
}) {
  return {
    service_id: input.serviceId,
    address_id: input.addressId,
    slot_id: input.slotId,
    problem_description: input.problemDescription.trim(),
    ...(input.customerNotes?.trim() ? { customer_notes: input.customerNotes.trim() } : {}),
  };
}

export function getBookingCreationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "We couldn't confirm whether your booking was created. Please check My Bookings before trying again.";
  }

  if (error.status === 400) return "Please check the booking details and try again.";
  if (error.status === 401) return "Please log in again to continue. Your booking details are still here.";
  if (error.status === 403) return "This booking cannot be created from your account.";
  if (error.status === 409) return "That time was just booked by another customer. Please select another slot.";
  if (error.status === 429) return "Too many booking attempts. Please wait a moment and try again.";
  if (error.status >= 500) return "Purple Squad could not safely confirm this booking. Please check My Bookings before trying again.";

  return "We could not create this booking. Please check the details and try again.";
}

export function isSlotConflictError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}
