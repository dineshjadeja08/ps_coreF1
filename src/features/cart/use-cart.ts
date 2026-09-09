"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/hooks";
import type { ServiceListItem } from "@/features/catalogue/types";
import { getCurrentPrice } from "@/features/catalogue/utils";
import { mergeCart, parseCart, type CartItem } from "./store";

const eventName = "purple-squad-cart-change";
const guestKey = "purple-squad-cart-v1:guest";
const fallback = new Map<string, string>();
function read(key: string) {
  try { return window.localStorage.getItem(key) ?? fallback.get(key) ?? "[]"; }
  catch { return fallback.get(key) ?? "[]"; }
}
function write(key: string, items: CartItem[]) {
  const value = JSON.stringify(items);
  fallback.set(key, value);
  try { window.localStorage.setItem(key, value); } catch { /* Keep the cart available in memory when storage is blocked. */ }
  window.dispatchEvent(new Event(eventName));
}
function subscribe(listener: () => void) {
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", listener); };
}

export function useCart() {
  const { user, isLoading } = useAuth();
  const key = user ? `purple-squad-cart-v1:${user.id}` : guestKey;
  const raw = useSyncExternalStore(subscribe, () => read(key), () => "[]");
  const items = useMemo(() => parseCart(raw), [raw]);
  useEffect(() => {
    if (isLoading || !user) return;
    const guest = parseCart(read(guestKey));
    if (guest.length) { write(key, mergeCart(parseCart(read(key)), guest)); write(guestKey, []); }
  }, [key, user, isLoading]);
  return {
    items, ready: !isLoading, count: items.length,
    add(service: ServiceListItem) {
      if (isLoading) return;
      const rawPrice = getCurrentPrice(service);
      const price = rawPrice == null ? NaN : Number(rawPrice);
      write(key, mergeCart(parseCart(read(key)), [{ id: service.id, slug: service.slug, name: service.name, price: Number.isFinite(price) && price >= 0 ? price : null }]));
    },
    remove(id: string) { write(key, parseCart(read(key)).filter((item) => item.id !== id)); },
    markBooked(slug: string, bookingId: string) { write(key, parseCart(read(key)).map((item) => item.slug === slug ? { ...item, bookingId } : item)); },
    complete(bookingId: string) { const saved = parseCart(read(key)); if (saved.some((item) => item.bookingId === bookingId)) write(key, saved.filter((item) => item.bookingId !== bookingId)); },
  };
}
