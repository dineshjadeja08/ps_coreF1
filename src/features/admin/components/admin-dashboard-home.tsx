"use client";

import { AlertCircle, CalendarCheck, CreditCard, Loader2, Users, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { getAdminDashboardSummary } from "@/lib/api/admin/dashboard";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

export function AdminDashboardHome() {
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboardSummary,
  });

  if (query.isLoading) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
      </div>
    );
  }

  if (query.isError) {
    return <AdminErrorState message={query.error instanceof Error ? query.error.message : "Dashboard unavailable."} onRetry={() => void query.refetch()} />;
  }

  const data = query.data;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Today’s operations snapshot from the current backend APIs."
        action={
          <Button asChild className="bg-violet-700 hover:bg-violet-800">
            <Link href="/admin/bookings">Open bookings</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={Users} label="Leads today" value={data?.leadsToday ?? "API needed"} href="/admin/leads" />
        <AdminMetricCard icon={CalendarCheck} label="Bookings today" value={data?.bookingsToday ?? 0} href="/admin/bookings" />
        <AdminMetricCard icon={CreditCard} label="Payment pending" value={data?.paymentPendingBookings ?? 0} href="/admin/bookings?payment_status=UNPAID" />
        <AdminMetricCard icon={Wrench} label="Unassigned" value={data?.unassignedBookings ?? 0} href="/admin/assignments" />
        <AdminMetricCard icon={CalendarCheck} label="Confirmed" value={data?.confirmedBookings ?? 0} href="/admin/bookings?status=CONFIRMED" />
        <AdminMetricCard icon={CalendarCheck} label="Upcoming services" value={data?.upcomingServices ?? 0} href="/admin/bookings" />
        <AdminMetricCard icon={Users} label="Follow-ups due" value={data?.followUpsDue ?? "API needed"} href="/admin/leads" />
        <AdminMetricCard icon={CreditCard} label="Revenue today" value={data?.revenueToday === null ? "API needed" : money(data?.revenueToday)} href="/admin/payments" />
      </div>

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
          <h2 className="mb-3 text-sm font-bold uppercase text-slate-500">Recent bookings</h2>
          <AdminDataTable
            rows={data?.recentBookings ?? []}
            getRowKey={(booking) => booking.id}
            emptyIcon={CalendarCheck}
            emptyTitle="No bookings yet"
            emptyMessage="Bookings will appear here once customers complete the flow."
            columns={[
              { key: "booking", header: "Booking", render: (booking) => <span className="font-semibold text-slate-950">{booking.booking_number}</span> },
              { key: "service", header: "Service", render: serviceName },
              { key: "date", header: "Date", render: (booking) => booking.service_date },
              { key: "status", header: "Status", render: (booking) => <AdminStatusBadge status={booking.booking_status} /> },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase text-slate-500">Pending payments</h2>
          <AdminDataTable
            rows={data?.pendingPayments ?? []}
            getRowKey={(booking) => booking.id}
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
