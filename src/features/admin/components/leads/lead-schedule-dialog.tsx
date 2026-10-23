"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DateSelector } from "@/features/bookings/components/date-selector";
import { SlotPicker } from "@/features/bookings/components/slot-picker";
import { useAvailableSlots } from "@/features/slots/queries";
import type { TimeSlot } from "@/features/slots/types";
import { getUpcomingDates, isSlotAvailable } from "@/features/slots/utils";

type Props = {
  open: boolean;
  initialDate?: string | null;
  initialTime?: string;
  serviceId: string;
  pincode: string;
  pending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (date: string, time: string, slotId: string) => void;
};

export function LeadScheduleDialog({ open, initialDate, initialTime, serviceId, pincode, pending, error, onOpenChange, onSubmit }: Props) {
  const firstDate = getUpcomingDates(1)[0]?.value ?? "";
  const [date, setDate] = useState(() => initialDate || firstDate);
  const [slotId, setSlotId] = useState("");
  const slots = useAvailableSlots(open && serviceId && pincode ? { serviceId, postalCode: pincode, date } : null);
  const availableSlots = useMemo(() => (slots.data ?? []).filter(isSlotAvailable), [slots.data]);
  const initialStart = initialTime?.split("-", 1)[0].slice(0, 5);
  const selectedSlot = availableSlots.find((slot) => slot.id === slotId)
    ?? (date === initialDate ? availableSlots.find((slot) => slot.start_time.slice(0, 5) === initialStart) : undefined)
    ?? null;

  function submit(slot: TimeSlot) {
    onSubmit(date, slot.start_time.slice(0, 5), slot.id);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between">
            <div><Dialog.Title className="text-xl font-black text-foreground">Schedule Job</Dialog.Title><Dialog.Description className="mt-1 text-sm text-secondary">Choose an available date and time slot for this service address.</Dialog.Description></div>
            <Dialog.Close className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted" aria-label="Close schedule dialog"><X className="h-5 w-5" /></Dialog.Close>
          </div>
          {!serviceId || !pincode ? <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Select a service and a map-suggested address with a valid postal code before scheduling.</p> : <>
            <div className="mt-5"><DateSelector selectedDate={date} onSelectDate={(value) => { setDate(value); setSlotId(""); }} /></div>
            <div className="mt-5"><SlotPicker slots={slots.data ?? []} selectedSlotId={selectedSlot?.id ?? slotId} loading={slots.isLoading || slots.isFetching} error={slots.isError ? slots.error : undefined} onRetry={() => void slots.refetch()} onSelectSlot={(slot) => setSlotId(slot.id)} onClearDate={() => { setDate(firstDate); setSlotId(""); }} /></div>
          </>}
          {error ? <p role="alert" className="mt-3 text-sm text-red-600">{error}</p> : null}
          <Button type="button" className="mt-6 w-full rounded-full" disabled={!selectedSlot || pending} onClick={() => selectedSlot && submit(selectedSlot)}>{pending ? "Saving…" : "Confirm schedule"}</Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
