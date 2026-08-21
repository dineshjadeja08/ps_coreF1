import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setAuthTokens } from "@/features/auth/storage";
import { paymentsApi } from "@/features/payments/api";

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

describe("payments API", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates an advance order without sending a frontend amount", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          payment_id: "payment-1",
          booking_id: "booking-1",
          provider_order_id: "order_1",
          amount: "249.00",
          amount_paise: 24900,
          currency: "INR",
          key_id: "rzp_test_key",
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const order = await paymentsApi.createAdvanceOrder("booking-1");

    expect(order.amount).toBe("249.00");
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/bookings/booking-1/payments/order/");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access-token");
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it("verifies payment through the backend before success can be trusted", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          payment_id: "payment-1",
          booking_id: "booking-1",
          payment_status: "SUCCESS",
          booking_status: "CONFIRMED",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await paymentsApi.verify({
      razorpay_order_id: "order_123",
      razorpay_payment_id: "pay_123",
      razorpay_signature: "signature",
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/payments/verify/");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      razorpay_order_id: "order_123",
      razorpay_payment_id: "pay_123",
      razorpay_signature: "signature",
    });
  });
});
