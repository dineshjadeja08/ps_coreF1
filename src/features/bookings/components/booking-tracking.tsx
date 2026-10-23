import Image from "next/image";
import { CheckCircle2, Circle, FileText } from "lucide-react";

import type { Booking, BookingCompletionPhoto } from "@/types/api";

function statusTime(booking: Booking, statuses: string[]) {
  const found = booking.status_history.find((entry) => statuses.includes(entry.to_status));
  return found?.created_at ?? null;
}

function fmt(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("en-IN") : "";
}

export function getBookingStepLabel(booking: Pick<Booking, "booking_status">) {
  const labels: Partial<Record<Booking["booking_status"], string>> = {
    TECHNICIAN_ASSIGNED: "Assigned",
    TECHNICIAN_EN_ROUTE: "On the way",
    TECHNICIAN_ARRIVED: "Arrived",
    IN_PROGRESS: "Started",
    COMPLETED: "Completed",
    CLOSED: "Completed",
  };
  return labels[booking.booking_status] ?? booking.booking_status.replaceAll("_", " ");
}

export function BookingJourney({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const stages = [
    { label: "Assigned", when: statusTime(booking, ["TECHNICIAN_ASSIGNED"]), done: Boolean(booking.assigned_technician || ["TECHNICIAN_ASSIGNED", "TECHNICIAN_EN_ROUTE", "TECHNICIAN_ARRIVED", "IN_PROGRESS", "COMPLETED", "CLOSED"].includes(booking.booking_status)) },
    { label: "Accepted", when: booking.accepted_at, done: Boolean(booking.accepted_at) },
    { label: "On the way", when: statusTime(booking, ["TECHNICIAN_EN_ROUTE"]), done: ["TECHNICIAN_EN_ROUTE", "TECHNICIAN_ARRIVED", "IN_PROGRESS", "COMPLETED", "CLOSED"].includes(booking.booking_status) },
    { label: "Arrived", when: booking.arrived_at ?? statusTime(booking, ["TECHNICIAN_ARRIVED"]), done: Boolean(booking.arrived_at || ["TECHNICIAN_ARRIVED", "IN_PROGRESS", "COMPLETED", "CLOSED"].includes(booking.booking_status)) },
    { label: "OTP verified", when: statusTime(booking, ["START_OTP_VERIFIED", "OTP_VERIFIED"]), done: Boolean(booking.start_otp_verified) },
    { label: "Started", when: statusTime(booking, ["IN_PROGRESS"]), done: ["IN_PROGRESS", "COMPLETED", "CLOSED"].includes(booking.booking_status) },
    { label: "Completed", when: booking.completed_at ?? statusTime(booking, ["COMPLETED", "CLOSED"]), done: ["COMPLETED", "CLOSED"].includes(booking.booking_status) },
  ];
  const activeIndex = stages.reduce((latest, stage, index) => stage.done ? index : latest, -1);
  return <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
    <h3 className="font-bold text-slate-950">Job progress</h3>
    <ol className={`mt-4 ${compact ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}`}>
      {stages.map((stage, index) => <li key={stage.label} className="flex items-start gap-3">
        <span className={`mt-0.5 ${stage.done ? "text-emerald-600" : "text-slate-300"}`}>{stage.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}</span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3"><div><p className={`text-sm font-semibold ${stage.done ? "text-slate-950" : "text-slate-400"}`}>{stage.label}{index === activeIndex && !stages[stages.length - 1].done ? <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">Current</span> : null}</p>{stage.when ? <p className="mt-0.5 text-xs text-slate-500">{fmt(stage.when)}</p> : null}</div></div>
      </li>)}
    </ol>
  </section>;
}

export function CompletionProof({ photos }: { photos: BookingCompletionPhoto[] }) {
  const groups: Array<{ kind: BookingCompletionPhoto["kind"]; label: string }> = [{ kind: "BEFORE", label: "Before" }, { kind: "AFTER", label: "After" }, { kind: "RECEIPT", label: "Receipt" }];
  return <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
    <h3 className="font-bold text-slate-950">Completion proof</h3>
    <div className="mt-4 grid gap-4 md:grid-cols-3">{groups.map((group) => {
      const items = photos.filter((photo) => photo.kind === group.kind);
      return <div key={group.kind}><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{group.label} ({items.length})</h4>{items.length ? <div className="grid grid-cols-2 gap-2">{items.map((photo) => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="relative aspect-square overflow-hidden rounded-lg bg-slate-100" aria-label={`Open ${group.label.toLowerCase()} proof image`}><Image src={photo.url} alt={`${group.label} service proof`} fill unoptimized sizes="160px" className="object-cover" /></a>)}</div> : group.kind === "RECEIPT" ? <p className="flex items-center gap-2 text-sm text-slate-400"><FileText className="h-4 w-4" />No receipt uploaded</p> : <p className="text-sm text-slate-400">No {group.label.toLowerCase()} photos uploaded</p>}</div>;
    })}</div>
  </section>;
}
