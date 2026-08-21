import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setAuthTokens } from "@/features/auth/storage";
import { reviewsApi } from "@/features/reviews/api";

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

describe("reviews API", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts rating and comment to the booking review endpoint", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "review-1",
          booking: "booking-1",
          customer: {},
          technician: null,
          rating: 5,
          comment: "Great service.",
          is_visible: true,
          created_at: "2026-08-20T10:00:00Z",
          updated_at: "2026-08-20T10:00:00Z",
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await reviewsApi.createForBooking("booking-1", { rating: 5, comment: "Great service." });

    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/bookings/booking-1/review/");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access-token");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ rating: 5, comment: "Great service." });
  });
});
