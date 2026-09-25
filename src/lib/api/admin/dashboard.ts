import { adminApi } from "@/lib/api/endpoints";
import type { AdminDashboardSummary } from "@/types/api";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const payload = await adminApi.getDashboardSummary();

  return {
    leadsToday: payload.leads_today,
    followUpsDue: payload.follow_ups_due,
    bookingsToday: payload.bookings_today,
    confirmedBookings: payload.confirmed_bookings,
    paymentPendingBookings: payload.payment_pending_bookings,
    revenueToday: Number(payload.revenue_today),
    unassignedBookings: payload.unassigned_bookings,
    upcomingServices: payload.upcoming_services,
    recentBookings: payload.recent_bookings,
    pendingPayments: payload.pending_payments,
    unassigned: payload.unassigned_items,
    failedNotifications: payload.failed_notifications,
    missing: [],
  };
}
