import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Banners" };

export default function AdminBannersPage() {
  return <AdminSectionPlaceholder title="Homepage Banners" description="Homepage banner publishing." missing="Missing backend API: homepage banner list/create/update/delete/upload." />;
}
