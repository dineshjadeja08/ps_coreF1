"use client";

import { getUpcomingDates } from "@/features/slots/utils";
import { cn } from "@/lib/utils";

export function DateSelector({ selectedDate, onSelectDate }: { selectedDate: string; onSelectDate: (date: string) => void }) {
  const dates = getUpcomingDates(7);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {dates.map((date) => (
        <button
          key={date.value}
          type="button"
          aria-pressed={selectedDate === date.value}
          aria-label={`Select ${date.label} ${date.day}`}
          onClick={() => onSelectDate(date.value)}
          className={cn(
            "min-w-24 rounded-lg border px-4 py-3 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            selectedDate === date.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:bg-muted",
          )}
        >
          <span className="block">{date.label}</span>
          <span className="mt-1 block text-xs opacity-80">{date.day}</span>
        </button>
      ))}
    </div>
  );
}
