import type { Metadata } from "next";

import { AdminReportsScreen } from "@/features/admin/components/admin-system-screens";

export const metadata: Metadata = { title: "Admin Reports" };

export default function AdminReportsPage() {
  return <AdminReportsScreen />;
}
