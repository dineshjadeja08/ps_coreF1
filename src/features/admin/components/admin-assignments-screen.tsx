"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Loader2, Search } from "lucide-react";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingOperations } from "@/features/admin/components/admin-booking-operations";
import { adminApi } from "@/lib/api/endpoints";

export function AdminAssignmentsScreen() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const bookings = useQuery({
    queryKey: ["admin", "bookings", "assignments", search],
    queryFn: () => adminApi.listBookings({ page_size: 50, search: search || undefined }),
  });
  const selected = bookings.data?.results.find((booking) => booking.id === selectedId);

  return (
    <>
      <AdminPageHeader title="Assignments" description="Find a booking, review eligible technicians, and assign, reassign, or remove the technician." />
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search booking, customer or mobile" />
        </div>
      </div>

      {selected ? (
        <section className="mb-5 rounded-xl border border-violet-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Dispatch {selected.booking_number}</h2>
              <p className="text-sm text-slate-500">{selected.customer_name} · {selected.service_date}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId("")}>Close</Button>
          </div>
          <div className="p-5"><AdminBookingOperations booking={selected} onChanged={() => void bookings.refetch()} /></div>
        </section>
      ) : null}

      {bookings.isLoading ? (
        <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div>
      ) : bookings.isError ? (
        <AdminErrorState message={bookings.error.message} onRetry={() => void bookings.refetch()} />
      ) : (
        <AdminDataTable
          rows={bookings.data?.results ?? []}
          getRowKey={(booking) => booking.id}
          emptyIcon={ClipboardList}
          emptyTitle="No bookings to assign"
          emptyMessage="Bookings will appear here as customers place them."
          columns={[
            { key: "booking", header: "Booking", render: (booking) => <span className="font-semibold text-slate-950">{booking.booking_number}</span> },
            { key: "customer", header: "Customer", render: (booking) => <div><p>{booking.customer_name || "Customer"}</p><p className="text-xs text-slate-500">{booking.customer_phone || "-"}</p></div> },
            { key: "date", header: "Date", render: (booking) => booking.service_date },
            { key: "status", header: "Status", render: (booking) => <AdminStatusBadge status={booking.booking_status} /> },
            { key: "action", header: "Action", render: (booking) => <Button type="button" size="sm" variant="outline" onClick={() => setSelectedId(booking.id)}>Dispatch</Button> },
          ]}
        />
      )}
    </>
  );
}
