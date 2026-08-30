"use client";

import { getUpcomingDates } from "@/features/slots/utils";
import { cn } from "@/lib/utils";

export function DateSelector({ selectedDate, onSelectDate }: { selectedDate: string; onSelectDate: (date: string) => void }) {
  const dates = getUpcomingDates(5);

  return (
    <div className="grid grid-cols-5 gap-2">
      {dates.map((date) => (
        <button
          key={date.value}
          type="button"
          aria-pressed={selectedDate === date.value}
          aria-label={`Select ${date.label} ${date.day}`}
          onClick={() => onSelectDate(date.value)}
          className={cn(
            "min-h-16 rounded-lg border px-2 py-2 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            selectedDate === date.value ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "border-border bg-surface text-foreground hover:border-primary/30 hover:bg-primary-subtle",
          )}
        >
          <span className="block">{date.label}</span>
          <span className="mt-1 block text-xs opacity-80">{date.day}</span>
        </button>
      ))}
    </div>
  );
}
