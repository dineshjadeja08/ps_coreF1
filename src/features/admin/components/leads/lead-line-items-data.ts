import type { AdminPackage, Lead, UUID } from "@/types/api";

export type LeadLineItemDraft = Record<UUID, number>;

export function createLeadLineItemDraft(lead: Lead, packages: AdminPackage[]): LeadLineItemDraft {
  const draft: LeadLineItemDraft = {};
  for (const line of lead.line_items ?? []) {
    const matchingPackage = packages.find((item) => item.id === line.package_id || item.name === line.package_name);
    if (matchingPackage) draft[matchingPackage.id] = line.quantity;
  }
  return draft;
}

export function updateLeadLineItemDraft(draft: LeadLineItemDraft, packageId: UUID, quantity: number) {
  const next = { ...draft };
  if (quantity <= 0) delete next[packageId];
  else next[packageId] = quantity;
  return next;
}

export function selectedDraftPackages(draft: LeadLineItemDraft, packages: AdminPackage[]) {
  return packages.flatMap((item) => {
    const quantity = draft[item.id] ?? 0;
    return quantity ? [{ packageId: item.id, quantity, unitCost: item.bundle_price }] : [];
  });
}

/*
 * TODO(backend): replace this local draft boundary when ps_core adds lead line-item writes:
 * POST   /api/v1/admin/leads/{lead_id}/line-items/            { package_id, quantity }
 * PATCH  /api/v1/admin/leads/{lead_id}/line-items/{item_id}/ { quantity }
 * DELETE /api/v1/admin/leads/{lead_id}/line-items/{item_id}/
 * Each mutation should return the refreshed Lead, including authoritative totals.
 */
