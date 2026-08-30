"use client";

import { Search } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks";

export function AdminTopbar() {
  const { user } = useAuth();
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.phone_number || "Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <label className="relative max-w-md flex-1">
          <span className="sr-only">Search admin</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 shadow-none" placeholder="Search bookings, services, customers" />
        </label>
        <div className="ml-auto text-right">
          <p className="text-sm font-bold text-slate-950">{name}</p>
          <p className="text-xs text-slate-500">{user?.role?.replace("_", " ")}</p>
        </div>
      </div>
    </header>
  );
}
