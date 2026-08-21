import { afterEach, describe, expect, it, vi } from "vitest";

import { loadRazorpayCheckout } from "./razorpay";

describe("razorpay loader", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("rejects outside the browser", async () => {
    vi.stubGlobal("window", undefined);

    await expect(loadRazorpayCheckout()).rejects.toThrow("browser");
  });

  it("surfaces script load failure", async () => {
    type ScriptStub = {
      src: string;
      async: boolean;
      onload: (() => void) | null;
      onerror: (() => void) | null;
    };

    const appended: { current: ScriptStub | null } = { current: null };
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", {
      querySelector: () => null,
      createElement: () => ({ src: "", async: false, onload: null, onerror: null }),
      body: {
        appendChild: (script: ScriptStub) => {
          appended.current = script;
        },
      },
    });

    const promise = loadRazorpayCheckout();
    appended.current?.onerror?.();

    await expect(promise).rejects.toThrow("Payment service couldn't be loaded.");
  });
});
