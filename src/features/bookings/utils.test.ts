import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";

import type { Booking } from "./types";
import {
  createBookingPayload,
  canCustomerCancelBooking,
  canCustomerRescheduleBooking,
  formatMoney,
  getBookingAddressSnapshot,
  getBookingAddressLine,
  getBookingCreationErrorMessage,
  getBookingSchedule,
  getBookingServiceSnapshot,
  getBookingServiceName,
  getBookingStatusLabel,
  getBookingTimeline,
  getPaymentStatusLabel,
  getSnapshotText,
  isSlotConflictError,
} from "./utils";

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: "booking-1",
  booking_number: "PS-0001",
  service: {
    name: "Snapshot AC Cleaning",
    effective_price: "749.00",
  },
  address_snapshot: {
    label: "Snapshot Home",
    address_line_1: "99 Snapshot Street",
    city: "Tirupattur",
    postal_code: "635601",
  },
  service_date: "2026-08-22",
  time_slot: {
    start_time: "10:00:00",
    end_time: "11:00:00",
  },
  problem_description: "AC is noisy.",
  subtotal: "749.00",
  discount_amount: "0.00",
  tax_amount: "0.00",
  total_amount: "749.00",
  advance_required: "199.00",
  advance_paid: "0.00",
  balance_due: "550.00",
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

describe("booking utilities", () => {
  it("creates a booking POST payload using only OpenAPI request fields", () => {
    expect(
      createBookingPayload({
        serviceId: "service-1",
        addressId: "address-1",
        slotId: "slot-1",
        problemDescription: "  Needs deep cleaning. ",
        customerNotes: "  Call first. ",
      }),
    ).toEqual({
      service_id: "service-1",
      address_id: "address-1",
      slot_id: "slot-1",
      problem_description: "Needs deep cleaning.",
      customer_notes: "Call first.",
    });
  });

  it("does not send frontend authoritative totals in the create payload", () => {
    const payload = createBookingPayload({
      serviceId: "service-1",
      addressId: "address-1",
      slotId: "slot-1",
      problemDescription: "Needs cleaning.",
    });

    expect(payload).not.toHaveProperty("final_total");
    expect(payload).not.toHaveProperty("total_amount");
    expect(payload).not.toHaveProperty("advance_required");
    expect(payload).not.toHaveProperty("balance_due");
    expect(payload).not.toHaveProperty("service_name");
    expect(payload).not.toHaveProperty("address_snapshot");
  });

  it("uses backend booking pricing over current service pricing", () => {
    const currentServicePrice = "699.00";
    const createdBooking = booking({ total_amount: "749.00" });

    expect(currentServicePrice).toBe("699.00");
    expect(formatMoney(createdBooking.total_amount)).toBe("₹749");
  });

  it("uses booking snapshots after creation", () => {
    const createdBooking = booking({
      service: { name: "Created Snapshot Service" },
      address_snapshot: { label: "Created Snapshot Address", address_line_1: "12 Historical Road" },
    });

    expect(getSnapshotText(getBookingServiceSnapshot(createdBooking), ["name"])).toBe("Created Snapshot Service");
    expect(getSnapshotText(getBookingAddressSnapshot(createdBooking), ["label"])).toBe("Created Snapshot Address");
  });

  it("keeps booking and payment statuses separate", () => {
    expect(getBookingStatusLabel("PENDING_PAYMENT")).toBe("Payment pending");
    expect(getPaymentStatusLabel("UNPAID")).toBe("Not paid");
  });

  it("builds list/detail summary fields from booking snapshots", () => {
    const item = booking();

    expect(getBookingServiceName(item)).toBe("Snapshot AC Cleaning");
    expect(getBookingAddressLine(item)).toContain("99 Snapshot Street");
    expect(getBookingSchedule(item)).toContain("10:00 am - 11:00 am");
  });

  it("sorts status history chronologically for timeline display", () => {
    const item = booking({
      status_history: [
        {
          id: "history-2",
          from_status: "PENDING_PAYMENT",
          to_status: "CONFIRMED",
          notes: "Payment verified.",
          created_at: "2026-08-20T10:05:00Z",
        },
        {
          id: "history-1",
          from_status: "",
          to_status: "PENDING_PAYMENT",
          notes: "Booking created.",
          created_at: "2026-08-20T10:00:00Z",
        },
      ],
    });

    expect(getBookingTimeline(item).map((entry) => entry.id)).toEqual(["history-1", "history-2"]);
  });

  it("gates customer cancel and reschedule by backend-supported statuses", () => {
    expect(canCustomerCancelBooking(booking({ booking_status: "PENDING_PAYMENT" }))).toBe(true);
    expect(canCustomerCancelBooking(booking({ booking_status: "CONFIRMED" }))).toBe(true);
    expect(canCustomerCancelBooking(booking({ booking_status: "COMPLETED" }))).toBe(false);
    expect(canCustomerRescheduleBooking(booking({ booking_status: "CONFIRMED" }))).toBe(true);
    expect(canCustomerRescheduleBooking(booking({ booking_status: "PENDING_PAYMENT" }))).toBe(false);
    expect(canCustomerRescheduleBooking(booking({ booking_status: "CANCELLED" }))).toBe(false);
  });

  it("maps slot conflicts to the recovery copy", () => {
    const error = new ApiError("Conflict", 409);

    expect(isSlotConflictError(error)).toBe(true);
    expect(getBookingCreationErrorMessage(error)).toBe("That time was just booked by another customer. Please select another slot.");
  });

  it("maps network ambiguity without encouraging duplicate booking creation", () => {
    expect(getBookingCreationErrorMessage(new TypeError("Failed to fetch"))).toContain("couldn't confirm whether your booking was created");
  });
});
