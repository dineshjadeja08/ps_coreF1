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
  const total = cart.total ?? cart.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const hasUnknownPrice = cart.items.some((item) => item.price === null);
  const canCheckout = cart.ready && !cart.error && next?.available !== false;
  const checkoutHref = next?.bookingId ? `/book/pay/${encodeURIComponent(next.bookingId)}` : `/book?service=${encodeURIComponent(next?.slug ?? "")}&cart=1`;
  return <section className="page-container py-6 pb-36 sm:py-8">
    {cart.unavailableCount > 0 ? <p role="status" className="mb-4 rounded-lg bg-amber-50 p-4 text-sm">{cart.unavailableCount} saved services are no longer available and were left out of your cart.</p> : null}
    {cart.error ? <div role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-destructive">{cart.error}<Button variant="ghost" onClick={cart.refresh}>Retry</Button></div> : null}
    <div className="mb-7 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Your cart</h1><p className="mt-2 text-secondary">{cart.count} {cart.count === 1 ? "service" : "services"} selected</p></div><Link href="/services" className="font-semibold text-primary">Add more services</Link></div>
    {!cart.ready && !cart.count ? <p>Loading your cart…</p> : !next ? <div className="rounded-xl border border-border p-10 text-center"><ShoppingCart className="mx-auto h-12 w-12 text-primary" /><h2 className="mt-4 text-xl font-bold">Your cart is empty</h2><p className="mt-2 text-secondary">Add the services you need and check out when you are ready.</p><Button asChild className="mt-5"><Link href="/services">Explore services</Link></Button></div> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-3">{cart.items.map((item) => <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
        <ServiceIcon label={item.name} /><div className="min-w-0 flex-1"><Link href={`/services/${encodeURIComponent(item.slug)}`} className="font-bold hover:text-primary">{item.name}</Link><p className="mt-1 text-sm text-secondary">{item.available === false ? "Currently unavailable — remove to continue" : item.bookingId ? "Booking created — resume payment" : "Choose address and time at checkout"}</p><p className="mt-2 font-semibold">{formatPrice(item.price) ?? "Price confirmed at checkout"}</p>
        {item.bookingId ? <Link href={`/book/pay/${encodeURIComponent(item.bookingId)}`} className="mt-2 block text-sm font-semibold text-primary">Resume payment</Link> : null}</div>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${item.name} from cart`} disabled={!cart.ready} onClick={() => cart.remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
      </article>)}</div>
      <aside className="lg:sticky lg:top-28 rounded-xl border border-purple-100 bg-primary-soft p-6"><h2 className="text-xl font-bold">Order summary</h2>{cart.synced ? <p className="mt-2 text-xs text-primary">Saved to your account · prices checked</p> : null}<div className="mt-5 flex justify-between gap-4"><span>Services</span><span>{cart.count}</span></div><div className="mt-4 flex justify-between gap-4 text-lg font-bold"><span>{cart.synced ? "Service total" : "Estimated total"}</span><span>{hasUnknownPrice ? "At checkout" : formatPrice(total)}</span></div><p className="mt-3 text-sm leading-6 text-secondary">Select an address and time for each service. Confirm and pay each service separately. Current prices and advances are confirmed before payment.</p>{canCheckout ? <Button asChild className="mt-5 hidden w-full h-12 md:inline-flex"><AuthActionLink href={checkoutHref} serviceSlug={next.slug}>{next.bookingId ? "Resume checkout" : "Checkout"}</AuthActionLink></Button> : <Button disabled className="mt-5 hidden w-full h-12 md:inline-flex">Checkout</Button>}<p className="mt-3 text-xs leading-5 text-secondary">Your remaining services stay in the cart until you complete their payments. Removing a service from the cart does not cancel an existing booking.</p></aside>
    </div>}
    {next ? <div className="sticky-action-safe fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-white px-4 pt-3 shadow-[0_-4px_20px_#0000000a] md:hidden"><div className="min-w-0"><p className="text-xs text-secondary">{cart.count} services</p><p className="text-lg font-bold">{hasUnknownPrice ? "At checkout" : formatPrice(total)}</p></div>{canCheckout ? <Button asChild className="h-12 min-w-40"><AuthActionLink href={checkoutHref} serviceSlug={next.slug}>{next.bookingId ? "Resume checkout" : "Checkout"}</AuthActionLink></Button> : <Button disabled className="h-12 min-w-40">Checkout</Button>}</div> : null}
  </section>;
}
