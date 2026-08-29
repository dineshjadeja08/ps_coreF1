import type { Metadata } from "next";

import { AdminDashboardHome } from "@/features/admin/components/admin-dashboard-home";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return <AdminDashboardHome />;
}
