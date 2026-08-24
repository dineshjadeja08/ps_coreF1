"use client";

import { CalendarCheck, LogOut, MapPin, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const displayName = user?.customer_profile?.display_name || user?.first_name || "Profile";

  function submitSearch(event: FormEvent<HTMLFormElement>, value: string) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/services?q=${encodeURIComponent(query)}` : routes.services);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Brand />

        <button className="hidden h-10 items-center gap-2 rounded-xl border border-border bg-primary-subtle px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 md:flex">
          <MapPin className="h-4 w-4 text-primary" />
          Tirupattur
        </button>

        <form onSubmit={(event) => submitSearch(event, desktopSearch)} className="relative hidden flex-1 lg:block">
          <label className="sr-only" htmlFor="desktop-header-search">
            Search services
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="desktop-header-search"
            value={desktopSearch}
            onChange={(event) => setDesktopSearch(event.target.value)}
            className="h-10 bg-background pl-9"
            placeholder="Search for AC repair, cleaning, installation..."
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.bookings}>
              <CalendarCheck className="h-4 w-4" />
              Bookings
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.support}>Help</Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button asChild size="sm">
                <Link href={routes.profile}>
                  <UserRound className="h-4 w-4" />
                  {displayName}
                </Link>
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Logout" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <UserRound className="h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </nav>

        <Button asChild variant="ghost" size="icon" className="ml-auto md:hidden">
          <Link href={isAuthenticated ? routes.profile : "/login"} aria-label={isAuthenticated ? "Open profile" : "Login"}>
            <UserRound className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <button className="flex h-11 items-center gap-2 rounded-xl border border-border bg-primary-subtle px-3 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-primary" />
            Tirupattur
          </button>
          <form onSubmit={(event) => submitSearch(event, mobileSearch)} className="relative min-w-0 flex-1">
            <label className="sr-only" htmlFor="mobile-header-search">
              Search services
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="mobile-header-search"
              value={mobileSearch}
              onChange={(event) => setMobileSearch(event.target.value)}
              className="pl-9"
              placeholder="Search services..."
            />
          </form>
        </div>
      </div>
    </header>
  );
}
