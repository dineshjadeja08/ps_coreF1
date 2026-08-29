import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin FAQs" };

export default function AdminFaqsPage() {
  return <AdminSectionPlaceholder title="FAQs" description="Service and category FAQ management." missing="Missing backend API: FAQ list/create/update/delete." />;
}
