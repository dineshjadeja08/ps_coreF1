"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks";
import type { ServiceListItem } from "@/features/catalogue/types";
import type { BookingCreateRequest } from "@/types/api";
import { getCurrentPrice } from "@/features/catalogue/utils";
import { mergeCart, parseCart, type CartItem } from "./store";
import { cartApi, type CartData } from "./api";

type CartAction = { add: ServiceListItem } | { remove: string };

function optimisticCartItem(service: ServiceListItem): CartItem {
  const price = Number(getCurrentPrice(service));
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    price: Number.isFinite(price) && price >= 0 ? price : null,
    quantity: 1,
    basePrice: Number(service.base_price),
    trainingFee: Number(service.training_fee ?? 0),
  };
}

function withQuantity(data: CartData, id: string, quantity: number): CartData {
  let totalDelta = 0;
  const items = data.items.map((item) => {
    if (item.id !== id) return item;
    const nextPrice = item.price === null ? null : (item.price / item.quantity) * quantity;
    if (item.price !== null && nextPrice !== null) totalDelta = nextPrice - item.price;
    return { ...item, quantity, price: nextPrice };
  });
  return { ...data, items, total: data.total + totalDelta };
}

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
  const quantityTimers = useRef(new Map<string, number>());
  const desiredQuantities = useRef(new Map<string, number>());
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
    mutationFn: (action: CartAction) => {
      if ("add" in action) return cartApi.add([action.add.id]);
      return cartApi.remove(action.remove);
    },
    onMutate: async (action) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CartData>(queryKey);
      queryClient.setQueryData<CartData>(queryKey, (current) => {
        if (!current) return current;
        if ("add" in action) {
          if (current.items.some((item) => item.id === action.add.id)) return current;
          const item = optimisticCartItem(action.add);
          return { ...current, items: [...current.items, item], total: current.total + (item.price ?? 0) + (item.trainingFee ?? 0) };
        }
        const removed = current.items.find((item) => item.id === action.remove);
        return { ...current, items: current.items.filter((item) => item.id !== action.remove), total: Math.max(0, current.total - (removed?.price ?? 0)) };
      });
      return { previous };
    },
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
    onError: (_error, _action, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });
  const quantityMutation = useMutation({
    scope: { id: `cart-${accountId}` },
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => cartApi.updateQuantity(id, quantity),
    onSuccess: (data, variables) => {
      if (desiredQuantities.current.get(variables.id) === variables.quantity) {
        desiredQuantities.current.delete(variables.id);
        queryClient.setQueryData(queryKey, data);
      }
    },
    onError: (_error, variables) => {
      desiredQuantities.current.delete(variables.id);
      void queryClient.invalidateQueries({ queryKey });
    },
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
  const error = mutation.error ?? quantityMutation.error ?? checkoutMutation.error ?? (accountId ? server.error : null);
  function cancelQuantityUpdate(id: string) {
    const timer = quantityTimers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    quantityTimers.current.delete(id);
    desiredQuantities.current.delete(id);
  }
  return {
    items, count: items.reduce((sum, item) => sum + item.quantity, 0), ready: !isLoading && (!accountId || !server.isPending) && !mutation.isPending && !checkoutMutation.isPending,
    error: error ? "We could not sync your cart. Check your connection and retry." : null,
    total: accountId ? server.data?.total : undefined,
    advanceTotal: accountId ? server.data?.advanceTotal : undefined,
    unavailableCount: server.data?.unavailableCount ?? 0,
    synced: Boolean(accountId && server.isSuccess),
    refresh,
    add(service: ServiceListItem) {
      if (isLoading) return;
      if (accountId) { mutation.mutate({ add: service }); return; }
      const price = Number(getCurrentPrice(service));
      write(guestKey, mergeCart(parseCart(read(guestKey)), [{ id: service.id, slug: service.slug, name: service.name, price: Number.isFinite(price) && price >= 0 ? price : null, quantity: 1, basePrice: Number(service.base_price), trainingFee: Number(service.training_fee ?? 0) }]));
    },
    remove(id: string) {
      cancelQuantityUpdate(id);
      if (accountId) mutation.mutate({ remove: id }); else write(guestKey, parseCart(read(guestKey)).filter((item) => item.id !== id));
    },
    updateQuantity(id: string, quantity: number) {
      const safeQuantity = Math.max(1, Math.min(20, Math.trunc(quantity)));
      if (accountId) {
        desiredQuantities.current.set(id, safeQuantity);
        queryClient.setQueryData<CartData>(queryKey, (current) => current ? withQuantity(current, id, safeQuantity) : current);
        const currentTimer = quantityTimers.current.get(id);
        if (currentTimer !== undefined) window.clearTimeout(currentTimer);
        quantityTimers.current.set(id, window.setTimeout(() => {
          quantityTimers.current.delete(id);
          quantityMutation.mutate({ id, quantity: safeQuantity });
        }, 450));
        return;
      }
      write(guestKey, parseCart(read(guestKey)).map((item) => item.id === id ? { ...item, quantity: safeQuantity } : item));
    },
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
