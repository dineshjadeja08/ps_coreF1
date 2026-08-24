import {
  Activity,
  ArrowUpRight,
  BookOpenText,
  CalendarCheck,
  CreditCard,
  ImageIcon,
  LayoutGrid,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UserCog,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Purple Squad operations shortcuts for Django admin.",
};

const backendBaseUrl = env.apiBaseUrl.replace(/\/$/, "");

function backendUrl(path: string) {
  return new URL(path, `${backendBaseUrl}/`).toString();
}

const primaryLinks = [
  {
    title: "Open Django Admin",
    description: "Login with your Django superuser account and manage the full backend.",
    href: backendUrl("/admin/"),
    icon: ShieldCheck,
  },
  {
    title: "API Docs",
    description: "Review the backend API contract and test endpoints from Swagger.",
    href: backendUrl("/api/docs/"),
    icon: BookOpenText,
  },
  {
    title: "Health Check",
    description: "Confirm the backend server is reachable before admin work.",
    href: backendUrl("/api/v1/health/"),
    icon: Activity,
  },
];

const adminSections = [
  {
    title: "Services",
    description: "Manage names, descriptions, active status, prices, advance percentage, and cover image.",
    href: backendUrl("/admin/catalogue/service/"),
    icon: Wrench,
  },
  {
    title: "Categories",
    description: "Manage Home Appliances Repair, Cleaning, and future catalogue groups.",
    href: backendUrl("/admin/catalogue/servicecategory/"),
    icon: LayoutGrid,
  },
  {
    title: "Service Images",
    description: "Upload and reorder gallery images used on service detail pages.",
    href: backendUrl("/admin/catalogue/serviceimage/"),
    icon: ImageIcon,
  },
  {
    title: "Bookings",
    description: "Review customer bookings, status history, notes, totals, and assigned work.",
    href: backendUrl("/admin/bookings/booking/"),
    icon: CalendarCheck,
  },
  {
    title: "Technicians",
    description: "Create technician profiles, track availability, and manage assignments.",
    href: backendUrl("/admin/technicians/technicianprofile/"),
    icon: UserCog,
  },
  {
    title: "Customers",
    description: "Find customer users and linked profile records for support operations.",
    href: backendUrl("/admin/accounts/customerprofile/"),
    icon: UsersRound,
  },
  {
    title: "Payments",
    description: "Check Razorpay order references, payment status, and balance collections.",
    href: backendUrl("/admin/payments/payment/"),
    icon: CreditCard,
  },
  {
    title: "Reviews",
    description: "Moderate completed-booking ratings and customer comments.",
    href: backendUrl("/admin/reviews/review/"),
    icon: Star,
  },
  {
    title: "Service Areas",
    description: "Maintain supported cities, pincodes, and operating areas.",
    href: backendUrl("/admin/locations/servicearea/"),
    icon: MapPin,
  },
];

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-primary">Purple Squad Admin</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold text-foreground sm:text-4xl">Operations dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary sm:text-base">
            Use this page as your frontend entry point into Django admin. The real admin login and permissions still stay on
            the backend.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={backendUrl("/admin/")} target="_blank" rel="noreferrer">
                Open Django Admin
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={backendUrl("/api/docs/")} target="_blank" rel="noreferrer">
                API Docs
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-primary-subtle p-6 sm:p-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Before You Manage Data</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-secondary">
            <p>Make sure the Django backend is running at:</p>
            <p className="break-all rounded-2xl border border-border bg-surface px-4 py-3 font-mono text-xs text-foreground">
              {backendBaseUrl}
            </p>
            <p>After opening Django admin, login with your superuser account. Catalogue changes will reflect in the customer site.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {primaryLinks.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
            </a>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Direct Admin Shortcuts</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">Manage backend records</h2>
        </div>
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <Link href="/">
            Customer Site
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
