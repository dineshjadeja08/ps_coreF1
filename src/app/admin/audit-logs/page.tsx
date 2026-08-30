import type { Metadata } from "next";

import { AdminAuditLogsScreen } from "@/features/admin/components/admin-system-screens";

export const metadata: Metadata = { title: "Admin Audit Logs" };

export default function AdminAuditLogsPage() {
  return <AdminAuditLogsScreen />;
}
