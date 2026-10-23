"use client";

import { Minus, Plus } from "lucide-react";

import { formatInr } from "@/features/admin/components/leads/lead-utils";
import type { AdminService, UUID } from "@/types/api";

type Props = {
  services: AdminService[];
  quantities: Record<UUID, number>;
  primaryServiceId: UUID;
  categoryName: string;
  loading?: boolean;
  dirty?: boolean;
  saving?: boolean;
  onSave?: () => void;
  onQuantityChange: (serviceId: UUID, quantity: number) => void;
};

export function LeadPackagePicker({ services, quantities, primaryServiceId, categoryName, loading, dirty, saving, onSave, onQuantityChange }: Props) {
  const activeServices = services.filter((service) => service.is_active);
  return (
    <section className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-5 sm:px-7">
        <div><h2 className="text-xl font-bold text-foreground">Add services</h2><p className="mt-1 text-sm text-secondary">Choose additional {categoryName || "related"} services and quantities for this lead.</p></div>
        {onSave ? <button type="button" disabled={!dirty || saving} onClick={onSave} className="min-h-11 rounded-full bg-primary px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Save services"}</button> : null}
      </div>
      {loading ? <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-muted" />)}</div> : activeServices.length ? (
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">
          {activeServices.map((service) => {
            const quantity = quantities[service.id] ?? 0;
            const required = service.id === primaryServiceId;
            return <article key={service.id} className={`flex min-h-28 items-center justify-between gap-3 rounded-lg border p-4 ${quantity ? "border-primary/50 bg-primary-subtle/40" : "border-border"}`}>
              <div className="min-w-0"><h3 className="font-bold leading-5 text-foreground">{service.name}{required ? <span className="ml-2 text-xs font-medium text-secondary">Primary</span> : null}</h3><p className="mt-2 text-sm font-semibold text-secondary">{formatInr(service.effective_price)}</p></div>
              {quantity ? <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-full border border-primary text-primary">
                <button type="button" className="grid h-11 w-11 place-items-center hover:bg-white disabled:opacity-40" disabled={required && quantity <= 1} onClick={() => onQuantityChange(service.id, quantity - 1)} aria-label={`Decrease ${service.name}`}><Minus className="h-4 w-4" /></button>
                <span className="min-w-7 text-center text-sm font-bold" aria-live="polite">{quantity}</span>
                <button type="button" className="grid h-11 w-11 place-items-center hover:bg-white" onClick={() => onQuantityChange(service.id, quantity + 1)} aria-label={`Increase ${service.name}`}><Plus className="h-4 w-4" /></button>
              </div> : <button type="button" className="min-h-11 shrink-0 rounded-full border border-primary px-5 text-sm font-bold text-primary hover:bg-primary-subtle" onClick={() => onQuantityChange(service.id, 1)}>Add</button>}
            </article>;
          })}
        </div>
      ) : <p className="p-10 text-center text-sm text-secondary">No active services are available in this category.</p>}
      {dirty ? <p className="px-5 pb-5 text-xs font-medium text-amber-700 sm:px-7">Save your service selection before creating a payment link or work order.</p> : null}
    </section>
  );
}
