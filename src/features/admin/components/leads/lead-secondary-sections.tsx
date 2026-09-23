"use client";

import { Loader2, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatLeadDate } from "@/features/admin/components/leads/lead-utils";
import type { LeadActivity } from "@/types/api";

export function LeadFollowUpPanel({ note, followUp, pending, error, onNoteChange, onFollowUpChange, onSubmit }: {
  note: string; followUp: string; pending: boolean; error?: string;
  onNoteChange: (value: string) => void; onFollowUpChange: (value: string) => void; onSubmit: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><MessageSquareText className="h-5 w-5 text-primary" />Follow up</h2>
      <label className="mt-4 block text-sm font-semibold text-foreground">Call note<textarea value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Write call note" className="mt-2 min-h-28 w-full rounded-md border border-border p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15" /></label>
      <label className="mt-4 block text-sm font-semibold text-foreground">Next follow-up<Input type="datetime-local" value={followUp} onChange={(event) => onFollowUpChange(event.target.value)} className="mt-2" /></label>
      <Button type="button" className="mt-4 rounded-full" onClick={onSubmit} disabled={!note.trim() || pending}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Recording</> : "Record contact"}</Button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </section>
  );
}

export function LeadActivityTimeline({ activities, loading }: { activities: LeadActivity[]; loading: boolean }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Activity timeline</h2>
      <div className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
        {activities.map((activity) => (
          <article key={activity.id} className="relative pl-8">
            <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-white" />
            <p className="text-sm font-bold text-foreground">{activity.action.replaceAll("_", " ")}</p>
            <p className="mt-1 text-xs text-secondary">{formatLeadDate(activity.created_at)}{activity.performed_by_phone ? ` by ${activity.performed_by_phone}` : ""}</p>
            {activity.note ? <p className="mt-2 text-sm leading-6 text-secondary">{activity.note}</p> : null}
          </article>
        ))}
      </div>
      {loading ? <div className="mt-4 h-20 animate-pulse rounded-lg bg-muted" /> : null}
      {!loading && !activities.length ? <p className="mt-4 text-sm text-secondary">No activity recorded yet.</p> : null}
    </section>
  );
}

export type ManualPaymentDraft = {
  amount: string;
  method: "MANUAL_CASH" | "MANUAL_UPI" | "MANUAL_CARD" | "MANUAL_BANK_TRANSFER";
  reference: string;
  payment_date: string;
  note: string;
  confirm: boolean;
};

export function LeadManualPaymentPanel({ value, pending, error, onChange, onSubmit }: {
  value: ManualPaymentDraft; pending: boolean; error?: string;
  onChange: (value: ManualPaymentDraft) => void; onSubmit: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Record manual payment</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-foreground">Amount<Input className="mt-2" inputMode="decimal" value={value.amount} onChange={(event) => onChange({ ...value, amount: event.target.value })} /></label>
        <label className="text-sm font-semibold text-foreground">Method<select className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm" value={value.method} onChange={(event) => onChange({ ...value, method: event.target.value as ManualPaymentDraft["method"] })}><option value="MANUAL_CASH">Cash</option><option value="MANUAL_UPI">UPI</option><option value="MANUAL_CARD">Card</option><option value="MANUAL_BANK_TRANSFER">Bank transfer</option></select></label>
        <label className="text-sm font-semibold text-foreground">Reference<Input className="mt-2" value={value.reference} onChange={(event) => onChange({ ...value, reference: event.target.value })} /></label>
        <label className="text-sm font-semibold text-foreground">Payment date<Input className="mt-2" type="date" value={value.payment_date} onChange={(event) => onChange({ ...value, payment_date: event.target.value })} /></label>
        <label className="text-sm font-semibold text-foreground sm:col-span-2">Payment note<Input className="mt-2" value={value.note} onChange={(event) => onChange({ ...value, note: event.target.value })} /></label>
      </div>
      <label className="mt-4 flex items-start gap-2 text-xs font-semibold text-secondary"><input className="mt-0.5 h-4 w-4 accent-primary" type="checkbox" checked={value.confirm} onChange={(event) => onChange({ ...value, confirm: event.target.checked })} />I confirm this payment was received and verified.</label>
      <Button type="button" className="mt-4 rounded-full" disabled={!value.confirm || Number(value.amount) <= 0 || pending} onClick={onSubmit}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Recording</> : "Record payment"}</Button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
