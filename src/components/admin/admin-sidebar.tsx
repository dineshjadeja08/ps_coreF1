"use client";

import {
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileClock,
  Home,
  Image,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquareText,
  Package,
  Settings,
  Shield,
  SlidersHorizontal,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks";

const sections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Leads", href: "/admin/leads", icon: ClipboardList },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Payments", href: "/admin/payments", icon: CreditCard, badge: "Refunds next" },
      { label: "Technicians", href: "/admin/technicians", icon: Wrench },
      { label: "Assignments", href: "/admin/assignments", icon: ListChecks },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Reviews", href: "/admin/reviews", icon: Star, badge: "API needed" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Categories", href: "/admin/catalogue/categories", icon: BookOpen },
      { label: "Services", href: "/admin/catalogue/services", icon: Package },
      { label: "Packages", href: "/admin/catalogue/packages", icon: SlidersHorizontal, badge: "Model needed" },
      { label: "FAQs", href: "/admin/catalogue/faqs", icon: MessageSquareText, badge: "API needed" },
    ],
  },
  {
    title: "Website",
    items: [
      { label: "Homepage Banners", href: "/admin/content/banners", icon: Image, badge: "API needed" },
      { label: "Carousel", href: "/admin/content/carousel", icon: Image, badge: "API needed" },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Reports", href: "/admin/reports", icon: FileBarChart, badge: "API needed" },
      { label: "Staff and Roles", href: "/admin/staff", icon: Shield, badge: "API needed" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: FileClock, badge: "API needed" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings, badge: "API needed" }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-white lg:sticky lg:top-0 lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-800 px-5 py-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-sm font-black">PS</span>
            <span>
              <span className="block text-sm font-bold">Purple Squad</span>
              <span className="block text-xs text-slate-400">Operations Portal</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-bold uppercase text-slate-500">{section.title}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        active ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">{item.badge}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <Button type="button" variant="outline" className="w-full border-slate-700 bg-slate-900 text-white hover:bg-slate-800" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <Button asChild type="button" variant="ghost" className="mt-2 w-full text-slate-300 hover:bg-slate-900 hover:text-white">
            <Link href="/">
              <Home className="h-4 w-4" />
              Customer site
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
