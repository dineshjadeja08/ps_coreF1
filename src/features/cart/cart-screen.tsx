"use client";

import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import { formatPrice } from "@/features/catalogue/utils";
import { ServiceIcon } from "@/features/catalogue/components/service-icon";
import { useCart } from "./use-cart";

export function CartScreen() {
  const cart = useCart();
  const next = cart.items[0];
  const total = cart.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const hasUnknownPrice = cart.items.some((item) => item.price === null);
  const checkoutHref = next?.bookingId ? `/book/pay/${encodeURIComponent(next.bookingId)}` : `/book?service=${encodeURIComponent(next?.slug ?? "")}&cart=1`;
  return <section className="page-container py-8 pb-28">
    <div className="mb-7 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Your cart</h1><p className="mt-2 text-secondary">{cart.count} {cart.count === 1 ? "service" : "services"} selected</p></div><Link href="/services" className="font-semibold text-primary">Add more services</Link></div>
    {!cart.ready ? <p>Loading your cart…</p> : !next ? <div className="rounded-xl border border-border p-10 text-center"><ShoppingCart className="mx-auto h-12 w-12 text-primary" /><h2 className="mt-4 text-xl font-bold">Your cart is empty</h2><p className="mt-2 text-secondary">Add the services you need and check out when you are ready.</p><Button asChild className="mt-5"><Link href="/services">Explore services</Link></Button></div> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-3">{cart.items.map((item) => <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
        <ServiceIcon label={item.name} /><div className="min-w-0 flex-1"><Link href={`/services/${encodeURIComponent(item.slug)}`} className="font-bold hover:text-primary">{item.name}</Link><p className="mt-1 text-sm text-secondary">{item.bookingId ? "Booking created — resume payment" : "Choose address and time at checkout"}</p><p className="mt-2 font-semibold">{formatPrice(item.price) ?? "Price confirmed at checkout"}</p>
        {item.bookingId ? <Link href={`/book/pay/${encodeURIComponent(item.bookingId)}`} className="mt-2 block text-sm font-semibold text-primary">Resume payment</Link> : null}</div>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${item.name} from cart`} onClick={() => cart.remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
      </article>)}</div>
      <aside className="rounded-xl border border-purple-100 bg-primary-soft p-6"><h2 className="text-xl font-bold">Order summary</h2><div className="mt-5 flex justify-between gap-4"><span>Services</span><span>{cart.count}</span></div><div className="mt-4 flex justify-between gap-4 text-lg font-bold"><span>Estimated total</span><span>{hasUnknownPrice ? "At checkout" : formatPrice(total)}</span></div><p className="mt-3 text-sm leading-6 text-secondary">Select an address and time for each service. Confirm and pay each service separately. Current prices and advances are confirmed before payment.</p><Button asChild className="mt-5 w-full"><AuthActionLink href={checkoutHref} serviceSlug={next.slug}>{next.bookingId ? "Resume checkout" : "Checkout"}</AuthActionLink></Button><p className="mt-3 text-xs leading-5 text-secondary">Your remaining services stay in the cart until you complete their payments. Removing a service from the cart does not cancel an existing booking.</p></aside>
    </div>}
  </section>;
}
