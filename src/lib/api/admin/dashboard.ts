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
  ]);
  const [leadPayload, paymentPayload, notificationPayload] = await Promise.all([
    adminApi.listLeads({ page_size: 50 }),
    adminApi.listPayments({ page_size: 50 }),
    adminApi.listNotifications({ page_size: 50, status: "FAILED" }),
  ]);

  const bookings = bookingPayload.results;
  const leads = leadPayload.results;
  const payments = paymentPayload.results;
  const confirmed = bookings.filter((booking) => booking.booking_status === "CONFIRMED");
  const pendingPayments = bookings.filter((booking) => booking.payment_status === "UNPAID");
  const unassigned = bookings.filter(
    (booking) => ["CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(booking.booking_status) && !("assigned_technician" in booking),
  );

  return {
    leadsToday: leads.filter((lead) => isToday(lead.created_at.slice(0, 10))).length,
    followUpsDue: leads.filter((lead) => lead.follow_up_at && new Date(lead.follow_up_at) <= new Date()).length,
    bookingsToday: bookings.filter((booking) => isToday(booking.created_at.slice(0, 10))).length,
    confirmedBookings: confirmed.length,
    paymentPendingBookings: pendingPayments.length,
    revenueToday: payments
      .filter((payment) => payment.status === "SUCCESS" && payment.paid_at && isToday(payment.paid_at.slice(0, 10)))
      .reduce((sum, payment) => sum + Number(payment.amount), 0),
    unassignedBookings: unassigned.length,
    upcomingServices: bookings.filter((booking) => isUpcoming(booking.service_date)).length,
    recentBookings: bookings.slice(0, 6),
    pendingPayments: pendingPayments.slice(0, 6),
    unassigned: unassigned.slice(0, 6),
    failedNotifications: notificationPayload.results,
    missing: ["Reports API", "Refund workflow API", "Review moderation API"],
  };
}
