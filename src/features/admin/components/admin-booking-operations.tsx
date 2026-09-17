"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking, UUID } from "@/types/api";

const inputClass = "h-11 rounded-md border border-slate-200 bg-white px-3 text-sm";

export function AdminBookingOperations({ booking, onChanged }: { booking: Booking; onChanged?: () => void }) {
  const queryClient = useQueryClient();
  const [technicianId, setTechnicianId] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [balanceAmount, setBalanceAmount] = useState(booking.balance_due);
  const [balanceMethod, setBalanceMethod] = useState<"CASH" | "UPI" | "CARD_OFFLINE" | "OTHER">("CASH");
  const [message, setMessage] = useState("");
  const technicians = useQuery({
    queryKey: ["admin", "technicians", "eligible", booking.id],
    queryFn: () => adminApi.listTechnicians({ booking_id: booking.id }),
  });

  async function refresh(messageText: string) {
    setMessage(messageText);
    await queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
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

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-bold text-slate-950">Assign or reassign technician</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select className={inputClass} value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
            <option value="">Select an eligible technician</option>
            {(technicians.data ?? []).map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.display_name} · {technician.employee_code} · {technician.availability_status ?? "AVAILABLE"}
              </option>
            ))}
          </select>
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Assignment or reassignment reason" />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="button" disabled={!technicianId || assign.isPending} onClick={() => assign.mutate()}>
              {assign.isPending ? "Assigning" : "Assign technician"}
            </Button>
            <Button type="button" variant="outline" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? "Removing" : "Remove assignment"}
            </Button>
          </div>
        </div>
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

      <section>
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
      </section>

      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
      {activeError ? <p className="text-sm font-semibold text-red-600">{activeError.message}</p> : null}
    </div>
  );
}
