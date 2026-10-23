"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { Button } from "@/components/ui/button";
import { LeadLineItemsCard, type DisplayLineItem } from "@/features/admin/components/leads/lead-line-items-card";
import { createLeadLineItemDraft, updateLeadLineItemDraft } from "@/features/admin/components/leads/lead-line-items-data";
import { LeadOverviewCard, type LeadEditValues } from "@/features/admin/components/leads/lead-overview-card";
import { LeadPackagePicker } from "@/features/admin/components/leads/lead-package-picker";
import { LeadScheduleDialog } from "@/features/admin/components/leads/lead-schedule-dialog";
import { LeadActivityTimeline } from "@/features/admin/components/leads/lead-secondary-sections";
import { adminApi } from "@/lib/api/endpoints";
import type { UUID } from "@/types/api";

export function AdminLeadDetailScreen({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const lead = useQuery({ queryKey: ["admin", "lead", leadId], queryFn: () => adminApi.getLead(leadId) });
  const activities = useQuery({ queryKey: ["admin", "lead", leadId, "activities"], queryFn: () => adminApi.listLeadActivities(leadId), enabled: Boolean(lead.data) });
  const services = useQuery({ queryKey: ["admin", "service-options", "lead-detail"], queryFn: () => adminApi.listServices({ page_size: 100 }), staleTime: 2 * 60_000, enabled: Boolean(lead.data) });
  const [editing, setEditing] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [conversionNotes, setConversionNotes] = useState("");
  const [paymentChannel, setPaymentChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [quantities, setQuantities] = useState<Record<UUID, number> | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "lead", leadId] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "lead", leadId, "activities"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
  };
  const save = useMutation({ mutationFn: (values: LeadEditValues) => adminApi.updateLead(leadId, values), onSuccess: () => { setEditing(false); refresh(); } });
  const paymentLink = useMutation({ mutationFn: ({ scope, channel, consent }: { scope: "FULL" | "ADVANCE"; channel: "SMS" | "WHATSAPP"; consent: boolean }) => adminApi.sendLeadPaymentLink(leadId, { channel, payment_scope: scope, whatsapp_consent_confirmed: consent }), onSuccess: (result) => { setDeliveryStatus(result.payment_delivery_status ?? ""); refresh(); } });
  const convert = useMutation({ mutationFn: () => adminApi.convertLead(leadId, { notes: conversionNotes }), onSuccess: refresh });
  const schedule = useMutation({ mutationFn: ({ date, time, slot_id }: { date: string; time: string; slot_id: string }) => adminApi.scheduleLead(leadId, { preferred_date: date, preferred_slot: time, slot_id }), onSuccess: () => { setScheduleOpen(false); refresh(); } });
  const close = useMutation({ mutationFn: () => adminApi.updateLead(leadId, { status: "CLOSED" }), onSuccess: refresh });
  const saveServices = useMutation({
    mutationFn: (body: { required_service: string; service_items: Array<{ service_id: string; quantity: number }> }) => adminApi.updateLead(leadId, body),
    onSuccess: () => { setQuantities(null); refresh(); },
  });
  const selectedService = services.data?.results.find((item) => item.id === lead.data?.required_service);
  const relevantServices = useMemo(() => selectedService ? (services.data?.results ?? []).filter((item) => item.is_active && item.category === selectedService.category) : [], [selectedService, services.data?.results]);
  const categoryName = selectedService?.category_detail?.name ?? "related";

  if (lead.isLoading) return <LeadDetailSkeleton />;
  if (lead.isError) return <AdminErrorState message={lead.error.message} onRetry={() => void lead.refetch()} />;
  if (!lead.data) return null;
  const item = lead.data;
  const initialQuantities = createLeadLineItemDraft(item);
  const effectiveQuantities = quantities ?? initialQuantities;
  const displayItems: DisplayLineItem[] = relevantServices.flatMap((service) => {
    const quantity = effectiveQuantities[service.id] ?? 0;
    return quantity ? [{ key: service.id, name: service.name, quantity, unitCost: service.effective_price }] : [];
  });
  const subtotal = displayItems.reduce((sum, line) => sum + line.quantity * Number(line.unitCost), 0);
  const tax = Number(item.tax_amount ?? 0);
  const trainingFee = displayItems.reduce((sum, line) => {
    const service = relevantServices.find((candidate) => candidate.id === line.key);
    return sum + Number(service?.training_fee ?? 0) * (service?.training_fee_per_unit ? line.quantity : 1);
  }, 0);
  const isScheduled = Boolean(item.preferred_date && item.preferred_slot);
  const draftOnly = quantities !== null;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/leads" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />Back to Lead List</Link>
        <div className="mt-1 flex items-center justify-between gap-4"><h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Lead #{item.lead_number || item.id.slice(0, 8).toUpperCase()}</h1><Button type="button" variant="outline" className="rounded-full" onClick={() => setEditing((value) => !value)}><Pencil className="h-4 w-4" />{editing ? "Cancel" : "Edit"}</Button></div>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)] lg:items-start">
        <LeadOverviewCard key={item.updated_at} lead={item} services={services.data?.results ?? []} editing={editing} pending={save.isPending} closePending={close.isPending} error={save.isError ? save.error.message : undefined} onCancelEdit={() => setEditing(false)} onSave={(values) => save.mutate(values)} onClose={() => close.mutate()} />
        <LeadLineItemsCard items={displayItems} subtotal={subtotal} tax={tax} trainingFee={trainingFee} total={subtotal + tax + trainingFee} scheduledLabel={isScheduled ? `${item.preferred_date} at ${item.preferred_slot}` : "Not scheduled"} isScheduled={isScheduled} paymentLinkUrl={item.payment_link_url} advanceAmount={item.advance_amount} deliveryStatus={deliveryStatus} conversionNotes={conversionNotes} paymentPending={paymentLink.isPending} paymentChannel={paymentChannel} whatsappConsent={whatsappConsent} conversionPending={convert.isPending} converted={item.status === "CONVERTED"} draftOnly={draftOnly} error={paymentLink.isError ? paymentLink.error.message : convert.isError ? convert.error.message : saveServices.isError ? saveServices.error.message : undefined} onSchedule={() => setScheduleOpen(true)} onConversionNotesChange={setConversionNotes} onPaymentChannelChange={(channel) => { setPaymentChannel(channel); setWhatsappConsent(false); }} onWhatsappConsentChange={setWhatsappConsent} onSendPaymentLink={(scope, channel, consent) => paymentLink.mutate({ scope, channel, consent })} onConvert={() => convert.mutate()} />
      </div>

      <LeadPackagePicker services={relevantServices} quantities={effectiveQuantities} primaryServiceId={item.required_service ?? ""} categoryName={categoryName} loading={services.isLoading} dirty={draftOnly} saving={saveServices.isPending} onSave={() => saveServices.mutate({ required_service: item.required_service ?? "", service_items: Object.entries(effectiveQuantities).map(([service_id, quantity]) => ({ service_id, quantity })) })} onQuantityChange={(serviceId, quantity) => setQuantities((current) => updateLeadLineItemDraft(current ?? initialQuantities, serviceId, quantity))} />
      <LeadActivityTimeline activities={activities.data ?? item.activities ?? []} loading={activities.isLoading} />
      <LeadScheduleDialog open={scheduleOpen} initialDate={item.preferred_date} initialTime={item.preferred_slot} serviceId={item.required_service ?? ""} pincode={item.pincode} pending={schedule.isPending} error={schedule.isError ? schedule.error.message : undefined} onOpenChange={setScheduleOpen} onSubmit={(date, time, slot_id) => schedule.mutate({ date, time, slot_id })} />
    </div>
  );
}

function LeadDetailSkeleton() {
  return <div className="space-y-6"><div className="h-20 animate-pulse rounded-xl bg-muted" /><div className="grid gap-5 lg:grid-cols-[3fr_2fr]"><div className="h-[560px] animate-pulse rounded-xl bg-muted" /><div className="h-[560px] animate-pulse rounded-xl bg-muted" /></div></div>;
}
