"use client";

import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInr } from "@/features/admin/components/leads/lead-utils";

export type DisplayLineItem = { key: string; name: string; quantity: number; unitCost: string | number };

type Props = {
  items: DisplayLineItem[];
  subtotal: string | number;
  tax: string | number;
  trainingFee: string | number;
  total: string | number;
  scheduledLabel: string;
  isScheduled: boolean;
  paymentLinkUrl: string;
  advanceAmount: string | number | null;
  deliveryStatus?: string;
  conversionNotes: string;
  paymentPending: boolean;
  paymentChannel: "SMS" | "WHATSAPP";
  whatsappConsent: boolean;
  conversionPending: boolean;
  converted: boolean;
  draftOnly: boolean;
  error?: string;
  onSchedule: () => void;
  onConversionNotesChange: (value: string) => void;
  onPaymentChannelChange: (channel: "SMS" | "WHATSAPP") => void;
  onWhatsappConsentChange: (confirmed: boolean) => void;
  onSendPaymentLink: (scope: "FULL" | "ADVANCE", channel: "SMS" | "WHATSAPP", consent: boolean) => void;
  onConvert: () => void;
};

export function LeadLineItemsCard(props: Props) {
  const [copied, setCopied] = useState(false);
  const hasItems = props.items.length > 0;

  async function copyLink() {
    if (!props.paymentLinkUrl) return;
    await navigator.clipboard.writeText(props.paymentLinkUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <aside className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="border-b border-border pb-4 text-xl font-bold text-foreground">Line items</h2>
      {!hasItems ? <div className="grid min-h-52 place-items-center text-sm font-medium text-secondary">No Line Items</div> : (
        <>
          <div className="min-w-0">
            <table className="mt-4 w-full table-fixed text-left text-sm [&_td]:break-words [&_td]:[overflow-wrap:anywhere]">
              <thead><tr className="border-b border-border text-xs font-semibold text-secondary"><th className="pb-3">Package</th><th className="pb-3">Unit</th><th className="pb-3 text-right">Cost</th></tr></thead>
              <tbody>{props.items.map((item) => <tr key={item.key} className="border-b border-border"><td className="py-4 font-semibold text-foreground">{item.name}</td><td className="py-4">{item.quantity}</td><td className="py-4 text-right">{formatInr(Number(item.unitCost) * item.quantity)}</td></tr>)}</tbody>
            </table>
          </div>
          <dl className="ml-auto mt-5 max-w-xs space-y-3 text-sm">
            <SummaryRow label="Sub Total" value={formatInr(props.subtotal)} />
            <SummaryRow label="Tax" value={formatInr(props.tax)} />
            <SummaryRow label="Training fee" value={formatInr(props.trainingFee)} />
            <div className="flex justify-between border-t border-border pt-3 text-base font-black"><dt>TOTAL</dt><dd>{formatInr(props.total)}</dd></div>
          </dl>
          <div className="mt-6 flex items-center justify-between border-y border-border py-4 text-sm"><div><p className="font-bold text-foreground">Schedule Job:</p><p className="mt-1 text-xs text-secondary">{props.scheduledLabel}</p></div><button type="button" className="min-h-11 px-2 font-bold text-primary hover:underline" onClick={props.onSchedule}>Update</button></div>
          <div className="mt-5 grid gap-3">
            <Input value={props.conversionNotes} onChange={(event) => props.onConversionNotesChange(event.target.value)} placeholder="Conversion notes (optional)" />
            <label className="grid gap-1 text-xs font-semibold text-secondary">Send payment link by
              <select value={props.paymentChannel} onChange={(event) => props.onPaymentChannelChange(event.target.value as "SMS" | "WHATSAPP")} className="h-11 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground">
                <option value="SMS">SMS</option><option value="WHATSAPP">WhatsApp</option>
              </select>
            </label>
            {props.paymentChannel === "WHATSAPP" ? <label className="flex items-start gap-2 text-xs leading-5 text-secondary"><input type="checkbox" checked={props.whatsappConsent} onChange={(event) => props.onWhatsappConsentChange(event.target.checked)} className="mt-1" />Customer has agreed to receive this service and payment message on WhatsApp.</label> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-full" disabled={!props.isScheduled || props.paymentPending || props.draftOnly || (props.paymentChannel === "WHATSAPP" && !props.whatsappConsent)} onClick={() => props.onSendPaymentLink("FULL", props.paymentChannel, props.whatsappConsent)}>{props.paymentPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Send Payment Link</Button>
              <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-border hover:bg-primary-subtle disabled:opacity-50" disabled={!props.paymentLinkUrl} onClick={() => void copyLink()} aria-label="Copy payment link">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</button>
              <Button type="button" className="flex-1 rounded-full" disabled={!props.isScheduled || props.conversionPending || props.converted || props.draftOnly} onClick={props.onConvert}>{props.conversionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Create work order</Button>
            </div>
            <Button type="button" variant="outline" className="w-full rounded-full" disabled={!props.isScheduled || props.paymentPending || Number(props.advanceAmount ?? 0) <= 0 || props.draftOnly || (props.paymentChannel === "WHATSAPP" && !props.whatsappConsent)} onClick={() => props.onSendPaymentLink("ADVANCE", props.paymentChannel, props.whatsappConsent)}>Send Advance Link</Button>
          </div>
          {props.draftOnly ? <p className="mt-3 rounded-md bg-primary-subtle p-3 text-xs font-medium text-primary">Package quantities are a local preview until lead line-item write APIs are available. Payment and work-order actions are disabled for this draft.</p> : null}
          {props.paymentLinkUrl ? <a href={props.paymentLinkUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-xs font-semibold text-primary hover:underline">{props.paymentLinkUrl}</a> : null}
          {props.deliveryStatus ? <p role="status" className={`mt-2 text-xs font-semibold ${props.deliveryStatus === "SENT" ? "text-green-700" : "text-amber-700"}`}>{props.deliveryStatus === "SENT" ? `Payment link sent via ${props.paymentChannel === "WHATSAPP" ? "WhatsApp" : "SMS"}.` : `Payment link created, but message delivery status is ${props.deliveryStatus.toLowerCase().replaceAll("_", " ")}. Check the MSG91 template/configuration.`}</p> : null}
          {props.error ? <p className="mt-2 text-xs text-red-600">{props.error}</p> : null}
          <div className="mt-6 text-xs leading-5 text-secondary"><p>( Before Confirming workorder verify the details )</p><p className="mt-3 font-bold text-foreground">Note</p><ol className="mt-2 list-decimal space-y-1 pl-5"><li>A professional partner will contact you within 10 - 20 minutes.</li><li>After discussing your requirements, a service estimate will be shared before starting the work.</li></ol></div>
        </>
      )}
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-secondary">{label}</dt><dd className="font-semibold text-foreground">{value}</dd></div>;
}
