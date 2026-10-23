import { describe, expect, it } from "vitest";

import { getBookingRefreshInterval, getJobProgress, getTechnicianNextAction } from "@/features/bookings/job-progress";
import type { BookingStatus } from "@/types/api";

describe("technician job progress and customer tracking", () => {
  it("offers exactly the next action in sequence", () => {
    expect(getTechnicianNextAction("TECHNICIAN_ASSIGNED")?.operation).toBe("en-route");
    expect(getTechnicianNextAction("TECHNICIAN_EN_ROUTE")?.operation).toBe("arrived");
    expect(getTechnicianNextAction("TECHNICIAN_ARRIVED")?.operation).toBe("start");
    expect(getTechnicianNextAction("IN_PROGRESS")?.operation).toBe("complete");
  });

  it.each(["CONFIRMED", "PENDING_PAYMENT", "COMPLETED", "CLOSED", "CANCELLED", "REFUNDED"] as BookingStatus[])("offers no technician action for %s", (status) => {
    expect(getTechnicianNextAction(status)).toBeNull();
  });

  it("shows arrival as the current step without inventing a completion timestamp", () => {
    const steps = getJobProgress({ booking_status: "TECHNICIAN_ARRIVED", status_history: [
      { id: "arrival", from_status: "TECHNICIAN_EN_ROUTE", to_status: "TECHNICIAN_ARRIVED", notes: "", created_at: "2026-10-05T10:00:00Z" },
    ] });
    expect(steps.find((step) => step.current)?.status).toBe("TECHNICIAN_ARRIVED");
    expect(steps.find((step) => step.status === "TECHNICIAN_ARRIVED")?.timestamp).toBe("2026-10-05T10:00:00Z");
    expect(steps.find((step) => step.status === "COMPLETED")).toMatchObject({ reached: false, timestamp: undefined });
  });

  it("does not mark cancelled bookings as completed", () => {
    const steps = getJobProgress({ booking_status: "CANCELLED", status_history: [] });
    expect(steps.some((step) => step.current || step.reached)).toBe(false);
  });

  it("keeps closed jobs at the completed step", () => {
    expect(getJobProgress({ booking_status: "CLOSED", status_history: [] }).at(-1)).toMatchObject({ reached: true, current: true });
  });

  it("polls active bookings every 15 seconds, but stops at terminal statuses", () => {
    expect(getBookingRefreshInterval("TECHNICIAN_ARRIVED")).toBe(15_000);
    expect(getBookingRefreshInterval("IN_PROGRESS")).toBe(15_000);
    expect(getBookingRefreshInterval("COMPLETED")).toBe(false);
    expect(getBookingRefreshInterval("CANCELLED")).toBe(false);
  });
});
