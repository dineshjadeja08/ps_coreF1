import { slotApi } from "@/lib/api/endpoints";

import type { SlotQuery } from "./types";

export const slotsApi = {
  list: (query: SlotQuery) =>
    slotApi.list({
      service_id: query.serviceId,
      postal_code: query.postalCode,
      date: query.date,
    }),
};
