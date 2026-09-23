"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  initialDate?: string | null;
  initialTime?: string;
  pending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (date: string, time: string) => void;
};

const times = Array.from({ length: 12 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);

export function LeadScheduleDialog({ open, initialDate, initialTime, pending, error, onOpenChange, onSubmit }: Props) {
  const [date, setDate] = useState(initialDate ?? "");
  const [time, setTime] = useState(initialTime ?? "");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between">
            <div><Dialog.Title className="text-xl font-black text-foreground">Schedule Job</Dialog.Title><Dialog.Description className="mt-1 text-sm text-secondary">Choose a service date and hourly arrival time.</Dialog.Description></div>
            <Dialog.Close className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted" aria-label="Close schedule dialog"><X className="h-5 w-5" /></Dialog.Close>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {nextDates().map((item) => <button key={item.value} type="button" onClick={() => setDate(item.value)} className={`min-h-11 min-w-20 rounded-lg border px-3 py-2 text-sm font-bold ${date === item.value ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{item.label}</button>)}
            <label className="min-w-36 rounded-lg border border-border px-3 py-2 text-xs font-bold">Select Custom<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block w-full bg-transparent" /></label>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {times.map((item) => <button key={item} type="button" onClick={() => setTime(item)} className={`min-h-11 rounded-md border px-2 py-2 text-sm font-semibold ${time === item ? "border-primary bg-primary-subtle text-primary" : "border-border"}`}>{formatTime(item)}</button>)}
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <Button type="button" className="mt-6 w-full rounded-full" disabled={!date || !time || pending} onClick={() => onSubmit(date, time)}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving</> : "Submit"}</Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function nextDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return { value: date.toISOString().slice(0, 10), label: new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric" }).format(date) };
  });
}

function formatTime(value: string) {
  const [hour] = value.split(":").map(Number);
  return `${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
}
