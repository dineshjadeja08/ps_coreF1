import type { Metadata } from "next";

import { AdminPaymentsScreen } from "@/features/admin/components/admin-live-backlog-screens";

export const metadata: Metadata = { title: "Admin Payments" };

export default function AdminPaymentsPage() {
  return <AdminPaymentsScreen />;
}
