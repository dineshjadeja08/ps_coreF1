"use client";

import { ClipboardCheck, Loader2, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingOperations } from "@/features/admin/components/admin-booking-operations";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

export function AdminWorkOrdersScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const query = useQuery({ queryKey: ["admin", "work-orders", search, status], queryFn: () => adminApi.listWorkOrders({ page_size: 50, search: search || undefined, status: status || undefined }) });
  const selected = query.data?.results.find((item) => item.id === selectedId);
  const closeOrder = useMutation({ mutationFn: () => adminApi.closeWorkOrder(selectedId, closeNotes), onSuccess: async () => { setSelectedId(""); setCloseNotes(""); await queryClient.invalidateQueries({ queryKey: ["admin", "work-orders"] }); } });

  return <>
    <AdminPageHeader title="Work Orders" description="Paid customer jobs ready for assignment, service delivery, completion, and closure." />
    <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
      <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer or mobile" /></div>
      <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All work order statuses</option>{["CONFIRMED", "TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED", "REFUND_PENDING", "REFUNDED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
      <Button variant="outline" onClick={() => { setSearch(""); setStatus(""); }}>Clear</Button>
    </div>
    {selected ? <section className="mb-5 rounded-xl border border-violet-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><h2 className="font-bold">{selected.booking_number}</h2><p className="text-sm text-slate-500">{selected.customer_name} · {selected.customer_phone}</p></div><Button variant="ghost" size="sm" onClick={() => setSelectedId("")}>Close panel</Button></div><div className="p-5"><AdminBookingOperations booking={selected} onChanged={() => void query.refetch()} />{selected.booking_status === "COMPLETED" ? <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"><h3 className="font-bold">Close work order</h3><Input className="mt-3" value={closeNotes} onChange={(event) => setCloseNotes(event.target.value)} placeholder="Closure notes" /><Button className="mt-3" disabled={closeOrder.isPending} onClick={() => closeOrder.mutate()}>{closeOrder.isPending ? "Closing…" : "Mark closed"}</Button></div> : null}</div></section> : null}
    {query.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : query.isError ? <AdminErrorState message={query.error instanceof Error ? query.error.message : "Work orders unavailable."} onRetry={() => void query.refetch()} /> : <AdminDataTable rows={query.data?.results ?? []} getRowKey={(item) => item.id} emptyIcon={ClipboardCheck} emptyTitle="No paid work orders" emptyMessage="A work order appears here after an advance payment succeeds." columns={[
      { key: "number", header: "Work order", render: (item) => <span className="font-bold text-slate-950">{item.booking_number}</span> },
      { key: "customer", header: "Customer", render: (item) => <div><p className="font-semibold">{item.customer_name}</p><a href={`tel:${item.customer_phone}`} className="text-xs text-violet-700">{item.customer_phone}</a></div> },
      { key: "service", header: "Category / Service", render: (item) => <div><p className="font-semibold">{item.service_category}</p><p className="text-xs text-slate-500">{serviceName(item)} × {item.quantity ?? 1}</p></div> },
      { key: "schedule", header: "Schedule", render: (item) => item.service_date },
      { key: "paid", header: "Paid at", render: (item) => item.paid_at ? new Date(item.paid_at).toLocaleString("en-IN") : "Paid" },
      { key: "technician", header: "Technician", render: (item) => item.assigned_technician?.name ?? "Unassigned" },
      { key: "status", header: "Status", render: (item) => <AdminStatusBadge status={item.booking_status} /> },
      { key: "action", header: "Action", render: (item) => <Button variant="outline" size="sm" onClick={() => setSelectedId(item.id)}>Manage</Button> },
    ]} />}
  </>;
}
