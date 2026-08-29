"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const links = [
  ["Dashboard", "/admin/dashboard"],
  ["Leads", "/admin/leads"],
  ["Bookings", "/admin/bookings"],
  ["Technicians", "/admin/technicians"],
  ["Assignments", "/admin/assignments"],
  ["Services", "/admin/catalogue/services"],
  ["Categories", "/admin/catalogue/categories"],
  ["Banners", "/admin/content/banners"],
  ["Reports", "/admin/reports"],
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin navigation">
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/60" type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} />
          <nav className="relative h-full w-80 max-w-[85vw] overflow-y-auto bg-slate-950 p-4 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-bold">Purple Squad</p>
                <p className="text-xs text-slate-400">Operations Portal</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-white" onClick={() => setOpen(false)} aria-label="Close admin navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              {links.map(([label, href]) => (
                <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
