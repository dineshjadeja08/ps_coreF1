"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking, UUID } from "@/types/api";

const inputClass = "h-11 rounded-md border border-slate-200 bg-white px-3 text-sm";

export function AdminBookingOperations({ booking, onChanged, showHistory = true }: { booking: Booking; onChanged?: () => void; showHistory?: boolean }) {
  const queryClient = useQueryClient();
  const [technicianId, setTechnicianId] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [balanceAmount, setBalanceAmount] = useState(booking.balance_due);
  const [balanceMethod, setBalanceMethod] = useState<"CASH" | "UPI" | "CARD_OFFLINE" | "OTHER">("CASH");
  const [message, setMessage] = useState("");
  const technicians = useQuery({
    queryKey: ["admin", "technicians", "eligible", booking.id],
    queryFn: () => adminApi.listTechnicians({ booking_id: booking.id, include_ineligible: true }),
  });

  async function refresh(messageText: string) {
    setMessage(messageText);
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "technicians"] });
    onChanged?.();
  }

  const assign = useMutation({
    mutationFn: () => adminApi.assignTechnician(booking.id, { technician_id: technicianId as UUID, notes, reason }),
    onSuccess: () => refresh("Technician assignment saved."),
  });
  const remove = useMutation({
    mutationFn: () => adminApi.removeTechnician(booking.id, { notes }),
    onSuccess: () => refresh("Technician assignment removed."),
  });
  const operate = useMutation({
    mutationFn: (operation: "start" | "complete" | "cancel") => {
      if (operation === "start") return adminApi.startBooking(booking.id, { notes });
      if (operation === "complete") return adminApi.completeBooking(booking.id, { notes });
      return adminApi.cancelBooking(booking.id, { notes });
    },
    onSuccess: (_, operation) => refresh(`Booking ${operation} operation completed.`),
  });
  const balance = useMutation({
    mutationFn: () => adminApi.recordBalance(booking.id, { amount: balanceAmount, method: balanceMethod, notes }),
    onSuccess: () => refresh("Balance collection recorded."),
  });
  const paymentOrder = useMutation({
    mutationFn: () => adminApi.createPaymentLink(booking.id),
    onSuccess: async (order) => {
      await navigator.clipboard.writeText(order.provider_order_id);
      await refresh(`Razorpay order ${order.provider_order_id} created and copied.`);
    },
  });
  const activeError = assign.error ?? remove.error ?? operate.error ?? balance.error ?? paymentOrder.error;
  const assignable = ["CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(booking.booking_status);
  const selectedTechnician = technicians.data?.find((technician) => technician.id === technicianId);
  const canAssign = assignable && selectedTechnician && !selectedTechnician.eligibility_errors?.length && !technicians.isError;

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-bold text-slate-950">Assign or reassign technician</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select aria-label="Technician for assignment" className={inputClass} value={technicianId} onChange={(event) => setTechnicianId(event.target.value)} disabled={!assignable || technicians.isLoading || assign.isPending}>
            <option value="">Select an eligible technician</option>
            {(technicians.data ?? []).map((technician) => (
              <option key={technician.id} value={technician.id} disabled={Boolean(technician.eligibility_errors?.length)}>
                {technician.display_name} · {technician.employee_code} · {technician.eligibility_errors?.join(" ") || "Eligible"}
              </option>
            ))}
          </select>
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Assignment or reassignment reason" />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="button" disabled={!canAssign || assign.isPending || remove.isPending} onClick={() => assign.mutate()}>
              {assign.isPending ? "Assigning" : "Assign technician"}
            </Button>
            <Button type="button" variant="outline" disabled={!booking.assigned_technician || remove.isPending || assign.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? "Removing" : "Remove assignment"}
            </Button>
          </div>
        </div>
        {!assignable ? <p className="mt-3 text-sm text-slate-600">Assignment is available only for confirmed or technician-assigned bookings.</p> : null}
        {technicians.isError ? <p role="alert" className="mt-3 text-sm text-red-600">Could not check technician eligibility. <button type="button" className="underline" onClick={() => void technicians.refetch()}>Retry</button></p> : null}
        {assignable && technicians.data && !technicians.data.some((technician) => !technician.eligibility_errors?.length) ? <p className="mt-3 text-sm text-amber-700">No eligible technicians for this slot. Check verification, availability, coverage, leave, or overlapping jobs.</p> : null}
        {selectedTechnician?.eligibility_errors?.length ? <p role="alert" className="mt-3 text-sm text-amber-700">{selectedTechnician.eligibility_errors.join(" ")}</p> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-bold text-slate-950">Booking operations</h3>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Operational notes"
          className="mt-3 min-h-24 w-full rounded-md border border-slate-200 bg-white p-3 text-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => operate.mutate("start")} disabled={operate.isPending}>Start service</Button>
          <Button type="button" variant="outline" onClick={() => operate.mutate("complete")} disabled={operate.isPending}>Complete service</Button>
          <Button type="button" variant="outline" onClick={() => operate.mutate("cancel")} disabled={operate.isPending}>Cancel booking</Button>
          <Button type="button" variant="outline" onClick={() => paymentOrder.mutate()} disabled={paymentOrder.isPending || booking.payment_status === "PAID"}>
            {paymentOrder.isPending ? "Creating order" : "Create payment order"}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-bold text-slate-950">Record balance collection</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input inputMode="decimal" value={balanceAmount} onChange={(event) => setBalanceAmount(event.target.value)} placeholder="Amount" />
          <select className={inputClass} value={balanceMethod} onChange={(event) => setBalanceMethod(event.target.value as typeof balanceMethod)}>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD_OFFLINE">Card offline</option>
            <option value="OTHER">Other</option>
          </select>
          <Button type="button" onClick={() => balance.mutate()} disabled={balance.isPending || Number(balanceAmount) <= 0}>Record balance</Button>
        </div>
      </section>

      {showHistory ? <section>
        <h3 className="font-bold text-slate-950">Status history</h3>
        <div className="mt-3 grid gap-2">
          {booking.status_history.map((history) => (
            <div key={history.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <AdminStatusBadge status={history.to_status} />
                <span className="text-sm text-slate-600">{history.notes || "No notes"}</span>
              </div>
              <span className="text-xs text-slate-500">{new Date(history.created_at).toLocaleString("en-IN")}</span>
            </div>
          ))}
          {!booking.status_history.length ? <p className="text-sm text-slate-500">No status history recorded.</p> : null}
        </div>
      </section> : null}

      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
      {activeError ? <p className="text-sm font-semibold text-red-600">{activeError.message}</p> : null}
    </div>
  );
}
