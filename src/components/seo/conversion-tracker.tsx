"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { contactConversion, trackConversion } from "@/lib/conversion-tracking";

export function ConversionTracker() {
  const pathname = usePathname();
  const bookingStarted = useRef(false);
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/technician")) return;
    if (pathname === "/book" && !bookingStarted.current) {
      trackConversion("begin_checkout");
      bookingStarted.current = true;
    } else if (pathname !== "/book" && !pathname.startsWith("/book/")) {
      bookingStarted.current = false;
    }
    function onClick(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      const name = anchor ? contactConversion(anchor.getAttribute("href") ?? "") : null;
      if (name) trackConversion(name);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);
  return null;
}
