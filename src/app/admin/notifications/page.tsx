import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Notifications" };

export default function AdminNotificationsPage() {
  return <AdminSectionPlaceholder title="Notifications" description="Message delivery status and retry operations." missing="Missing backend API: notifications list/retry/cancel/send." />;
}
