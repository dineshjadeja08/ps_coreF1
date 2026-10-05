"use client";

import { CalendarCheck, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingDrawer } from "@/features/admin/components/admin-booking-drawer";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

export function AdminBookingsScreen() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin", "bookings", search, status, page],
    queryFn: () => adminApi.listBookings({ page, page_size: 25, search: search || undefined, status: status || undefined }),
  });

  return (
    <>
      <AdminPageHeader title="Bookings" description="Tap a booking row to view details, manage it, or check its activity." />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search booking number, customer or mobile" />
        </div>
        <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">All booking statuses</option>
          {["PENDING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED", "TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED", "REFUND_PENDING", "REFUNDED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
        <Button type="button" variant="outline" onClick={() => { setSearch(""); setStatus(""); setPage(1); }}>Clear</Button>
      </div>
      {selectedId ? <AdminBookingDrawer key={selectedId} bookingId={selectedId} onClose={() => setSelectedId("")} /> : null}
      {query.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : query.isError ? (
        <AdminErrorState message={query.error instanceof Error ? query.error.message : "Bookings unavailable."} onRetry={() => void query.refetch()} />
      ) : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(booking) => booking.id}
          onRowClick={(booking) => setSelectedId(booking.id)}
          emptyIcon={CalendarCheck}
          emptyTitle="No bookings found"
          emptyMessage="Customer bookings will appear here."
          columns={[
            { key: "booking", header: "Booking", render: (booking) => <span className="font-semibold text-slate-950">{booking.booking_number}</span> },
            {
              key: "customer",
              header: "Customer",
              render: (booking) => (
                <div className="grid gap-0.5">
                  <span className="font-semibold text-slate-950">{booking.customer_name || "Customer"}</span>
                  {booking.customer_phone ? (
                    <a className="text-xs font-semibold text-violet-700 hover:underline" href={`tel:${booking.customer_phone}`}>
                      {booking.customer_phone}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No phone available</span>
                  )}
                </div>
              ),
            },
            { key: "service", header: "Service", render: serviceName },
            { key: "date", header: "Date", render: (booking) => booking.service_date },
            { key: "status", header: "Status / payment", render: (booking) => <div className="grid justify-items-start gap-1"><AdminStatusBadge status={booking.booking_status} /><AdminStatusBadge status={booking.payment_status} /></div> },
          ]}
        />
      )}
      <AdminPagination count={query.data?.count ?? 0} page={page} pageSize={25} hasNext={Boolean(query.data?.next)} hasPrevious={Boolean(query.data?.previous)} onPageChange={setPage} />
    </>
  );
}
