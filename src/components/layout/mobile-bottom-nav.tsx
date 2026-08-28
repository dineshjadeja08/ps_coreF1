"use client";

import { CalendarCheck, Headphones, Home, LayoutGrid, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const items = [
  { href: routes.home, label: "Home", icon: Home },
  { href: routes.services, label: "Services", icon: LayoutGrid },
  { href: routes.bookings, label: "Bookings", icon: CalendarCheck },
  { href: routes.support, label: "Help", icon: Headphones },
  { href: routes.profile, label: "Profile", icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const hideOnFocusedFlow =
    pathname.startsWith("/book") || pathname.startsWith("/booking-success") || pathname.startsWith("/admin");

  if (hideOnFocusedFlow) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground",
                active && "text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
