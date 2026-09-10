import { apiRequest } from "@/lib/api/client";
import type { Booking, BookingCreateRequest } from "@/types/api";
import type { CartItem } from "./store";

type ServerCart = { items: Array<Omit<CartItem, "price" | "advance" | "bookingId"> & { price: string; advance: string; bookingId: string | null }>; unavailable_service_ids?: string[]; count: number; total: string; advance_total: string };
export type CartData = { items: CartItem[]; total: number; advanceTotal: number; unavailableCount: number };
export function normalizeCart(data: ServerCart): CartData {
  return { unavailableCount: data.unavailable_service_ids?.length ?? 0, items: data.items.map((item) => ({ ...item, price: Number(item.price), advance: Number(item.advance), bookingId: item.bookingId ?? undefined })), total: Number(data.total), advanceTotal: Number(data.advance_total) };
}
export const cartApi = {
  async get() { return normalizeCart(await apiRequest<ServerCart>("/api/v1/cart/", { auth: true })); },
  async add(ids: string[]) { return normalizeCart(await apiRequest<ServerCart>("/api/v1/cart/", { auth: true, method: "POST", body: { service_ids: ids } })); },
  async merge(items: CartItem[]) { return normalizeCart(await apiRequest<ServerCart>("/api/v1/cart/", { auth: true, method: "POST", body: { service_ids: items.map((item) => item.id), merge: true, booking_ids: Object.fromEntries(items.filter((item) => item.bookingId).map((item) => [item.id, item.bookingId])) } })); },
  async remove(id: string) { return normalizeCart(await apiRequest<ServerCart>(`/api/v1/cart/items/${encodeURIComponent(id)}/`, { auth: true, method: "DELETE" })); },
  async checkout(items: BookingCreateRequest[]) {
    const result = await apiRequest<{ bookings: Booking[]; cart: ServerCart }>("/api/v1/cart/checkout/", { auth: true, method: "POST", body: { items } });
    return { bookings: result.bookings, cart: normalizeCart(result.cart) };
  },
};
