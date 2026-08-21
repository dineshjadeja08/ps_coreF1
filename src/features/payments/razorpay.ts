import type { RazorpayCheckout, RazorpayOptions } from "@/features/payments/types";

const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout can only load in a browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${checkoutScriptUrl}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Payment service couldn't be loaded.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = checkoutScriptUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Payment service couldn't be loaded."));
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  if (!window.Razorpay) {
    throw new Error("Payment service couldn't be loaded.");
  }

  const checkout = new window.Razorpay(options);
  checkout.open();
  return checkout;
}
