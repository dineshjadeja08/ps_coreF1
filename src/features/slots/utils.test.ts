import { describe, expect, it } from "vitest";

import type { TimeSlot } from "@/features/slots/types";
import { formatSlotTime, getSlotDaypart, groupSlotsByDaypart, isSlotAvailable } from "@/features/slots/utils";

const slot = (overrides: Partial<TimeSlot>): TimeSlot => ({
  id: "slot-1",
  service_area: "area-1",
  date: "2026-08-21",
  start_time: "09:00:00",
  end_time: "10:00:00",
  capacity: 2,
  available_capacity: 2,
  ...overrides,
});

describe("slot utilities", () => {
  it("formats slot times", () => {
    expect(formatSlotTime("09:00:00")).toBe("9:00 am");
  });

  it("groups slots by daypart", () => {
    const groups = groupSlotsByDaypart([
      slot({ id: "morning", start_time: "09:00:00" }),
      slot({ id: "afternoon", start_time: "14:00:00" }),
      slot({ id: "evening", start_time: "18:00:00" }),
    ]);

    expect(Object.keys(groups)).toEqual(["Morning", "Afternoon", "Evening"]);
    expect(getSlotDaypart(slot({ start_time: "11:00:00" }))).toBe("Morning");
  });

  it("detects unavailable slots by capacity", () => {
    expect(isSlotAvailable(slot({ available_capacity: 1 }))).toBe(true);
    expect(isSlotAvailable(slot({ available_capacity: 0 }))).toBe(false);
  });
});
