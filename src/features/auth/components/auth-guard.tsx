"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { saveIntendedRoute } from "@/features/auth/storage";
import { useAuth } from "@/features/auth/hooks";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const serviceSlug = searchParams.get("service") ?? undefined;
    saveIntendedRoute({ path, serviceSlug });
    router.replace(`/login?returnTo=${encodeURIComponent(path)}`);
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center px-4 py-12">
        <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Checking your session...
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
