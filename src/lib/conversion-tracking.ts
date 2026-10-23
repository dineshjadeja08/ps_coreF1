export const analyticsDestination = "G-MKP0Z20TV5";
type EventName = "phone_click" | "whatsapp_click" | "begin_checkout" | "booking_created";
const emitted = new Set<string>();

// Never include addresses, phone numbers, names, notes or URL query strings.
// Analytics failures must never interrupt a booking or contact action.
export function trackConversion(name: EventName, onceKey?: string) {
  if (typeof window === "undefined") return;
  const key = onceKey ? `${name}:${onceKey}` : undefined;
  try {
    if (key && (emitted.has(key) || window.sessionStorage.getItem(`ps-analytics:${key}`))) return;
    const analyticsWindow = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (!analyticsWindow.gtag) return;
    analyticsWindow.gtag("event", name, { send_to: analyticsDestination });
    if (key) {
      emitted.add(key);
      window.sessionStorage.setItem(`ps-analytics:${key}`, "1");
    }
  } catch { /* Measurement is optional; core user actions are not. */ }
}

export function contactConversion(href: string): "phone_click" | "whatsapp_click" | null {
  if (/^tel:/i.test(href)) return "phone_click";
  try {
    const url = new URL(href);
    if (url.protocol === "https:" && ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) return "whatsapp_click";
  } catch { /* Non-contact or relative links. */ }
  return null;
}
