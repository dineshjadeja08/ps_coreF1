"use client";

import { BriefcaseBusiness, CalendarCheck, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Brand } from "@/components/layout/brand";
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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Brand />

        <ServiceSearch
          services={services.data?.results ?? []}
          className="hidden max-w-xl flex-1 lg:block"
          compact
          inputId="desktop-header-search"
          placeholder="Search services"
        />

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.services}>Services</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.bookings}>
              <CalendarCheck className="h-4 w-4" />
              Bookings
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.support}>Help</Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={routes.book} aria-label="Open booking">
              <BriefcaseBusiness className="h-4 w-4" />
            </Link>
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
        <ServiceSearch
          services={services.data?.results ?? []}
          className="mx-auto max-w-7xl"
          compact
          inputId="mobile-header-search"
          placeholder="Search services"
        />
      </div>
    </header>
  );
}
