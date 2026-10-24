import { adminApi } from "@/lib/api/endpoints";
import type { AdminDashboardSummary } from "@/types/api";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [payload, allBookings, completedBookings, activeTechnicians, activeAssigned, activeEnRoute, activeInProgress] = await Promise.all([
    adminApi.getDashboardSummary(),
    adminApi.listBookings({ page: 1, page_size: 1 }),
    adminApi.listBookings({ page: 1, page_size: 1, status: "COMPLETED" }),
    adminApi.listTechnicians({ include_inactive: false, is_active: true, verification: "VERIFIED", availability_status: "AVAILABLE" }),
    adminApi.listBookings({ page: 1, page_size: 100, status: "TECHNICIAN_ASSIGNED" }),
    adminApi.listBookings({ page: 1, page_size: 100, status: "TECHNICIAN_EN_ROUTE" }),
    adminApi.listBookings({ page: 1, page_size: 100, status: "IN_PROGRESS" }),
  ]);

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
    totalBookings: allBookings.count,
    completedJobs: completedBookings.count,
    activeTechnicians: activeTechnicians.length,
    totalRevenue: Number(payload.revenue_today),
    activeNowBookings: [...activeAssigned.results, ...activeEnRoute.results, ...activeInProgress.results].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    bookingsThisMonth: payload.bookings_this_month,
  };
}
