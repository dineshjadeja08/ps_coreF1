import { describe, expect, it } from "vitest";

import type { Booking } from "@/features/bookings/types";

import { buildPaymentSummary, buildVerifyPaymentPayload, getBookingPayability, getCheckoutAmountLabel } from "./utils";

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: "booking-1",
  booking_number: "PS-0001",
  service: { name: "Snapshot AC Cleaning" },
  address_snapshot: {
    label: "Home",
    address_line_1: "12 Example Street",
    city: "Tirupattur",
    postal_code: "635601",
  },
  service_date: "2026-08-22",
  time_slot: { start_time: "10:00:00", end_time: "11:00:00" },
  problem_description: "AC is noisy.",
  subtotal: "699.00",
  discount_amount: "0.00",
  tax_amount: "0.00",
  total_amount: "699.00",
  advance_required: "199.00",
  advance_paid: "0.00",
  balance_due: "699.00",
  balance_collected: "0.00",
  payment_status: "UNPAID",
  booking_status: "PENDING_PAYMENT",
  confirmed_at: null,
  completed_at: null,
  cancelled_at: null,
  created_at: "2026-08-20T10:00:00Z",
  updated_at: "2026-08-20T10:00:00Z",
  status_history: [],
  ...overrides,
});

describe("payment utilities", () => {
  it("allows payment only for pending unpaid bookings", () => {
    expect(getBookingPayability(booking()).canPay).toBe(true);
    expect(getBookingPayability(booking({ booking_status: "CONFIRMED", payment_status: "PARTIALLY_PAID" })).alreadyPaid).toBe(true);
    expect(getBookingPayability(booking({ booking_status: "CANCELLED" })).canPay).toBe(false);
  });

  it("keeps booking status and payment status separate in summaries", () => {
    const summary = buildPaymentSummary(booking({ booking_status: "CONFIRMED", payment_status: "PARTIALLY_PAID" }));

    expect(summary.bookingStatus).toBe("CONFIRMED");
    expect(summary.paymentStatus).toBe("PARTIALLY_PAID");
  });

  it("uses backend booking snapshots on the success/reload summary", () => {
    const summary = buildPaymentSummary(
      booking({
        service: { name: "Historical Snapshot Service" },
        address_snapshot: { label: "Old Home", address_line_1: "44 Snapshot Road" },
      }),
    );

    expect(summary.serviceName).toBe("Historical Snapshot Service");
    expect(summary.address).toContain("44 Snapshot Road");
  });

  it("uses backend order amount for checkout authority", () => {
    expect(
      getCheckoutAmountLabel({
        payment_id: "payment-1",
        booking_id: "booking-1",
        provider_order_id: "order_1",
        amount: "249.00",
        amount_paise: 24900,
        currency: "INR",
        key_id: "rzp_test_key",
      }),
    ).toBe("₹249");
  });

  it("builds the exact OpenAPI verification payload from Razorpay callback fields", () => {
    expect(
      buildVerifyPaymentPayload({
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "signature",
      }),
    ).toEqual({
      razorpay_order_id: "order_123",
      razorpay_payment_id: "pay_123",
      razorpay_signature: "signature",
    });
  });
});
