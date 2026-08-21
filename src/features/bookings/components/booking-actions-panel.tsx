"use client";

import { AlertTriangle, CalendarClock, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DateSelector } from "@/features/bookings/components/date-selector";
import { SlotPicker } from "@/features/bookings/components/slot-picker";
import { getCancelBookingErrorMessage, getRescheduleBookingErrorMessage } from "@/features/bookings/errors";
import { useCancelBooking, useRescheduleBooking } from "@/features/bookings/mutations";
import {
  canCustomerCancelBooking,
  canCustomerRescheduleBooking,
  getBookingPostalCode,
  getBookingServiceId,
  getBookingStatusLabel,
} from "@/features/bookings/utils";
import { useAvailableSlots } from "@/features/slots/queries";
import type { TimeSlot } from "@/features/slots/types";
import { getUpcomingDates } from "@/features/slots/utils";

import type { Booking } from "../types";

type BookingActionsPanelProps = {
  booking: Booking;
};

export function BookingActionsPanel({ booking }: BookingActionsPanelProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(getUpcomingDates(1)[0].value);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const cancelBooking = useCancelBooking();
  const rescheduleBooking = useRescheduleBooking();
  const serviceId = getBookingServiceId(booking);
  const postalCode = getBookingPostalCode(booking);
  const slots = useAvailableSlots(
    rescheduleOpen && serviceId && postalCode
      ? {
          serviceId,
          postalCode,
          date: selectedDate,
        }
      : null,
  );

  const canCancel = canCustomerCancelBooking(booking);
  const canReschedule = canCustomerRescheduleBooking(booking);
  const actionBusy = cancelBooking.isPending || rescheduleBooking.isPending;

  async function submitCancel() {
    setCancelError("");
    try {
      await cancelBooking.mutateAsync({
        bookingId: booking.id,
        body: { notes: cancelNotes.trim() },
      });
      setCancelOpen(false);
      setCancelNotes("");
    } catch (error) {
      setCancelError(getCancelBookingErrorMessage(error));
    }
  }

  async function submitReschedule() {
    if (!selectedSlot) return;
    setRescheduleError("");
    try {
      await rescheduleBooking.mutateAsync({
        bookingId: booking.id,
        body: {
          slot_id: selectedSlot.id,
          notes: rescheduleNotes.trim(),
        },
      });
      setRescheduleOpen(false);
      setSelectedSlot(null);
      setRescheduleNotes("");
    } catch (error) {
      setRescheduleError(getRescheduleBookingErrorMessage(error));
      await slots.refetch();
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-xl font-bold text-foreground">Booking actions</h2>
      <p className="mt-2 text-sm leading-6 text-secondary">
        Current status: <span className="font-semibold text-foreground">{getBookingStatusLabel(booking.booking_status)}</span>
      </p>

      <div className="mt-5 grid gap-3">
        <Button type="button" variant="outline" disabled={!canReschedule || actionBusy} onClick={() => setRescheduleOpen((open) => !open)}>
          <CalendarClock className="h-4 w-4" />
          Reschedule
        </Button>
        <Button type="button" variant="outline" disabled={!canCancel || actionBusy} onClick={() => setCancelOpen((open) => !open)}>
          <XCircle className="h-4 w-4" />
          Cancel booking
        </Button>
      </div>

      {!canReschedule && !canCancel ? (
        <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-secondary">No customer actions are available for this booking status.</p>
      ) : null}

      {cancelOpen ? (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">Cancel this booking?</h3>
              <p className="mt-1 text-sm leading-6 text-secondary">Cancellation is allowed only while the backend policy permits it.</p>
              <textarea
                value={cancelNotes}
                onChange={(event) => setCancelNotes(event.target.value)}
                placeholder="Optional reason"
                className="mt-3 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
              {cancelError ? <p className="mt-3 text-sm text-destructive">{cancelError}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={cancelBooking.isPending} onClick={() => setCancelOpen(false)}>
                  Keep booking
                </Button>
                <Button type="button" disabled={cancelBooking.isPending} onClick={submitCancel}>
                  {cancelBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirm cancellation
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {rescheduleOpen ? (
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <h3 className="font-semibold text-foreground">Choose a new slot</h3>
          {!serviceId || !postalCode ? (
            <p className="mt-3 text-sm text-destructive">This booking does not include enough snapshot data to reschedule online.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <DateSelector
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
              />
              <SlotPicker
                slots={slots.data ?? []}
                selectedSlotId={selectedSlot?.id}
                loading={slots.isLoading || slots.isFetching}
                error={slots.isError ? slots.error : undefined}
                onRetry={() => slots.refetch()}
                onSelectSlot={setSelectedSlot}
              />
              <textarea
                value={rescheduleNotes}
                onChange={(event) => setRescheduleNotes(event.target.value)}
                placeholder="Optional note"
                className="min-h-20 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
              {rescheduleError ? <p className="text-sm text-destructive">{rescheduleError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={rescheduleBooking.isPending} onClick={() => setRescheduleOpen(false)}>
                  Close
                </Button>
                <Button type="button" disabled={!selectedSlot || rescheduleBooking.isPending} onClick={submitReschedule}>
                  {rescheduleBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Confirm reschedule
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
