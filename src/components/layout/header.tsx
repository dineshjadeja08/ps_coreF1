"use client";

import { CircleUserRound, LogOut, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Brand } from "@/components/layout/brand";
import { LocationCitySelector } from "@/components/layout/location-city-selector";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks";
import { ServiceSearch } from "@/features/catalogue/components/service-search";
import { useServices } from "@/features/catalogue/queries";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const services = useServices({ page_size: 40 });
  const displayName = user?.customer_profile?.display_name || user?.first_name || "Profile";

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-[#e8e8e8] bg-white/95 backdrop-blur">
      <div className="page-container flex min-h-[5.5rem] items-center gap-6 py-3">
        <Brand />

        <nav className="hidden items-center gap-8 text-sm font-medium text-secondary md:flex">
          <Link href={routes.services} className="hover:text-foreground">
            Homes
          </Link>
          <Link href={`${routes.search}?q=${encodeURIComponent("Appliance Repair")}`} className="hover:text-foreground">
            Appliance
          </Link>
          <Link href={`${routes.search}?q=${encodeURIComponent("Cleaning")}`} className="hover:text-foreground">
            Cleaning
          </Link>
        </nav>

        <div className="ml-auto hidden flex-1 items-center justify-end gap-2 lg:flex">
          <LocationCitySelector compact className="w-[265px]" />

          <ServiceSearch
            services={services.data?.results ?? []}
            className="w-[276px]"
            compact
            inputId="desktop-header-search"
            placeholder="Search for AC service"
          />
        </div>

        <nav className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" size="icon" className="rounded-md border-[#e5e5e5]">
            <Link href={routes.bookings} aria-label="Bookings">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="icon" className="rounded-md" title={displayName}>
                <Link href={routes.profile} aria-label="Profile">
                  <CircleUserRound className="h-5 w-5" />
                </Link>
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Logout" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="icon" className="rounded-md">
              <Link href="/login" aria-label="Login">
                <CircleUserRound className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </nav>

        <LocationCitySelector compact className="ml-auto max-w-[145px] md:hidden" />

        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href={isAuthenticated ? routes.profile : "/login"} aria-label={isAuthenticated ? "Open profile" : "Login"}>
            <UserRound className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
        <ServiceSearch
          services={services.data?.results ?? []}
          className="mx-auto max-w-7xl"
          compact
          inputId="mobile-header-search"
          placeholder="Search home services"
        />
      </div>
    </header>
  );
}
