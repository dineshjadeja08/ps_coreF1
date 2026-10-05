import { CheckCircle2, Circle, Phone } from "lucide-react";

import { getJobProgress } from "@/features/bookings/job-progress";
import { formatDisplayDateTime, getBookingStatusLabel } from "@/features/bookings/utils";
import type { Booking } from "@/types/api";

export function JobProgressTracker({ booking }: { booking: Booking }) {
  const steps = getJobProgress(booking);
  const technician = booking.assigned_technician;
  return (
    <section className="rounded-md border border-border bg-surface p-6 shadow-sm" aria-label="Service progress">
      <h2 className="text-xl font-bold text-foreground">Track your service</h2>
      <p className="mt-2 text-sm font-semibold text-primary" role="status">{getBookingStatusLabel(booking.booking_status)}</p>
      {technician ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary-soft p-4">
          <div><p className="text-xs text-secondary">Your assigned technician</p><p className="font-semibold">{technician.name}</p></div>
          <a className="flex items-center gap-2 text-sm font-semibold text-primary" href={`tel:${technician.phone}`}><Phone className="h-4 w-4" />Call technician</a>
        </div>
      ) : <p className="mt-4 text-sm text-secondary">Technician details will appear once your booking is assigned.</p>}
      <ol className="mt-5 grid gap-4 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.status} aria-current={step.current ? "step" : undefined} className={`flex gap-3 ${step.reached ? "text-primary" : "text-secondary"}`}>
            {step.reached ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0" />}
            <div><p className={step.current ? "font-bold" : "font-medium"}>{step.label}</p>{step.timestamp ? <p className="mt-1 text-xs text-secondary">{formatDisplayDateTime(step.timestamp)}</p> : null}</div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-secondary">Status updates come from your technician. This is not live GPS tracking.</p>
    </section>
  );
}
