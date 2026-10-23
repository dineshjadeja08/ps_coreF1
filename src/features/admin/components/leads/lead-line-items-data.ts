import type { Lead, UUID } from "@/types/api";

export type LeadServiceDraft = Record<UUID, number>;

export function createLeadLineItemDraft(lead: Lead): LeadServiceDraft {
  const draft: LeadServiceDraft = {};
  for (const line of lead.line_items ?? []) draft[line.service_id] = line.quantity;
  if (!Object.keys(draft).length && lead.required_service) draft[lead.required_service] = 1;
  return draft;
}

export function updateLeadLineItemDraft(draft: LeadServiceDraft, serviceId: UUID, quantity: number): LeadServiceDraft {
  const next = { ...draft };
  if (quantity <= 0) delete next[serviceId];
  else next[serviceId] = quantity;
  return next;
}
