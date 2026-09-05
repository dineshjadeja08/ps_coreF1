"use client";

import { CalendarCheck, Home, LayoutGrid, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const items = [
  { href: routes.home, label: "Home", icon: Home },
  { href: routes.services, label: "Categories", icon: LayoutGrid },
  { href: routes.bookings, label: "Bookings", icon: CalendarCheck },
  { href: routes.profile, label: "Account", icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const hideOnFocusedFlow =
    pathname.startsWith("/book") || pathname.startsWith("/booking-success") || pathname.startsWith("/admin");

  if (hideOnFocusedFlow) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[var(--z-mobile-nav)] border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_rgba(24,24,27,0.06)] backdrop-blur md:hidden">
      <div className="grid min-h-[var(--mobile-nav-height)] grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== routes.home && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "touch-target flex flex-col items-center justify-center gap-1 text-xs font-bold text-muted-foreground",
                active && "text-primary",
              )}
            >
              <span className={cn("rounded-sm px-3 py-1", active && "bg-primary-soft")}>
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
