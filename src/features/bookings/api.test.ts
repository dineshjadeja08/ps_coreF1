import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setAuthTokens } from "@/features/auth/storage";
import { bookingsApi } from "@/features/bookings/api";

function installLocalStorage() {
  const data = new Map<string, string>();

  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });
}

describe("bookings API", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts booking creation to the OpenAPI endpoint with required IDs and auth", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "booking-1",
          booking_number: "PS-0001",
          service: {},
          address_snapshot: {},
          service_date: "2026-08-22",
          time_slot: {},
          problem_description: "Needs cleaning.",
          subtotal: "749.00",
          total_amount: "749.00",
          advance_required: "199.00",
          balance_due: "550.00",
          payment_status: "UNPAID",
          booking_status: "PENDING_PAYMENT",
          created_at: "2026-08-20T10:00:00Z",
          updated_at: "2026-08-20T10:00:00Z",
          status_history: [],
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await bookingsApi.create({
      service_id: "service-1",
      address_id: "address-1",
      slot_id: "slot-1",
      problem_description: "Needs cleaning.",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/bookings/");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access-token");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      service_id: "service-1",
      address_id: "address-1",
      slot_id: "slot-1",
      problem_description: "Needs cleaning.",
    });
  });

  it("posts cancel notes to the customer cancel endpoint", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "booking-1",
          booking_number: "PS-0001",
          service: {},
          address_snapshot: {},
          service_date: "2026-08-22",
          time_slot: {},
          problem_description: "Needs cleaning.",
          subtotal: "749.00",
          total_amount: "749.00",
          advance_required: "199.00",
          balance_due: "550.00",
          payment_status: "UNPAID",
          booking_status: "CANCELLED",
          created_at: "2026-08-20T10:00:00Z",
          updated_at: "2026-08-20T10:00:00Z",
          status_history: [],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await bookingsApi.cancel("booking-1", { notes: "Plans changed." });

    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/bookings/booking-1/cancel/");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ notes: "Plans changed." });
  });

  it("posts the selected slot to the customer reschedule endpoint", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "booking-1",
          booking_number: "PS-0001",
          service: {},
          address_snapshot: {},
          service_date: "2026-08-23",
          time_slot: { id: "slot-2" },
          problem_description: "Needs cleaning.",
          subtotal: "749.00",
          total_amount: "749.00",
          advance_required: "199.00",
          balance_due: "550.00",
          payment_status: "PARTIALLY_PAID",
          booking_status: "CONFIRMED",
          created_at: "2026-08-20T10:00:00Z",
          updated_at: "2026-08-20T10:00:00Z",
          status_history: [],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await bookingsApi.reschedule("booking-1", { slot_id: "slot-2", notes: "Morning works better." });

    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/bookings/booking-1/reschedule/");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ slot_id: "slot-2", notes: "Morning works better." });
  });
});
