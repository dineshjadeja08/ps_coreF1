"use client";

import { CalendarCheck, Download, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingOperations } from "@/features/admin/components/admin-booking-operations";
import { adminApi } from "@/lib/api/endpoints";
import { apiPaths } from "@/lib/api/endpoints";
import { downloadAuthenticatedFile } from "@/lib/api/client";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

export function AdminBookingsScreen() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const query = useQuery({
    queryKey: ["admin", "bookings", search, status],
    queryFn: () => adminApi.listBookings({ page_size: 25, search: search || undefined, status: status || undefined }),
  });
  const selected = query.data?.results.find((booking) => booking.id === selectedId);

  return (
    <>
      <AdminPageHeader title="Bookings" description="See who booked, their contact number, service, payment, and operational status." />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search booking number, customer or mobile" />
        </div>
        <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All booking statuses</option>
          {["PENDING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED", "TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUND_PENDING", "REFUNDED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
        <Button type="button" variant="outline" onClick={() => { setSearch(""); setStatus(""); }}>Clear</Button>
      </div>
      {selected ? (
        <section className="mb-5 rounded-xl border border-violet-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div><h2 className="font-bold text-slate-950">{selected.booking_number}</h2><p className="text-sm text-slate-500">{selected.customer_name} · {selected.customer_phone}</p></div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId("")}>Close</Button>
          </div>
          <div className="p-5"><AdminBookingOperations booking={selected} onChanged={() => void query.refetch()} /></div>
        </section>
      ) : null}
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
            { key: "booking_status", header: "Booking status", render: (booking) => <AdminStatusBadge status={booking.booking_status} /> },
            { key: "payment_status", header: "Payment", render: (booking) => <AdminStatusBadge status={booking.payment_status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (booking) => {
                const canDownloadInvoice = booking.payment_status === "PAID" || booking.booking_status === "COMPLETED";
                return (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId(booking.id)}>Manage</Button>
                    {canDownloadInvoice ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void downloadAuthenticatedFile(apiPaths.adminBookingInvoice(booking.id), `invoice-${booking.booking_number}.pdf`)}
                      >
                        <Download className="h-4 w-4" />
                        Invoice
                      </Button>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </>
  );
}
