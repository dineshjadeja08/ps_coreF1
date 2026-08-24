import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage Purple Squad catalogue, bookings, technicians, payments, and reviews.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
