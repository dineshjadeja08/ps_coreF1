"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin === window.location.origin && destination.href !== window.location.href) setPending(true);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPending(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {pending ? (
        <motion.div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-1 overflow-hidden bg-primary-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.span className="block h-full bg-primary" initial={{ x: "-100%", width: "45%" }} animate={{ x: "220%" }} transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity }} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
