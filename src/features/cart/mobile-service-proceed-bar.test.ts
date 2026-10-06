import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileServiceProceedBar } from "@/features/cart/mobile-service-proceed-bar";
import { CartStickyBar } from "@/features/catalogue/components/landing/cart-sticky-bar";

const { cart } = vi.hoisted(() => ({
  cart: { count: 1, total: null as number | null, items: [{ price: 299, trainingFee: 0, quantity: 1 }] },
}));
vi.mock("@/features/cart/use-cart", () => ({ useCart: () => cart }));

describe("mobile cart proceed controls", () => {
  beforeEach(() => { cart.count = 1; cart.total = null; });

  it("shows a cart link and subtotal after adding a service", () => {
    const html = renderToStaticMarkup(createElement(MobileServiceProceedBar));
    expect(html).toContain('href="/cart"');
    expect(html).toContain("Proceed");
    expect(html).toContain("service added");
    expect(html).toContain("299");
    expect(html).toContain("safe-area-inset-bottom");
  });

  it("keeps proceed available inside package sheets", () => {
    const html = renderToStaticMarkup(createElement(CartStickyBar, { insideSheet: true }));
    expect(html).toContain('href="/cart"');
    expect(html).toContain("Proceed");
  });

  it("does not show proceed for an empty cart", () => {
    cart.count = 0;
    expect(renderToStaticMarkup(createElement(MobileServiceProceedBar))).toBe("");
    expect(renderToStaticMarkup(createElement(CartStickyBar, { insideSheet: true }))).toBe("");
  });
});
