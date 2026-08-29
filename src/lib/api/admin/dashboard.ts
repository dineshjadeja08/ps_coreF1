import { adminApi } from "@/lib/api/endpoints";
import type { AdminDashboardSummary } from "@/types/api";

function isToday(date: string) {
  return date === new Date().toISOString().slice(0, 10);
}

function isUpcoming(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const target = new Date(`${date}T00:00:00`);
  return target >= today && target <= nextWeek;
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [bookingPayload] = await Promise.all([
    adminApi.listBookings({ page_size: 50 }),
    adminApi.listCategories(),
    adminApi.listServices({ page_size: 50 }),
    adminApi.listTechnicians(),
  ]);

  const bookings = bookingPayload.results;
  const confirmed = bookings.filter((booking) => booking.booking_status === "CONFIRMED");
  const pendingPayments = bookings.filter((booking) => booking.payment_status === "UNPAID");
  const unassigned = bookings.filter(
    (booking) => ["CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(booking.booking_status) && !("assigned_technician" in booking),
  );

  return {
    leadsToday: null,
    followUpsDue: null,
    bookingsToday: bookings.filter((booking) => isToday(booking.created_at.slice(0, 10))).length,
    confirmedBookings: confirmed.length,
    paymentPendingBookings: pendingPayments.length,
    revenueToday: null,
    unassignedBookings: unassigned.length,
    upcomingServices: bookings.filter((booking) => isUpcoming(booking.service_date)).length,
    recentBookings: bookings.slice(0, 6),
    pendingPayments: pendingPayments.slice(0, 6),
    unassigned: unassigned.slice(0, 6),
    failedNotifications: [],
    missing: ["Lead metrics API", "Payments summary API", "Notifications API"],
  };
}
