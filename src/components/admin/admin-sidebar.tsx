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
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Technicians", href: "/admin/technicians", icon: Wrench },
      { label: "Assignments", href: "/admin/assignments", icon: ListChecks },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Categories", href: "/admin/catalogue/categories", icon: BookOpen },
      { label: "Services", href: "/admin/catalogue/services", icon: Package },
      { label: "Packages", href: "/admin/catalogue/packages", icon: SlidersHorizontal },
      { label: "FAQs", href: "/admin/catalogue/faqs", icon: MessageSquareText },
    ],
  },
  {
    title: "Website",
    items: [
      { label: "Homepage Banners", href: "/admin/content/banners", icon: Image },
      { label: "Carousel", href: "/admin/content/carousel", icon: Image },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Reports", href: "/admin/reports", icon: FileBarChart },
      { label: "Staff and Roles", href: "/admin/staff", icon: Shield },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: FileClock },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
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
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white text-slate-950 lg:sticky lg:top-0 lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-5 py-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">PS</span>
            <span>
              <span className="block text-sm font-bold">Purple Squad</span>
              <span className="block text-xs text-slate-500">Operations Portal</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-bold uppercase text-slate-400">{section.title}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <Button asChild type="button" variant="ghost" className="mt-2 w-full text-slate-600">
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
