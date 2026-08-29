import type { Metadata } from "next";

import { AdminNotificationsScreen } from "@/features/admin/components/admin-live-backlog-screens";

export const metadata: Metadata = { title: "Admin Notifications" };

export default function AdminNotificationsPage() {
  return <AdminNotificationsScreen />;
}
