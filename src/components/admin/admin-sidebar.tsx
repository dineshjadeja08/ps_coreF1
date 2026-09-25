"use client";

import {
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileClock,
  Image,
  LayoutDashboard,
  ListChecks,
  MapPin,
  MessageSquareText,
  Package,
  Plus,
  Settings,
  Shield,
  SlidersHorizontal,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminBrand } from "@/components/admin/admin-brand";
import { canAccessAdminPath } from "@/components/admin/admin-access";
import { useAuth } from "@/features/auth/hooks";

export const adminNavigationSections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Leads", href: "/admin/leads", icon: ClipboardList },
      { label: "Create Lead", href: "/admin/leads/create", icon: Plus, child: true },
      { label: "Lead List", href: "/admin/leads", icon: ListChecks, child: true },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Work Orders", href: "/admin/work-orders", icon: ListChecks },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Technicians", href: "/admin/technicians", icon: Wrench },
      { label: "Assignments", href: "/admin/assignments", icon: ListChecks },
      { label: "Service Areas", href: "/admin/service-areas", icon: MapPin },
      { label: "Scheduling", href: "/admin/scheduling", icon: CalendarCheck },
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
  const { user } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white text-slate-950 lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-5 py-5">
          <AdminBrand />
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {adminNavigationSections.map((section) => ({ ...section, items: section.items.filter((item) => canAccessAdminPath(user, item.href)) })).filter((section) => section.items.length).map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-bold uppercase text-slate-400">{section.title}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const child = "child" in item && item.child;
                  const active = pathname === item.href || (!child && pathname.startsWith(`${item.href}/`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${child ? "ml-7 text-xs" : ""} ${
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
      </div>
    </aside>
  );
}
