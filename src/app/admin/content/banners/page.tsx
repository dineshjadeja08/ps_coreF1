import type { Metadata } from "next";

import { AdminBannersScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = { title: "Admin Banners" };

export default function AdminBannersPage() {
  return <AdminBannersScreen />;
}
