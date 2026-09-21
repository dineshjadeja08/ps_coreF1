"use client";

import { ChevronDown, LogOut, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks";
import { adminApi } from "@/lib/api/endpoints";

export function AdminTopbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(search.trim()), 300); return () => window.clearTimeout(timer); }, [search]);
  const results = useQuery({ queryKey: ["admin", "global-search", debounced], queryFn: () => adminApi.globalSearch(debounced), enabled: debounced.length >= 2 });
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.phone_number || "Admin";

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4 lg:px-8">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <AdminMobileNav />
        <div className="relative order-3 w-full sm:order-none sm:max-w-md sm:flex-1">
          <label htmlFor="admin-global-search" className="sr-only">Search admin</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input id="admin-global-search" value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 shadow-none" placeholder="Search work orders, leads, customers" />
          {debounced.length >= 2 ? <div className="absolute inset-x-0 top-12 z-50 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
            {results.isFetching ? <p className="p-3 text-sm text-slate-500">Searching…</p> : results.data?.results.length ? results.data.results.map((result) => <Link key={`${result.type}-${result.id}`} href={result.url} onClick={() => setSearch("")} className="block rounded-md p-3 hover:bg-slate-50"><span className="block text-sm font-bold text-slate-950">{result.title}</span><span className="mt-0.5 block text-xs text-slate-500">{result.subtitle}</span></Link>) : <p className="p-3 text-sm text-slate-500">No results found.</p>}
          </div> : null}
        </div>
        <details className="group relative ml-auto min-w-0 max-w-[55vw] sm:max-w-none">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-black text-violet-800">{name.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-950">{name}</span><span className="block text-[11px] text-slate-500">{user?.role?.replace("_", " ")}</span></span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
          </summary>
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" />Logout</button>
          </div>
        </details>
      </div>
    </header>
  );
}
