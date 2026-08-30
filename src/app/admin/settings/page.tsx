import type { Metadata } from "next";

import { AdminSettingsScreen } from "@/features/admin/components/admin-system-screens";

export const metadata: Metadata = { title: "Admin Settings" };

export default function AdminSettingsPage() {
  return <AdminSettingsScreen />;
}
