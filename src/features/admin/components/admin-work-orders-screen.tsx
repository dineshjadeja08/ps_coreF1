"use client";

import { ClipboardCheck, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import { getBookingStepLabel } from "@/features/bookings/components/booking-tracking";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

export function AdminWorkOrdersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin", "work-orders", search, status, page],
    queryFn: () => adminApi.listWorkOrders({ page_size: 25, page, search: search || undefined, status: status || undefined }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  return <>
    <AdminPageHeader title="Work Orders" description="Paid customer jobs ready for assignment, service delivery, completion, and closure." />
    <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px_auto]">
        <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search order, customer or mobile" /></div>
        <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All work order statuses</option>{["CONFIRMED", "TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "TECHNICIAN_ARRIVED", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED", "REFUND_PENDING", "REFUNDED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
        <Button variant="outline" onClick={() => { setSearch(""); setStatus(""); setPage(1); }}>Clear filters</Button>
      </div>
    </div>
    {query.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : query.isError ? <AdminErrorState message={query.error instanceof Error ? query.error.message : "Work orders unavailable."} onRetry={() => void query.refetch()} /> : <AdminDataTable
      rows={query.data?.results ?? []}
      getRowKey={(item) => item.id}
      emptyIcon={ClipboardCheck}
      emptyTitle="No paid work orders"
      emptyMessage="A work order appears here after a customer payment succeeds."
      onRowClick={(item) => router.push(`/admin/work-orders/${item.id}`)}
      columns={[
        { key: "number", header: "Work order", render: (item) => <span className="font-bold text-slate-950">{item.booking_number}</span> },
        { key: "customer", header: "Customer", render: (item) => <div><p className="font-semibold">{item.customer_name}</p><a href={`tel:${item.customer_phone}`} className="text-xs text-violet-700">{item.customer_phone}</a></div> },
        { key: "service", header: "Category / Service", render: (item) => <div><p className="font-semibold">{item.service_category}</p><p className="text-xs text-slate-500">{serviceName(item)} × {item.quantity ?? 1}</p></div> },
        { key: "schedule", header: "Schedule", render: (item) => item.service_date },
        { key: "payment", header: "Payment", render: (item) => item.payment_status === "PAID" ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">✓ Done</span> : <AdminStatusBadge status={item.payment_status} /> },
        { key: "technician", header: "Vendor", render: (item) => item.assigned_technician?.name ?? "Unassigned" },
        { key: "status", header: "Job status / next step", render: (item) => <div className="grid justify-items-start gap-1"><AdminStatusBadge status={item.booking_status} /><span className="text-xs font-semibold text-violet-700">{getBookingStepLabel(item)}</span></div> },
        { key: "action", header: "Action", render: (item) => <Button asChild variant="outline" size="sm"><Link href={`/admin/work-orders/${item.id}`}>View details</Link></Button> },
      ]}
    />}
    {query.data ? <div className="mt-4 flex items-center justify-between text-sm text-slate-600"><span>{query.data.count ? `${(page - 1) * 25 + 1}–${Math.min(page * 25, query.data.count)} of ${query.data.count}` : "0 work orders"}</span><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={!query.data.previous} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button type="button" size="sm" variant="outline" disabled={!query.data.next} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div> : null}
  </>;
}
