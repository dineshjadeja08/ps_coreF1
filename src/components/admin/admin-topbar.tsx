"use client";

import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks";
import { adminApi } from "@/lib/api/endpoints";

export function AdminTopbar() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(search.trim()), 300); return () => window.clearTimeout(timer); }, [search]);
  const results = useQuery({ queryKey: ["admin", "global-search", debounced], queryFn: () => adminApi.globalSearch(debounced), enabled: debounced.length >= 2 });
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.phone_number || "Admin";

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
        <div className="ml-auto min-w-0 max-w-[45vw] text-right sm:max-w-none">
          <p className="truncate text-sm font-bold text-slate-950">{name}</p>
          <p className="text-xs text-slate-500">{user?.role?.replace("_", " ")}</p>
        </div>
      </div>
    </header>
  );
}
