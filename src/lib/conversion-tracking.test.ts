import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsDestination, contactConversion, trackConversion } from "./conversion-tracking";

afterEach(() => vi.unstubAllGlobals());

describe("privacy-safe conversion measurement", () => {
  it("recognizes contact links without treating unrelated domains as WhatsApp", () => {
    expect(contactConversion("tel:+917676076361")).toBe("phone_click");
    expect(contactConversion("https://wa.me/917676076361")).toBe("whatsapp_click");
    expect(contactConversion("https://wa.me.evil.example")).toBeNull();
    expect(contactConversion("/book")).toBeNull();
  });
  it("deduplicates successful booking events and sends no booking ID or customer data", () => {
    const gtag = vi.fn();
    const stored = new Map<string, string>();
    vi.stubGlobal("window", { gtag, sessionStorage: { getItem: (key: string) => stored.get(key), setItem: (key: string, value: string) => stored.set(key, value) } });
    trackConversion("booking_created", "test-success-id");
    trackConversion("booking_created", "test-success-id");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "booking_created", { send_to: analyticsDestination });
  });
  it("never interrupts bookings when analytics or storage is unavailable", () => {
    vi.stubGlobal("window", { sessionStorage: { getItem: () => { throw new Error("Blocked"); } } });
    expect(() => trackConversion("booking_created", "blocked-id")).not.toThrow();
    vi.stubGlobal("window", { gtag: () => { throw new Error("Tag blocked"); } });
    expect(() => trackConversion("phone_click")).not.toThrow();
    vi.stubGlobal("window", undefined);
    expect(() => trackConversion("phone_click")).not.toThrow();
  });
});
