import type { Booking, BookingStatus } from "@/types/api";

export const jobProgressSteps: { status: BookingStatus; label: string }[] = [
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "TECHNICIAN_ASSIGNED", label: "Technician assigned" },
  { status: "TECHNICIAN_EN_ROUTE", label: "On the way" },
  { status: "TECHNICIAN_ARRIVED", label: "Arrived" },
  { status: "IN_PROGRESS", label: "Service in progress" },
  { status: "COMPLETED", label: "Completed" },
];

export function getJobProgress(booking: Pick<Booking, "booking_status" | "status_history">) {
  const current = booking.booking_status === "CLOSED" ? "COMPLETED" : booking.booking_status;
  const currentIndex = jobProgressSteps.findIndex((step) => step.status === current);
  return jobProgressSteps.map((step, index) => {
    const history = [...booking.status_history].reverse().find((entry) => entry.to_status === step.status);
    return { ...step, reached: currentIndex >= index || Boolean(history), current: current === step.status, timestamp: history?.created_at };
  });
}

export function getTechnicianNextAction(status: BookingStatus) {
  if (status === "TECHNICIAN_ASSIGNED") return { label: "Start travelling", operation: "en-route" as const };
  if (status === "TECHNICIAN_EN_ROUTE") return { label: "I have arrived", operation: "arrived" as const };
  if (status === "TECHNICIAN_ARRIVED") return { label: "Start service", operation: "start" as const };
  if (status === "IN_PROGRESS") return { label: "Complete service", operation: "complete" as const };
  return null;
}

export function getBookingRefreshInterval(status?: BookingStatus) {
  return status && ["COMPLETED", "CLOSED", "CANCELLED", "REFUND_PENDING", "REFUNDED"].includes(status) ? false : 15_000;
}
