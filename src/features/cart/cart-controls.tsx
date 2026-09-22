"use client";

import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceListItem } from "@/features/catalogue/types";
import { useCart } from "./use-cart";

export function AddToCartButton({ service, className }: { service: ServiceListItem; className?: string }) {
  const cart = useCart();
  const added = cart.items.some((item) => item.id === service.id);
  return <div className="min-w-0">{added ? <Button asChild size="sm" className={`min-h-10 max-w-full ${className ?? ""}`}>
    <Link href="/cart" aria-label={`${service.name} added. Proceed to cart`}><Check className="h-4 w-4" /><span aria-live="polite">Proceed to cart</span></Link>
  </Button> : <Button type="button" size="sm" className={`min-h-10 max-w-full ${className ?? ""}`} disabled={!cart.ready} onClick={() => cart.add(service)} aria-label={`Add ${service.name} to cart`}>
    <ShoppingCart className="h-4 w-4" /><span aria-live="polite">Add to cart</span>
  </Button>}{cart.error ? <p role="alert" className="mt-1 max-w-56 text-xs text-destructive">Cart could not sync. <Link href="/cart" className="underline">Review cart</Link></p> : null}</div>;
}
export function CartNavLink() {
  const { count } = useCart();
  return <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "service" : "services"}`} className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary">
    <ShoppingCart className="h-5 w-5" />
    {count > 0 ? <span aria-live="polite" aria-atomic="true" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">{count}</span> : null}
  </Link>;
}
export function CartSummary() {
  const { count } = useCart();
  return <div className="rounded-lg border border-border bg-white p-4 text-center"><p className="font-bold">Your cart · {count}</p><p className="mt-2 text-sm text-secondary">Choose services, then review your cart.</p><Button asChild className="mt-3"><Link href="/cart">View cart</Link></Button></div>;
}
