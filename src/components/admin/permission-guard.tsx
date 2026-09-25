"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/features/auth/hooks";
import { canAccessAdminPath } from "@/components/admin/admin-access";

const adminRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

export function isAdminUser(user: ReturnType<typeof useAuth>["user"]) {
  return Boolean(user?.is_verified && user?.role && adminRoles.has(user.role));
}

export function PermissionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }
    if (!isAdminUser(user)) {
      router.replace("/");
      return;
    }
    if (!canAccessAdminPath(user, pathname)) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading || !isAuthenticated || !isAdminUser(user) || !canAccessAdminPath(user, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
      </div>
    );
  }

  return children;
}
