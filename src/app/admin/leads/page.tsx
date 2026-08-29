import type { Metadata } from "next";

import { AdminLeadsScreen } from "@/features/admin/components/admin-live-backlog-screens";

export const metadata: Metadata = { title: "Admin Leads" };

export default function AdminLeadsPage() {
  return <AdminLeadsScreen />;
}
