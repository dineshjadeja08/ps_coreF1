"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { adminNavigationSections } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin navigation">
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/60" type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} />
          <nav className="relative flex h-full w-80 max-w-[88vw] flex-col overflow-y-auto bg-slate-950 p-4 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-bold">Purple Squad</p>
                <p className="text-xs text-slate-400">Operations Portal</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-white" onClick={() => setOpen(false)} aria-label="Close admin navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-5 pb-6">
              {adminNavigationSections.map((section) => (
                <section key={section.title}>
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">{section.title}</p>
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-violet-600 text-white" : "text-slate-200 hover:bg-slate-900"}`}
                          onClick={() => setOpen(false)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <Link href="/" className="mt-auto rounded-lg border border-slate-700 px-3 py-3 text-center text-sm font-semibold text-slate-200" onClick={() => setOpen(false)}>Open customer site</Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
