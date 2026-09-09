import { describe, expect, it } from "vitest";
import { mergeCart, parseCart, type CartItem } from "./store";
const sofa: CartItem = { id: "sofa", slug: "sofa-repair", name: "Sofa repair", price: 499 };
const ac: CartItem = { id: "ac", slug: "ac-service", name: "AC service", price: 399 };
describe("cart storage", () => {
  it("restores multiple selections and an unfinished checkout", () => {
    const saved = [sofa, { ...ac, bookingId: "pending-booking" }];
    expect(parseCart(JSON.stringify(saved))).toEqual(saved);
  });
  it("rejects corrupt storage and invalid amounts", () => {
    expect(parseCart("broken json")).toEqual([]);
    expect(parseCart(JSON.stringify([{ ...sofa, price: -5 }]))).toEqual([]);
    expect(parseCart(JSON.stringify([{ ...sofa, slug: "" }]))).toEqual([]);
  });
  it("keeps a zero price distinct from an unknown price", () => {
    expect(parseCart(JSON.stringify([{ ...sofa, price: 0 }, { ...ac, price: null }])).map((item) => item.price)).toEqual([0, null]);
  });
  it("merges guest selections without duplicating services or losing a pending payment", () => {
    const pending = { ...ac, bookingId: "pending-booking" };
    const merged = mergeCart([pending], [sofa, ac]);
    expect(merged).toHaveLength(2);
    expect(merged.find((item) => item.id === "ac")?.bookingId).toBe("pending-booking");
    expect(mergeCart(merged, [sofa])).toHaveLength(2);
  });
});
