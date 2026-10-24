"use client";

import { ArrowLeft, Check, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingOperations } from "@/features/admin/components/admin-booking-operations";
import { AdminWorkOrderVendors } from "@/features/admin/components/admin-work-order-vendors";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking } from "@/types/api";

const stages = ["Start", "In progress", "Completed"];

function getStage(booking: Booking) {
  if (["COMPLETED", "CLOSED"].includes(booking.booking_status)) return 2;
  if (booking.booking_status === "IN_PROGRESS") return 1;
  if (["TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "TECHNICIAN_ARRIVED"].includes(booking.booking_status)) return 0;
  return -1;
}

function addressText(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return "Address unavailable";
  const address = snapshot as Record<string, unknown>;
  return [address.address_line_1, address.address_line_2, address.landmark, address.locality, address.city, address.state, address.postal_code]
    .filter((part): part is string | number => typeof part === "string" || typeof part === "number")
    .map(String)
    .filter(Boolean)
    .join(", ") || "Address unavailable";
}

function addressLocation(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return "-";
  const address = snapshot as Record<string, unknown>;
  return [address.locality || address.area || address.neighborhood, address.city]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(", ") || "-";
}

function JobProgress({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const activeStage = getStage(booking);
  const canStart = Boolean(booking.assigned_technician) && ["TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "TECHNICIAN_ARRIVED"].includes(booking.booking_status);
  const canComplete = booking.booking_status === "IN_PROGRESS";
  const selectedStatus = activeStage === 2 ? "COMPLETED" : activeStage === 1 ? "IN_PROGRESS" : "START";
  const updateStatus = useMutation({
    mutationFn: (nextStatus: "IN_PROGRESS" | "COMPLETED") => nextStatus === "IN_PROGRESS"
      ? adminApi.startBooking(booking.id, { notes: "Manually marked in progress by admin." })
      : adminApi.completeBooking(booking.id, { notes: "Manually marked completed by admin." }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "work-orders"] });
      onChanged();
    },
  });
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold text-slate-950">Job tracking</h2><p className="mt-1 text-sm text-slate-500">Track the work order from start through completion.</p></div><AdminStatusBadge status={booking.booking_status} /></div>
    <ol className="mt-5 grid gap-3 sm:grid-cols-3">
      {stages.map((stage, index) => {
        const done = activeStage > index || (activeStage === index && index === 2);
        const current = activeStage === index;
        return <li key={stage} className={`flex items-center gap-3 rounded-lg border p-3 ${done ? "border-emerald-200 bg-emerald-50" : current ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-slate-50"}`}>
          <span className={done ? "text-emerald-700" : current ? "text-violet-700" : "text-slate-400"}>{done ? <CheckCircle2 className="h-5 w-5" /> : <span className="grid h-5 w-5 place-items-center rounded-full border text-xs font-bold">{index + 1}</span>}</span>
          <span className={`text-sm font-bold ${done ? "text-emerald-900" : current ? "text-violet-900" : "text-slate-500"}`}>{stage}{current ? " · Current" : ""}</span>
          {done ? <Check className="ml-auto h-4 w-4 text-emerald-700" /> : null}
        </li>;
      })}
    </ol>
    {activeStage < 0 ? <p className="mt-3 text-sm text-amber-700">Assign an available vendor before starting this job.</p> : null}
    {activeStage >= 0 && activeStage < 2 ? <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
      <label htmlFor="work-order-job-status" className="mr-auto text-sm font-medium text-slate-700">Update job status</label>
      {canComplete ? <Button type="button" disabled={updateStatus.isPending} onClick={() => { if (window.confirm(`Manually mark ${booking.booking_number} as completed? Confirm the work is finished and the balance is collected.`)) updateStatus.mutate("COMPLETED"); }}>Mark completed manually</Button> : null}
      <div className="relative">
        {updateStatus.isPending ? <Loader2 className="pointer-events-none absolute right-3 top-3 h-4 w-4 animate-spin text-violet-700" /> : null}
        <select
          id="work-order-job-status"
          className="h-11 min-w-52 rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-800 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:cursor-wait disabled:opacity-60"
          value={selectedStatus}
          disabled={updateStatus.isPending}
          onChange={(event) => {
            const nextStatus = event.target.value;
            if (nextStatus === "IN_PROGRESS" && canStart && window.confirm(`Mark ${booking.booking_number} as in progress?`)) updateStatus.mutate("IN_PROGRESS");
            if (nextStatus === "COMPLETED" && canComplete && window.confirm(`Mark ${booking.booking_number} as completed? Confirm that the work is finished.`)) updateStatus.mutate("COMPLETED");
          }}
        >
          <option value="START" disabled={activeStage > 0}>Start</option>
          <option value="IN_PROGRESS" disabled={!canStart}>In progress</option>
          <option value="COMPLETED" disabled={!canComplete}>Completed</option>
        </select>
      </div>
    </div> : null}
    {updateStatus.isError ? <p role="alert" className="mt-3 text-sm font-medium text-red-700">{updateStatus.error.message}</p> : null}
  </section>;
}

export function AdminWorkOrderDetail({ workOrderId }: { workOrderId: string }) {
  const [notes, setNotes] = useState("");
  const query = useQuery({ queryKey: ["admin", "work-orders", workOrderId], queryFn: () => adminApi.getWorkOrder(workOrderId) });
  const closeOrder = useMutation({ mutationFn: () => adminApi.closeWorkOrder(workOrderId, notes), onSuccess: () => void query.refetch() });
  if (query.isLoading) return <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div>;
  if (query.isError || !query.data) return <AdminErrorState message={query.error instanceof Error ? query.error.message : "Work order unavailable."} onRetry={() => void query.refetch()} />;
  const item = query.data;
  const serviceName = typeof item.service.name === "string" ? item.service.name : "Service";

  return <div className="space-y-5">
    <Button asChild variant="ghost"><Link href="/admin/work-orders"><ArrowLeft className="h-4 w-4" />Back to work orders</Link></Button>
    <AdminPageHeader title={item.booking_number} description={`${item.customer_name ?? "Customer"} · ${item.customer_phone ?? "No phone"}`} />

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">{item.service_category || "Service"}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{serviceName} × {item.quantity ?? 1}</h2></div>
        {item.payment_status === "PAID" ? <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Payment: Done</span> : <AdminStatusBadge status={item.payment_status} />}
      </div>
      <dl className="mt-4 overflow-hidden rounded-lg border border-slate-200 divide-y divide-slate-200">
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Customer</dt><dd className="text-sm text-slate-600">{item.customer_name || "Customer"}</dd></div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Mobile number</dt><dd className="text-sm"><a className="text-violet-700 hover:underline" href={`tel:${item.customer_phone}`}>{item.customer_phone || "Not provided"}</a></dd></div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Location</dt><dd className="text-sm text-slate-600">{addressLocation(item.address_snapshot)}</dd></div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Assigned Location</dt><dd className="text-sm text-slate-600">{item.assigned_technician?.city?.trim() || "NA"}</dd></div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Payment status</dt><dd className="text-sm">{item.payment_status === "PAID" ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">✓ Done</span> : <AdminStatusBadge status={item.payment_status} />}</dd></div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Scheduled visit</dt><dd className="text-sm text-slate-600">{item.service_date} · {String(item.time_slot.start_time ?? "").slice(0, 5)}–{String(item.time_slot.end_time ?? "").slice(0, 5)}</dd></div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Service address</dt><dd className="text-sm leading-6 text-slate-600">{addressText(item.address_snapshot)}</dd></div>
        {item.problem_description ? <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-3"><dt className="text-sm font-semibold text-slate-900">Job details</dt><dd className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.problem_description}</dd></div> : null}
      </dl>
      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Money label="Service total" amount={item.subtotal} />
        <Money label="Training fee" amount={item.training_fee ?? "0.00"} />
        <Money label="Advance paid" amount={item.advance_paid} />
        <Money label="Remaining balance" amount={item.balance_due} />
      </div>
    </section>

    <AdminWorkOrderVendors booking={item} onChanged={() => void query.refetch()} />
    <JobProgress booking={item} onChanged={() => void query.refetch()} />

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <AdminBookingOperations booking={item} onChanged={() => void query.refetch()} showAssignment={false} showJourney={false} showHistory={false} showOperations={false} showStatusActions={false} showBalanceCollection={false} />
      {item.booking_status === "COMPLETED" ? <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"><h3 className="font-bold">Close work order</h3><Input className="mt-3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Closure notes" /><Button className="mt-3" disabled={closeOrder.isPending} onClick={() => { if (window.confirm(`Close work order ${item.booking_number}?`)) closeOrder.mutate(); }}>{closeOrder.isPending ? "Closing…" : "Mark closed"}</Button>{closeOrder.isError ? <p role="alert" className="mt-2 text-sm text-red-700">{closeOrder.error.message}</p> : null}</div> : null}
    </section>
  </div>;
}

function Money({ label, amount }: { label: string; amount: string }) {
  return <div><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">₹{amount}</p></div>;
}
