import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Reviews" };

export default function AdminReviewsPage() {
  return <AdminSectionPlaceholder title="Reviews" description="Review requests and moderation." missing="Missing backend API: review moderation, feature/hide decisions, review links." />;
}
