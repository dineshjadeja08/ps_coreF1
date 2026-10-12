import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { cart } = vi.hoisted(() => ({
  cart: {
    items: [{ id: "ac", slug: "ac-inspection-charge", name: "AC Inspection Charge", price: 299, quantity: 1, advance: 49, available: true }],
    count: 1, total: 299, advanceTotal: 49 as number | undefined,
    ready: true, error: null, synced: true, unavailableCount: 0,
    refresh: vi.fn(), remove: vi.fn(), updateQuantity: vi.fn(),
  },
}));
vi.mock("@/features/cart/use-cart", () => ({ useCart: () => cart }));
vi.mock("@/features/auth/components/auth-action-link", () => ({ AuthActionLink: ({ children, href }: { children: string; href: string }) => createElement("a", { href }, children) }));

import { CartScreen } from "./cart-screen";

describe("cart payment summary", () => {
  it("shows the advance as part of the total and the remaining amount after service", () => {
    const html = renderToStaticMarkup(createElement(CartScreen));
    expect(html).toContain("Service total");
    expect(html).toContain("Pay now (advance)");
    expect(html).toContain("Remaining after service");
    expect(html).toContain("₹299");
    expect(html).toContain("₹49");
    expect(html).toContain("₹250");
    expect(html).toContain("not an extra charge");
  });

  it("does not invent an advance amount when the backend has not confirmed it", () => {
    cart.advanceTotal = undefined;
    const html = renderToStaticMarkup(createElement(CartScreen));
    expect(html).toContain("Advance and remaining balance will be confirmed at checkout.");
    expect(html).not.toContain("₹250");
    cart.advanceTotal = 49;
  });

  it("takes an empty cart's Explore services link to the home page", () => {
    const items = cart.items;
    cart.items = [];
    cart.count = 0;
    const html = renderToStaticMarkup(createElement(CartScreen));
    expect(html).toContain('href="/">Explore services</a>');
    cart.items = items;
    cart.count = 1;
  });
});
