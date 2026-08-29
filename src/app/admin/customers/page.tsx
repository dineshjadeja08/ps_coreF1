import type { Metadata } from "next";

import { AdminCustomersScreen } from "@/features/admin/components/admin-live-backlog-screens";

export const metadata: Metadata = { title: "Admin Customers" };

export default function AdminCustomersPage() {
  return <AdminCustomersScreen />;
}
