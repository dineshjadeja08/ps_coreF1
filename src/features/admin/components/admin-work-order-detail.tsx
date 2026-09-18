"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingOperations } from "@/features/admin/components/admin-booking-operations";
import { adminApi } from "@/lib/api/endpoints";

export function AdminWorkOrderDetail({ workOrderId }: { workOrderId: string }) {
  const [notes, setNotes] = useState("");
  const query = useQuery({ queryKey: ["admin", "work-orders", workOrderId], queryFn: () => adminApi.getWorkOrder(workOrderId) });
  const closeOrder = useMutation({ mutationFn: () => adminApi.closeWorkOrder(workOrderId, notes), onSuccess: () => void query.refetch() });
  if (query.isLoading) return <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div>;
  if (query.isError || !query.data) return <AdminErrorState message={query.error instanceof Error ? query.error.message : "Work order unavailable."} onRetry={() => void query.refetch()} />;
  const item = query.data;
  return <>
    <Button asChild variant="ghost" className="mb-4"><Link href="/admin/work-orders"><ArrowLeft className="h-4 w-4" />Back to work orders</Link></Button>
    <AdminPageHeader title={item.booking_number} description={`${item.customer_name ?? "Customer"} · ${item.customer_phone ?? "No phone"}`} />
    <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs uppercase text-slate-500">Service</p><p className="mt-1 font-bold">{typeof item.service.name === "string" ? item.service.name : "Service"} × {item.quantity ?? 1}</p></div><div><p className="text-xs uppercase text-slate-500">Schedule</p><p className="mt-1 font-bold">{item.service_date}</p></div><div><p className="text-xs uppercase text-slate-500">Payment</p><div className="mt-1"><AdminStatusBadge status={item.payment_status} /></div></div><div><p className="text-xs uppercase text-slate-500">Work status</p><div className="mt-1"><AdminStatusBadge status={item.booking_status} /></div></div><div><p className="text-xs uppercase text-slate-500">Item total</p><p className="mt-1 font-bold">₹{item.subtotal}</p></div><div><p className="text-xs uppercase text-slate-500">Training fee</p><p className="mt-1 font-bold">₹{item.training_fee ?? "0.00"}</p></div><div><p className="text-xs uppercase text-slate-500">Advance paid</p><p className="mt-1 font-bold">₹{item.advance_paid}</p></div><div><p className="text-xs uppercase text-slate-500">Remaining balance</p><p className="mt-1 font-bold">₹{item.balance_due}</p></div></div>
    <section className="rounded-lg border border-slate-200 bg-white p-5"><AdminBookingOperations booking={item} onChanged={() => void query.refetch()} />{item.booking_status === "COMPLETED" ? <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"><h3 className="font-bold">Close work order</h3><Input className="mt-3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Closure notes" /><Button className="mt-3" disabled={closeOrder.isPending} onClick={() => closeOrder.mutate()}>{closeOrder.isPending ? "Closing…" : "Mark closed"}</Button></div> : null}</section>
  </>;
}
