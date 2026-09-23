"use client";

import { ChevronRight, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { formatInr } from "@/features/admin/components/leads/lead-utils";
import type { AdminPackage, UUID } from "@/types/api";

type Props = {
  packages: AdminPackage[];
  quantities: Record<UUID, number>;
  loading?: boolean;
  onQuantityChange: (packageId: UUID, quantity: number) => void;
};

export function LeadPackagePicker({ packages, quantities, loading, onQuantityChange }: Props) {
  const [expanded, setExpanded] = useState<Set<UUID>>(new Set());
  const groups = useMemo(() => {
    const grouped = new Map<string, AdminPackage[]>();
    for (const item of packages.filter((entry) => entry.is_active)) {
      const service = item.items[0]?.service_detail;
      const group = service?.landing_group || service?.category?.name || "Service Packages";
      grouped.set(group, [...(grouped.get(group) ?? []), item]);
    }
    return [...grouped.entries()];
  }, [packages]);

  return (
    <section className="rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-5 py-5 sm:px-7"><h2 className="text-xl font-bold text-foreground">Add packages</h2><p className="mt-1 text-sm text-secondary">Choose packages and adjust quantities for this request.</p></div>
      <div className="divide-y divide-border">
        {groups.map(([group, items]) => (
          <div key={group} className="p-5 sm:p-7">
            <h3 className="text-base font-bold text-foreground">{group}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const quantity = quantities[item.id] ?? 0;
                const isExpanded = expanded.has(item.id);
                return (
                  <article key={item.id} className="flex min-h-44 items-start justify-between gap-4 rounded-lg border border-border p-4 transition hover:border-primary/35 hover:shadow-sm">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold leading-5 text-foreground">{item.name}</h4>
                      <p className={`mt-2 text-sm leading-5 text-secondary ${isExpanded ? "" : "line-clamp-2"}`}>{item.description || item.items.map((entry) => entry.service_detail.name).join(", ")}</p>
                      <p className="mt-2 font-bold text-foreground">{formatInr(item.bundle_price)}</p>
                      <button type="button" onClick={() => setExpanded((current) => {
                        const next = new Set(current);
                        if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                        return next;
                      })} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline">
                        {isExpanded ? "Show less" : "Show more"}<ChevronRight className={`h-4 w-4 transition ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                    {quantity > 0 ? (
                      <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-full border border-primary text-primary">
                        <button type="button" className="grid h-11 w-11 place-items-center hover:bg-primary-subtle" onClick={() => onQuantityChange(item.id, quantity - 1)} aria-label={`Decrease ${item.name}`}><Minus className="h-4 w-4" /></button>
                        <span className="min-w-7 text-center text-sm font-bold" aria-live="polite">{quantity}</span>
                        <button type="button" className="grid h-11 w-11 place-items-center hover:bg-primary-subtle" onClick={() => onQuantityChange(item.id, quantity + 1)} aria-label={`Increase ${item.name}`}><Plus className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button type="button" className="min-h-11 shrink-0 rounded-full border border-primary px-5 text-sm font-bold text-primary hover:bg-primary-subtle" onClick={() => onQuantityChange(item.id, 1)}>Add</button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
        {loading ? <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-lg bg-muted" />)}</div> : null}
        {!loading && !groups.length ? <p className="p-10 text-center text-sm text-secondary">No active packages are available.</p> : null}
      </div>
    </section>
  );
}
