"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { Button } from "@/components/ui/button";
import { LeadLineItemsCard, type DisplayLineItem } from "@/features/admin/components/leads/lead-line-items-card";
import { createLeadLineItemDraft, selectedDraftPackages, updateLeadLineItemDraft } from "@/features/admin/components/leads/lead-line-items-data";
import { LeadOverviewCard, type LeadEditValues } from "@/features/admin/components/leads/lead-overview-card";
import { LeadPackagePicker } from "@/features/admin/components/leads/lead-package-picker";
import { LeadScheduleDialog } from "@/features/admin/components/leads/lead-schedule-dialog";
import { LeadActivityTimeline, LeadFollowUpPanel, LeadManualPaymentPanel, type ManualPaymentDraft } from "@/features/admin/components/leads/lead-secondary-sections";
import { adminApi } from "@/lib/api/endpoints";
import type { UUID } from "@/types/api";

const emptyManualPayment = (): ManualPaymentDraft => ({ amount: "", method: "MANUAL_CASH", reference: "", payment_date: new Date().toISOString().slice(0, 10), note: "", confirm: false });

export function AdminLeadDetailScreen({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const lead = useQuery({ queryKey: ["admin", "lead", leadId], queryFn: () => adminApi.getLead(leadId) });
  const activities = useQuery({ queryKey: ["admin", "lead", leadId, "activities"], queryFn: () => adminApi.listLeadActivities(leadId) });
  const services = useQuery({ queryKey: ["admin", "services", "lead-detail"], queryFn: () => adminApi.listServices({ page_size: 100 }) });
  const packages = useQuery({ queryKey: ["admin", "packages", "lead-detail"], queryFn: () => adminApi.listPackages({ page_size: 100, is_active: true }) });
  const [editing, setEditing] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [paymentChannel, setPaymentChannel] = useState<"SMS" | "WHATSAPP">("WHATSAPP");
  const [conversionNotes, setConversionNotes] = useState("");
  const [manualPayment, setManualPayment] = useState(emptyManualPayment);
  const [quantities, setQuantities] = useState<Record<UUID, number> | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "lead", leadId] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "lead", leadId, "activities"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
  };
  const save = useMutation({ mutationFn: (values: LeadEditValues) => adminApi.updateLead(leadId, values), onSuccess: () => { setEditing(false); refresh(); } });
  const contact = useMutation({ mutationFn: () => adminApi.recordLeadContact(leadId, { note, next_follow_up_at: followUp || undefined }), onSuccess: () => { setNote(""); refresh(); } });
  const paymentLink = useMutation({ mutationFn: (scope: "FULL" | "ADVANCE") => adminApi.sendLeadPaymentLink(leadId, { channel: paymentChannel, payment_scope: scope }), onSuccess: refresh });
  const convert = useMutation({ mutationFn: () => adminApi.convertLead(leadId, { notes: conversionNotes }), onSuccess: refresh });
  const schedule = useMutation({ mutationFn: ({ date, time }: { date: string; time: string }) => adminApi.scheduleLead(leadId, { preferred_date: date, preferred_slot: time }), onSuccess: () => { setScheduleOpen(false); refresh(); } });
  const reminder = useMutation({ mutationFn: () => adminApi.sendLeadReminder(leadId, { channel: "SMS" }), onSuccess: refresh });
  const close = useMutation({ mutationFn: () => adminApi.updateLead(leadId, { status: "CLOSED" }), onSuccess: refresh });
  const recordPayment = useMutation({ mutationFn: () => adminApi.recordLeadManualPayment(leadId, manualPayment), onSuccess: () => { setManualPayment(emptyManualPayment()); refresh(); } });

  const relevantPackages = useMemo(() => {
    const all = packages.data?.results ?? [];
    const selectedService = services.data?.results.find((item) => item.id === lead.data?.required_service);
    if (!selectedService) return all;
    const matching = all.filter((item) => item.items.some((entry) => entry.service_detail.category.slug === selectedService.category_detail.slug));
    return matching.length ? matching : all;
  }, [lead.data?.required_service, packages.data?.results, services.data?.results]);

  if (lead.isLoading) return <LeadDetailSkeleton />;
  if (lead.isError) return <AdminErrorState message={lead.error.message} onRetry={() => void lead.refetch()} />;
  if (!lead.data) return null;
  const item = lead.data;
  const initialQuantities = createLeadLineItemDraft(item, relevantPackages);
  const effectiveQuantities = quantities ?? initialQuantities;
  const draftPackages = selectedDraftPackages(effectiveQuantities, relevantPackages);
  const packageNames = new Set(relevantPackages.map((entry) => entry.name));
  const displayItems: DisplayLineItem[] = [
    ...(item.line_items ?? []).filter((line) => !packageNames.has(line.package_name)).map((line) => ({ key: line.id ?? line.service_id, name: line.package_name, quantity: line.quantity, unitCost: line.unit_cost })),
    ...draftPackages.map((draft) => {
      const packageItem = relevantPackages.find((entry) => entry.id === draft.packageId)!;
      return { key: packageItem.id, name: packageItem.name, quantity: draft.quantity, unitCost: packageItem.bundle_price };
    }),
  ];
  const subtotal = displayItems.reduce((sum, line) => sum + line.quantity * Number(line.unitCost), 0);
  const tax = Number(item.tax_amount ?? 0);
  const trainingFee = Number(item.training_fee ?? 0);
  const isScheduled = Boolean(item.preferred_date && item.preferred_slot);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/leads" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />Back to Lead List</Link>
        <div className="mt-1 flex items-center justify-between gap-4"><h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Lead #{item.lead_number || item.id.slice(0, 8).toUpperCase()}</h1><Button type="button" variant="outline" className="rounded-full" onClick={() => setEditing((value) => !value)}><Pencil className="h-4 w-4" />{editing ? "Cancel" : "Edit"}</Button></div>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)] lg:items-start">
        <LeadOverviewCard key={item.updated_at} lead={item} services={services.data?.results ?? []} editing={editing} pending={save.isPending} reminderPending={reminder.isPending} closePending={close.isPending} error={save.isError ? save.error.message : undefined} onCancelEdit={() => setEditing(false)} onSave={(values) => save.mutate(values)} onReminder={() => reminder.mutate()} onClose={() => close.mutate()} />
        <LeadLineItemsCard items={displayItems} subtotal={subtotal} tax={tax} trainingFee={trainingFee} total={subtotal + tax + trainingFee} scheduledLabel={isScheduled ? `${item.preferred_date} at ${item.preferred_slot}` : "Not scheduled"} isScheduled={isScheduled} paymentLinkUrl={item.payment_link_url} advanceAmount={item.advance_amount} paymentChannel={paymentChannel} conversionNotes={conversionNotes} paymentPending={paymentLink.isPending} conversionPending={convert.isPending} converted={item.status === "CONVERTED"} draftOnly={quantities !== null} error={paymentLink.isError ? paymentLink.error.message : convert.isError ? convert.error.message : undefined} onSchedule={() => setScheduleOpen(true)} onPaymentChannelChange={setPaymentChannel} onConversionNotesChange={setConversionNotes} onSendPaymentLink={(scope) => paymentLink.mutate(scope)} onConvert={() => convert.mutate()} />
      </div>

      <LeadPackagePicker packages={relevantPackages} quantities={effectiveQuantities} loading={packages.isLoading} onQuantityChange={(packageId, quantity) => setQuantities((current) => updateLeadLineItemDraft(current ?? initialQuantities, packageId, quantity))} />
      <div className="grid gap-5 lg:grid-cols-2">
        <LeadFollowUpPanel note={note} followUp={followUp} pending={contact.isPending} error={contact.isError ? contact.error.message : undefined} onNoteChange={setNote} onFollowUpChange={setFollowUp} onSubmit={() => contact.mutate()} />
        <LeadManualPaymentPanel value={manualPayment} pending={recordPayment.isPending} error={recordPayment.isError ? recordPayment.error.message : undefined} onChange={setManualPayment} onSubmit={() => recordPayment.mutate()} />
      </div>
      <LeadActivityTimeline activities={activities.data ?? item.activities ?? []} loading={activities.isLoading} />
      <LeadScheduleDialog open={scheduleOpen} initialDate={item.preferred_date} initialTime={item.preferred_slot} pending={schedule.isPending} error={schedule.isError ? schedule.error.message : undefined} onOpenChange={setScheduleOpen} onSubmit={(date, time) => schedule.mutate({ date, time })} />
    </div>
  );
}

function LeadDetailSkeleton() {
  return <div className="space-y-6"><div className="h-20 animate-pulse rounded-xl bg-muted" /><div className="grid gap-5 lg:grid-cols-[3fr_2fr]"><div className="h-[560px] animate-pulse rounded-xl bg-muted" /><div className="h-[560px] animate-pulse rounded-xl bg-muted" /></div></div>;
}
