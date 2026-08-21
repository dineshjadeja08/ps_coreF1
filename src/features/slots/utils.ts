import type { TimeSlot } from "@/features/slots/types";

export function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getUpcomingDates(count = 7) {
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: toDateInput(date),
      label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString("en-IN", { weekday: "short" }),
      day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    };
  });
}

export function formatSlotTime(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function getSlotDaypart(slot: TimeSlot) {
  const hour = Number(slot.start_time.split(":")[0]);
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export function groupSlotsByDaypart(slots: TimeSlot[]) {
  return slots.reduce<Record<string, TimeSlot[]>>((groups, slot) => {
    const daypart = getSlotDaypart(slot);
    groups[daypart] = [...(groups[daypart] ?? []), slot];
    return groups;
  }, {});
}

export function isSlotAvailable(slot: TimeSlot) {
  return slot.available_capacity > 0;
}
