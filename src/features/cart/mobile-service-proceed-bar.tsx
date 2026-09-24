"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
import { formatPrice } from "@/features/catalogue/utils";

export function MobileServiceProceedBar() {
  const cart = useCart();
  if (!cart.count) return null;
  const fallbackTotal = cart.items.reduce(
    (sum, item) => sum + ((item.price ?? 0) + (item.trainingFee ?? 0)) * item.quantity,
    0,
  );

  return (
    <aside className="fixed inset-x-0 bottom-[var(--mobile-nav-height)] z-[39] border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(24,24,27,0.1)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-foreground">{cart.count} {cart.count === 1 ? "service" : "services"} added</p>
          <p className="text-xs font-semibold text-secondary">{formatPrice(cart.total ?? fallbackTotal)}</p>
        </div>
        <Button asChild className="h-10 min-w-28 rounded-lg px-4">
          <Link href="/cart">Proceed <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </aside>
  );
}
