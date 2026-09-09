"use client";

import { CircleUserRound, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Brand } from "@/components/layout/brand";
import { LocationCitySelector } from "@/components/layout/location-city-selector";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks";
import { ServiceSearch } from "@/features/catalogue/components/service-search";
import { useServices } from "@/features/catalogue/queries";

import { CartNavLink } from "@/features/cart/cart-controls";

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
      <div className="page-container flex min-h-[5.5rem] items-center gap-2 py-3 lg:gap-6">
        <Brand />

        <nav className="hidden items-center gap-8 text-sm font-medium text-secondary md:flex">
          <Link href={routes.services} className="hover:text-foreground">
            Services
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

        <div className="ml-auto lg:ml-0"><CartNavLink /></div>

        <nav className="hidden items-center gap-3 md:flex">
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
          ) : null}
        </nav>

        {!isAuthenticated ? (
          <Button asChild variant="ghost" className="rounded-md px-2 sm:px-3">
            <Link href="/login" aria-label="Login" className="gap-2">
              <CircleUserRound className="h-5 w-5" />
              <span className="hidden text-sm font-semibold sm:inline">Login</span>
            </Link>
          </Button>
        ) : null}


        {isAuthenticated ? (
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href={routes.profile} aria-label="Open profile">
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3 md:hidden">
        <LocationCitySelector compact className="max-w-[130px] shrink-0" />
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
