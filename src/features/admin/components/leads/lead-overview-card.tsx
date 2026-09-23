"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadServiceCombobox } from "@/features/admin/components/leads/lead-service-combobox";
import { formatLeadDate, formatLeadStatus, isValidIndianMobile, normalizeIndianMobile } from "@/features/admin/components/leads/lead-utils";
import type { AdminService, Lead } from "@/types/api";

export type LeadEditValues = Pick<Lead, "customer_name" | "primary_mobile" | "address" | "admin_notes" | "funnel_status"> & { required_service: string };

type Props = {
  lead: Lead;
  services: AdminService[];
  editing: boolean;
  pending: boolean;
  reminderPending: boolean;
  closePending: boolean;
  error?: string;
  onCancelEdit: () => void;
  onSave: (values: LeadEditValues) => void;
  onReminder: () => void;
  onClose: () => void;
};

export function LeadOverviewCard({ lead, services, editing, pending, reminderPending, closePending, error, onCancelEdit, onSave, onReminder, onClose }: Props) {
  const [closeOpen, setCloseOpen] = useState(false);
  const [values, setValues] = useState<LeadEditValues>(() => toEditValues(lead));
  const mobileValid = isValidIndianMobile(values.primary_mobile);

  if (editing) {
    return (
      <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <EditField label="Customer"><Input value={values.customer_name} onChange={(event) => setValues({ ...values, customer_name: event.target.value })} /></EditField>
          <EditField label="Mob Number" error={values.primary_mobile && !mobileValid ? "Enter a valid 10-digit Indian mobile number." : undefined}><Input inputMode="tel" value={values.primary_mobile} onChange={(event) => setValues({ ...values, primary_mobile: event.target.value })} /></EditField>
          <EditField label="Service" className="sm:col-span-2"><LeadServiceCombobox services={services} value={values.required_service} onChange={(required_service) => setValues({ ...values, required_service })} /></EditField>
          <EditField label="Location" className="sm:col-span-2"><textarea value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} className="min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15" /></EditField>
          <EditField label="Funnel status"><select value={values.funnel_status} onChange={(event) => setValues({ ...values, funnel_status: event.target.value })} className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm">{["VISITED", "CART_ADDED", "UNPAID", "PAID", "BOOKED", "CANCELLED", "LOST"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></EditField>
          <EditField label="Admin notes" className="sm:col-span-2"><textarea value={values.admin_notes} onChange={(event) => setValues({ ...values, admin_notes: event.target.value })} className="min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15" /></EditField>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-3"><Button type="button" variant="ghost" onClick={onCancelEdit}>Cancel</Button><Button type="button" className="rounded-full" disabled={!values.customer_name.trim() || !mobileValid || !values.required_service || pending} onClick={() => onSave({ ...values, primary_mobile: normalizeIndianMobile(values.primary_mobile) })}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving</> : "Save"}</Button></div>
      </section>
    );
  }

  const rows = [
    ["Service", lead.service_name || "-"], ["Customer", lead.customer_name], ["Mob Number", lead.primary_mobile],
    ["Location", [lead.address, lead.city, lead.pincode].filter(Boolean).join(", ") || "-"], ["Assigned Location", "NA"],
    ["Created on", formatLeadDate(lead.created_at)], ["Source", lead.source], ["Status", formatLeadStatus(lead.status)],
  ];
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <dl>{rows.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-border px-5 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5 sm:px-6"><dt className="text-sm font-bold text-foreground">{label}</dt><dd className="max-w-xl whitespace-pre-line break-words text-sm leading-6 text-secondary">{value}</dd></div>)}</dl>
      <div className="grid gap-1 border-b border-border px-5 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-5 sm:px-6"><p className="text-sm font-bold text-foreground">Reminder Notification to Customer:</p><button type="button" disabled={reminderPending} onClick={onReminder} className="min-h-11 w-fit text-sm font-bold text-primary hover:underline disabled:opacity-50">{reminderPending ? "Sending..." : "Trigger Sms"}</button></div>
      <div className="grid gap-1 px-5 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-5 sm:px-6"><p className="text-sm font-bold text-foreground">Close Ticket:</p><button type="button" disabled={closePending || lead.status === "CLOSED"} onClick={() => setCloseOpen(true)} className="min-h-11 w-fit text-sm font-bold text-primary hover:underline disabled:opacity-50">{lead.status === "CLOSED" ? "Closed" : "Close"}</button></div>
      <Dialog.Root open={closeOpen} onOpenChange={setCloseOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(430px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><div><Dialog.Title className="text-xl font-black">Close this ticket?</Dialog.Title><Dialog.Description className="mt-2 text-sm leading-6 text-secondary">The lead will be marked closed. Existing activity and payment records will remain available.</Dialog.Description></div><Dialog.Close className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></Dialog.Close></div><div className="mt-6 flex justify-end gap-3"><Dialog.Close asChild><Button type="button" variant="ghost">Cancel</Button></Dialog.Close><Button type="button" className="rounded-full" disabled={closePending} onClick={() => { onClose(); setCloseOpen(false); }}>Close ticket</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
    </section>
  );
}

function toEditValues(lead: Lead): LeadEditValues {
  return { customer_name: lead.customer_name, primary_mobile: lead.primary_mobile, required_service: lead.required_service ?? "", address: lead.address, admin_notes: lead.admin_notes, funnel_status: lead.funnel_status };
}

function EditField({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={`text-sm font-semibold text-foreground ${className ?? ""}`}>{label}<div className="mt-2">{children}</div>{error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}</label>;
}
