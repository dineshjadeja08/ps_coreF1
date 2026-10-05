import type { Booking } from "@/types/api";

export type BookingCursor = { createdAt: number; ids: string[] };

export function updateBookingCursor(previous: BookingCursor | null, bookings: Booking[]) {
  const valid = bookings.filter((booking) => Number.isFinite(Date.parse(booking.created_at)));
  const createdAt = Math.max(previous?.createdAt ?? 0, ...valid.map((booking) => Date.parse(booking.created_at)));
  const newBookings = previous ? valid.filter((booking) => Date.parse(booking.created_at) >= previous.createdAt && !previous.ids.includes(booking.id)) : [];
  const ids = Array.from(new Set([
    ...(previous?.createdAt === createdAt ? previous.ids : []),
    ...valid.filter((booking) => Date.parse(booking.created_at) === createdAt).map((booking) => booking.id),
  ]));
  return { cursor: { createdAt, ids }, newBookings };
}
