import type { User } from "@/types/api";

const groupRoutes: Record<string, string[]> = {
  "Operations Admin": ["/admin/dashboard", "/admin/leads", "/admin/customers", "/admin/bookings", "/admin/work-orders", "/admin/notifications", "/admin/technicians", "/admin/assignments", "/admin/service-areas", "/admin/scheduling", "/admin/reports"],
  "Customer Support": ["/admin/dashboard", "/admin/leads", "/admin/customers", "/admin/bookings", "/admin/notifications"],
  "Catalogue Manager": ["/admin/dashboard", "/admin/catalogue", "/admin/content/banners", "/admin/content/carousel"],
  Finance: ["/admin/dashboard", "/admin/bookings", "/admin/payments", "/admin/reports"],
  "Technician Coordinator": ["/admin/dashboard", "/admin/bookings", "/admin/work-orders", "/admin/technicians", "/admin/assignments", "/admin/scheduling"],
};

export function canAccessAdminPath(user: User | null | undefined, path: string) {
  if (!user || !user.is_verified) return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role !== "ADMIN") return false;
  if (path.startsWith("/admin/staff")) return false;
  const groups = user.groups ?? [];
  if (!groups.length || groups.some((group) => group.name === "Super Admin")) return true;
  return groups.some((group) => (groupRoutes[group.name] ?? []).some((prefix) => path === prefix || path.startsWith(`${prefix}/`)));
}
