"use client";

import { AlertCircle, CalendarCheck, CheckCircle2, CreditCard, Loader2, Users, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { AdminBookingDrawer } from "@/features/admin/components/admin-booking-drawer";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { getAdminDashboardSummary } from "@/lib/api/admin/dashboard";
import { getBookingStepLabel } from "@/features/bookings/components/booking-tracking";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

export function AdminDashboardHome() {
  const [selectedId, setSelectedId] = useState("");
  const [bookingView, setBookingView] = useState<"recent" | "active">("recent");
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboardSummary,
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
    gcTime: 5 * 60_000,
  });

  if (query.isLoading) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
      </div>
    );
  }

  if (query.isError && !query.data) {
    return <AdminErrorState message={query.error instanceof Error ? query.error.message : "Dashboard unavailable."} onRetry={() => void query.refetch()} />;
  }

  const data = query.data;

  return (
    <>
      {selectedId ? <AdminBookingDrawer key={selectedId} bookingId={selectedId} onClose={() => setSelectedId("")} /> : null}
      <AdminPageHeader
        title="Dashboard"
        description={`Today’s operations snapshot · Live updates every 30 seconds${query.dataUpdatedAt ? ` · Updated ${new Date(query.dataUpdatedAt).toLocaleTimeString("en-IN")}` : ""}`}
        action={
          <Button asChild className="bg-violet-700 hover:bg-violet-800">
            <Link href="/admin/bookings">Open bookings</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={CalendarCheck} label="Total bookings" value={data?.totalBookings ?? 0} href="/admin/bookings" />
        <AdminMetricCard icon={CalendarCheck} label="Bookings this month" value={data?.bookingsThisMonth ?? 0} href="/admin/bookings" />
        <AdminMetricCard icon={CheckCircle2} label="Completed jobs" value={data?.completedJobs ?? 0} href="/admin/bookings?status=COMPLETED" />
        <AdminMetricCard icon={Wrench} label="Active technicians" value={data?.activeTechnicians ?? 0} href="/admin/technicians" />
        <AdminMetricCard icon={CreditCard} label="Revenue today" value={money(data?.totalRevenue)} href="/admin/payments" />
        <AdminMetricCard icon={Users} label="Leads today" value={data?.leadsToday ?? 0} href="/admin/leads" />
        <AdminMetricCard icon={CalendarCheck} label="Bookings today" value={data?.bookingsToday ?? 0} href="/admin/bookings" />
        <AdminMetricCard icon={CreditCard} label="Payment pending" value={data?.paymentPendingBookings ?? 0} href="/admin/bookings?payment_status=UNPAID" />
        <AdminMetricCard icon={Wrench} label="Unassigned" value={data?.unassignedBookings ?? 0} href="/admin/assignments" />
        <AdminMetricCard icon={CalendarCheck} label="Confirmed" value={data?.confirmedBookings ?? 0} href="/admin/bookings?status=CONFIRMED" />
        <AdminMetricCard icon={CalendarCheck} label="Upcoming services" value={data?.upcomingServices ?? 0} href="/admin/bookings" />
        <AdminMetricCard icon={Users} label="Follow-ups due" value={data?.followUpsDue ?? 0} href="/admin/leads" />
      </div>

      <section aria-labelledby="admin-needs-attention" className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="admin-needs-attention" className="text-base font-bold text-slate-950">Needs attention</h2>
            <p className="mt-1 text-sm text-slate-600">A short list of items that may need an admin follow-up.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Live snapshot</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Unassigned bookings", value: data?.unassignedBookings ?? 0, href: "/admin/assignments", hint: "Review vendor assignment" },
            { label: "Payments pending", value: data?.paymentPendingBookings ?? 0, href: "/admin/bookings", hint: "Check booking payments" },
            { label: "Lead follow-ups due", value: data?.followUpsDue ?? 0, href: "/admin/leads", hint: "Contact customers" },
            { label: "Failed notifications", value: data?.failedNotifications ?? 0, href: "/admin/notifications", hint: "Review delivery status" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-white p-3 transition hover:border-amber-400 hover:shadow-sm ${item.value > 0 ? "border-amber-200" : "border-slate-200"}`}>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{item.label}</span><span className="mt-1 block text-xs text-slate-500">{item.value > 0 ? item.hint : "Nothing pending"}</span></span>
              <span className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-full px-2 text-sm font-bold ${item.value > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>{item.value}</span>
            </Link>
          ))}
        </div>
      </section>

      {data?.missing.length ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <h2 className="text-sm font-bold text-amber-950">Backend endpoints still needed</h2>
              <p className="mt-1 text-sm text-amber-800">{data.missing.join(", ")}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-bold uppercase text-slate-500">{bookingView === "active" ? "Active now" : "Recent bookings"}</h2><div className="flex gap-2" aria-label="Dashboard booking filter"><Button type="button" size="sm" variant={bookingView === "recent" ? "default" : "outline"} onClick={() => setBookingView("recent")}>Recent</Button><Button type="button" size="sm" variant={bookingView === "active" ? "default" : "outline"} onClick={() => setBookingView("active")}>Active now</Button></div></div>
          <AdminDataTable
            rows={bookingView === "active" ? data?.activeNowBookings ?? [] : data?.recentBookings ?? []}
            getRowKey={(booking) => booking.id}
            onRowClick={(booking) => setSelectedId(booking.id)}
            emptyIcon={CalendarCheck}
            emptyTitle={bookingView === "active" ? "No active jobs" : "No bookings yet"}
            emptyMessage={bookingView === "active" ? "Assigned, en-route, and in-progress bookings will appear here." : "Bookings will appear here once customers complete the flow."}
            columns={[
              { key: "booking", header: "Booking", render: (booking) => <span className="font-semibold text-slate-950">{booking.booking_number}</span> },
              { key: "service", header: "Service", render: serviceName },
              { key: "date", header: "Date", render: (booking) => booking.service_date },
              { key: "status", header: bookingView === "active" ? "Current step" : "Status", render: (booking) => <div><AdminStatusBadge status={booking.booking_status} />{bookingView === "active" ? <p className="mt-1 text-xs font-semibold text-violet-700">{getBookingStepLabel(booking)}</p> : null}</div> },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase text-slate-500">Pending payments</h2>
          <AdminDataTable
            rows={data?.pendingPayments ?? []}
            getRowKey={(booking) => booking.id}
            onRowClick={(booking) => setSelectedId(booking.id)}
            emptyIcon={CreditCard}
            emptyTitle="No pending payments"
            emptyMessage="Advance payment pending bookings will appear here."
            columns={[
              { key: "booking", header: "Booking", render: (booking) => <span className="font-semibold text-slate-950">{booking.booking_number}</span> },
              { key: "service", header: "Service", render: serviceName },
              { key: "amount", header: "Amount", render: (booking) => money(booking.total_amount) },
              { key: "payment", header: "Payment", render: (booking) => <AdminStatusBadge status={booking.payment_status} /> },
            ]}
          />
        </section>
      </div>
    </>
  );
}
