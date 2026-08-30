"use client";

import { RefreshCcw } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import type { TimeSlot } from "@/features/slots/types";
import { formatSlotTime, groupSlotsByDaypart, isSlotAvailable } from "@/features/slots/utils";
import { cn } from "@/lib/utils";

type SlotPickerProps = {
  slots: TimeSlot[];
  selectedSlotId?: string;
  loading?: boolean;
  error?: unknown;
  onRetry: () => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onClearDate?: () => void;
};

export function SlotPicker({ slots, selectedSlotId, loading, error, onRetry, onSelectSlot, onClearDate }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="We couldn't load available time slots" error={error} onRetry={onRetry} />;
  }

  if (!slots.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">No slots available for this date</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">Try another date to find an available technician visit.</p>
        {onClearDate ? (
          <Button type="button" variant="secondary" className="mt-5" onClick={onClearDate}>
            Choose another date
          </Button>
        ) : null}
      </div>
    );
  }

  const groups = groupSlotsByDaypart(slots);

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([daypart, items]) => (
        <div key={daypart}>
          <h3 className="mb-2 text-sm font-semibold text-foreground">{daypart}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((slot) => {
              const available = isSlotAvailable(slot);
              const selected = selectedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!available}
                  aria-pressed={selected}
                  aria-label={`Select ${formatSlotTime(slot.start_time)} to ${formatSlotTime(slot.end_time)}`}
                  onClick={() => onSelectSlot(slot)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
                    selected ? "border-slate-950 bg-slate-950 text-white shadow-[var(--shadow-soft)]" : "border-border bg-surface text-foreground hover:border-primary/30 hover:bg-primary-subtle",
                  )}
                >
                  <span className="block font-semibold">
                    {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)}
                  </span>
                  <span className="mt-1 block text-xs opacity-80">
                    {slot.available_capacity <= 2 && slot.available_capacity > 0 ? `${slot.available_capacity} left` : "Available"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCcw className="h-4 w-4" />
        Refresh slots
      </Button>
      {onClearDate ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClearDate}>
          Select another date
        </Button>
      ) : null}
    </div>
  );
}
