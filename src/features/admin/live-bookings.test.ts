import { describe, expect, it } from "vitest";
import { updateBookingCursor } from "./live-bookings";
import type { Booking } from "@/types/api";

const booking = (id: string, created_at: string) => ({ id, created_at } as Booking);

describe("new booking alerts", () => {
  it("uses the first response as a baseline without notifying", () => {
    const result = updateBookingCursor(null, [booking("old", "2026-10-05T10:00:00Z")]);
    expect(result.newBookings).toEqual([]);
    expect(result.cursor.ids).toEqual(["old"]);
  });

  it("alerts once for new records and ignores edits to existing bookings", () => {
    const old = booking("old", "2026-10-05T10:00:00Z");
    const baseline = updateBookingCursor(null, [old]).cursor;
    const fresh = booking("new", "2026-10-05T10:00:15Z");
    const result = updateBookingCursor(baseline, [fresh, old]);
    expect(result.newBookings.map((item) => item.id)).toEqual(["new"]);
    expect(updateBookingCursor(result.cursor, [fresh, old]).newBookings).toEqual([]);
  });

  it("recognizes different IDs with identical creation times", () => {
    const first = booking("one", "2026-10-05T10:00:00Z");
    const second = booking("two", first.created_at);
    const result = updateBookingCursor(updateBookingCursor(null, [first]).cursor, [second, first]);
    expect(result.newBookings.map((item) => item.id)).toEqual(["two"]);
    expect(updateBookingCursor(result.cursor, [second, first]).newBookings).toEqual([]);
  });

  it("ignores older bookings and malformed timestamps", () => {
    const baseline = updateBookingCursor(null, [booking("one", "2026-10-05T10:00:00Z")]).cursor;
    const result = updateBookingCursor(baseline, [booking("old", "2026-10-04T10:00:00Z"), booking("invalid", "bad-date")]);
    expect(result.newBookings).toEqual([]);
    expect(result.cursor).toEqual(baseline);
  });
});
