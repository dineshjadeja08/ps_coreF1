"use client";

import { useQuery } from "@tanstack/react-query";

import { slotsApi } from "@/features/slots/api";
import type { SlotQuery } from "@/features/slots/types";
import { queryKeys } from "@/lib/api/query-keys";

export function useAvailableSlots(query: SlotQuery | null) {
  return useQuery({
    queryKey: queryKeys.slots(query ?? {}),
    queryFn: () => slotsApi.list(query as SlotQuery),
    enabled: Boolean(query?.serviceId && query.postalCode && query.date),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}
