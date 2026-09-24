"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
import { formatPrice } from "@/features/catalogue/utils";
import { cn } from "@/lib/utils";

export function CartStickyBar({ insideSheet = false }: { insideSheet?: boolean }) {
  const cart = useCart();
  if (!cart.count) return null;
  const fallbackTotal = cart.items.reduce(
    (sum, item) => sum + ((item.price ?? 0) + (item.trainingFee ?? 0)) * item.quantity,
    0,
  );
  const total = formatPrice(cart.total ?? fallbackTotal);

  return (
    <div
      className={cn(
        "sticky-action-safe border-t border-border bg-white/95 px-4 pt-3 shadow-[0_-8px_28px_rgba(24,24,27,0.12)] backdrop-blur",
        insideSheet ? "sticky bottom-0 z-20" : "fixed inset-x-0 bottom-0 z-30 mx-auto max-w-3xl lg:bottom-4 lg:rounded-xl lg:border",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{cart.count} {cart.count === 1 ? "service" : "services"}</p>
          {total ? <p className="text-xs font-semibold text-secondary">{total}</p> : null}
        </div>
        <Button asChild className="min-h-11 min-w-32 rounded-lg font-bold">
          <Link href="/cart">Proceed</Link>
        </Button>
      </div>
    </div>
  );
}
