import type { Booking } from "@/features/bookings/types";
import {
  formatDisplayDate,
  formatMoney,
  getBookingAddressSnapshot,
  getBookingServiceSnapshot,
  getBookingTimeSlot,
  getSnapshotText,
} from "@/features/bookings/utils";
import { formatSlotTime } from "@/features/slots/utils";

import type { Payability, PaymentOrder, PaymentSummaryModel, PaymentVerifyRequest, RazorpaySuccessResponse } from "./types";

export function getBookingPayability(booking: Booking): Payability {
  const alreadyPaid = booking.payment_status === "PARTIALLY_PAID" || booking.payment_status === "PAID" || booking.booking_status === "CONFIRMED";
  const canPay = booking.booking_status === "PENDING_PAYMENT" && booking.payment_status === "UNPAID";
  const pending = booking.booking_status === "PENDING_PAYMENT" && booking.payment_status === "PARTIALLY_PAID";

  if (alreadyPaid) {
    return { canPay: false, alreadyPaid: true, pending: false, reason: "Payment already received." };
  }

  if (canPay) {
    return { canPay: true, alreadyPaid: false, pending: false, reason: "Advance payment is required." };
  }

  if (pending) {
    return { canPay: false, alreadyPaid: false, pending: true, reason: "Payment confirmation is pending." };
  }

  return { canPay: false, alreadyPaid: false, pending: false, reason: "This booking can no longer accept payment." };
}

export function buildVerifyPaymentPayload(response: RazorpaySuccessResponse): PaymentVerifyRequest {
  return {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  };
}

export function getCheckoutAmountLabel(order: PaymentOrder) {
  return formatMoney(order.amount);
}

export function buildPaymentSummary(booking: Booking): PaymentSummaryModel {
  const serviceSnapshot = getBookingServiceSnapshot(booking);
  const addressSnapshot = getBookingAddressSnapshot(booking);
  const timeSlot = getBookingTimeSlot(booking);
  const start = typeof timeSlot.start_time === "string" ? formatSlotTime(timeSlot.start_time) : "";
  const end = typeof timeSlot.end_time === "string" ? formatSlotTime(timeSlot.end_time) : "";
  const address = [
    addressSnapshot.label,
    addressSnapshot.address_line_1,
    addressSnapshot.address_line_2,
    addressSnapshot.city,
    addressSnapshot.state,
    addressSnapshot.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    bookingReference: booking.booking_number || booking.id,
    serviceName: getSnapshotText(serviceSnapshot, ["name", "title"]) || "Selected service",
    schedule: `${formatDisplayDate(booking.service_date)}${start && end ? `, ${start} - ${end}` : ""}`,
    address: address || "Booking address",
    totalAmount: formatMoney(booking.total_amount),
    advancePayable: formatMoney(booking.advance_required),
    advancePaid: formatMoney(booking.advance_paid),
    balanceDue: formatMoney(booking.balance_due),
    bookingStatus: booking.booking_status,
    paymentStatus: booking.payment_status,
  };
}
