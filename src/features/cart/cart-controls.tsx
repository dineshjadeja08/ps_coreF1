"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceListItem } from "@/features/catalogue/types";
import { useCart } from "./use-cart";

export function AddToCartButton({ service, className }: { service: ServiceListItem; className?: string }) {
  const cart = useCart();
  const item = cart.items.find((entry) => entry.id === service.id);
  const controlClassName = `min-h-10 max-w-full ${className ?? ""}`;

  return <div className="min-w-0">
    <AnimatePresence mode="wait" initial={false}>
      {item ? (
        <motion.div key="quantity" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.18, ease: "easeOut" }}>
          <QuantityStepper
            name={service.name}
            quantity={item.quantity}
            className={controlClassName}
            disabled={!cart.ready || Boolean(item.bookingId)}
            onDecrement={() => item.quantity <= 1 ? cart.remove(item.id) : cart.updateQuantity(item.id, item.quantity - 1)}
            onIncrement={() => cart.updateQuantity(item.id, item.quantity + 1)}
          />
        </motion.div>
      ) : (
        <motion.div key="add" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.18, ease: "easeOut" }} whileTap={{ scale: 0.95 }}>
          <Button type="button" size="sm" variant="outline" className={`${controlClassName} border-primary font-bold text-primary hover:bg-primary-soft`} disabled={!cart.ready} onClick={() => cart.add(service)} aria-label={`Add ${service.name} to cart`}>
            <Plus className="h-4 w-4" /><span aria-live="polite">Add</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
    {cart.error ? <p role="alert" className="mt-1 max-w-56 text-xs text-destructive">Cart could not sync. <Link href="/cart" className="underline">Review cart</Link></p> : null}
  </div>;
}

export function QuantityStepper({ name, quantity, onDecrement, onIncrement, disabled, className }: { name: string; quantity: number; onDecrement: () => void; onIncrement: () => void; disabled?: boolean; className?: string }) {
  return <div className={`inline-grid grid-cols-[2.5rem_minmax(2.5rem,1fr)_2.5rem] items-center overflow-hidden rounded-md border border-primary bg-white text-primary ${className ?? ""}`} aria-label={`${name} quantity`}>
    <motion.button type="button" whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} className="grid min-h-10 place-items-center hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50" onClick={onDecrement} disabled={disabled} aria-label={`Decrease ${name} quantity`}><Minus className="h-4 w-4" /></motion.button>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={quantity} aria-live="polite" aria-atomic="true" initial={{ opacity: 0.65, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.12, ease: "easeOut" }} className="text-center text-sm font-extrabold tabular-nums">{quantity}</motion.span>
    </AnimatePresence>
    <motion.button type="button" whileTap={{ scale: 0.9 }} transition={{ duration: 0.12 }} className="grid min-h-10 place-items-center hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50" onClick={onIncrement} disabled={disabled || quantity >= 20} aria-label={`Increase ${name} quantity`}><Plus className="h-4 w-4" /></motion.button>
  </div>;
}

export function CartNavLink() {
  const { count } = useCart();
  return <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "service" : "services"}`} className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary">
    <ShoppingCart className="h-5 w-5" />
    <AnimatePresence>{count > 0 ? <motion.span key={count} aria-live="polite" aria-atomic="true" initial={{ scale: 0.7 }} animate={{ scale: [0.7, 1.18, 1] }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">{count}</motion.span> : null}</AnimatePresence>
  </Link>;
}
export function CartSummary() {
  const { count } = useCart();
  return <div className="rounded-lg border border-border bg-white p-4 text-center"><p className="font-bold">Your cart · {count}</p><p className="mt-2 text-sm text-secondary">Choose services, then review your cart.</p><Button asChild className="mt-3"><Link href="/cart">View cart</Link></Button></div>;
}
