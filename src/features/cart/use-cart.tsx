"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks";
import type { ServiceListItem } from "@/features/catalogue/types";
import type { BookingCreateRequest } from "@/types/api";
import { getCurrentPrice } from "@/features/catalogue/utils";
import { mergeCart, parseCart, type CartItem } from "./store";
import { cartApi } from "./api";

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
  try { window.localStorage.setItem(key, value); } catch { /* Keep guest selections in memory if storage is unavailable. */ }
  window.dispatchEvent(new Event(eventName));
}
function subscribe(listener: () => void) {
  window.addEventListener(eventName, listener); window.addEventListener("storage", listener);
  return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", listener); };
}

function useCartState() {
  const { user, isLoading } = useAuth();
  const accountId = user?.id;
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["cart", accountId ?? "guest"], [accountId]);
  const guestRaw = useSyncExternalStore(subscribe, () => read(guestKey), () => "[]");
  const guestItems = useMemo(() => parseCart(guestRaw), [guestRaw]);
  const server = useQuery({
    queryKey, enabled: Boolean(accountId) && !isLoading, retry: 1, staleTime: 0, refetchOnWindowFocus: true,
    queryFn: async () => {
      const legacyKey = `purple-squad-cart-v1:${accountId}`;
      const imported = mergeCart(parseCart(read(legacyKey)), parseCart(read(guestKey)));
      if (imported.length) {
        const result = await cartApi.merge(imported);
        write(legacyKey, []); write(guestKey, []);
        return result;
      }
      return cartApi.get();
    },
  });
  const mutation = useMutation({
    scope: { id: `cart-${accountId}` },
    mutationFn: (action: { add: string } | { remove: string }) => "add" in action ? cartApi.add([action.add]) : cartApi.remove(action.remove),
    onMutate: () => queryClient.cancelQueries({ queryKey }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });
  const checkoutMutation = useMutation({
    mutationFn: (payload: BookingCreateRequest) => cartApi.checkout([payload]),
    onSuccess: (result) => queryClient.setQueryData(queryKey, result.cart),
  });
  const resetMutation = mutation.reset;
  const resetCheckout = checkoutMutation.reset;
  const refresh = useCallback(() => { resetMutation(); resetCheckout(); void queryClient.invalidateQueries({ queryKey }); }, [queryClient, queryKey, resetMutation, resetCheckout]);
  const complete = refresh;
  const items = accountId ? server.data?.items ?? [] : guestItems;
  const error = mutation.error ?? checkoutMutation.error ?? (accountId ? server.error : null);
  return {
    items, count: items.length, ready: !isLoading && (!accountId || !server.isPending) && !mutation.isPending && !checkoutMutation.isPending,
    error: error ? "We could not sync your cart. Check your connection and retry." : null,
    total: accountId ? server.data?.total : undefined,
    advanceTotal: accountId ? server.data?.advanceTotal : undefined,
    unavailableCount: server.data?.unavailableCount ?? 0,
    synced: Boolean(accountId && server.isSuccess),
    refresh,
    add(service: ServiceListItem) {
      if (isLoading) return;
      if (accountId) { mutation.mutate({ add: service.id }); return; }
      const price = Number(getCurrentPrice(service));
      write(guestKey, mergeCart(parseCart(read(guestKey)), [{ id: service.id, slug: service.slug, name: service.name, price: Number.isFinite(price) && price >= 0 ? price : null }]));
    },
    remove(id: string) { if (accountId) mutation.mutate({ remove: id }); else write(guestKey, parseCart(read(guestKey)).filter((item) => item.id !== id)); },
    async checkout(payload: BookingCreateRequest) { return (await checkoutMutation.mutateAsync(payload)).bookings[0]; },
    markBooked: refresh, complete,
  };
}

const CartContext = createContext<ReturnType<typeof useCartState> | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartState();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider is required");
  return value;
}
