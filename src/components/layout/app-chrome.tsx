"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { InstantBookingBanner } from "@/components/layout/instant-booking-banner";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { RouteProgress } from "@/components/layout/route-progress";
import { MobileServiceProceedBar } from "@/features/cart/mobile-service-proceed-bar";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAppStyleRoute = appStyleRoutes.has(pathname ?? "");
  const showServiceProceed = Boolean(pathname?.startsWith("/services/") && !isAppStyleRoute);

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[#f4f5f7]">{children}</main>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <div className={isAppStyleRoute ? "hidden lg:block" : undefined}>
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      {isAppStyleRoute ? null : <InstantBookingBanner />}
      <Footer />
      {showServiceProceed ? <MobileServiceProceedBar /> : null}
      {isAppStyleRoute ? null : <MobileBottomNav />}
    </>
  );
}

const appStyleRoutes = new Set(["/services/water-tank-cleaning"]);
