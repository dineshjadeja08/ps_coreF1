"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { PermissionGuard } from "@/components/admin/permission-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <PermissionGuard>
      <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-slate-50">
        <AdminSidebar />
        <div className="min-w-0 max-w-full flex-1">
          <AdminTopbar />
          <div className="min-w-0 max-w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">{children}</div>
        </div>
      </div>
    </PermissionGuard>
  );
}
