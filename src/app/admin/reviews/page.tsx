import type { Metadata } from "next";

import { AdminReviewsScreen } from "@/features/admin/components/admin-reviews-screen";

export const metadata: Metadata = { title: "Admin Reviews" };

export default function AdminReviewsPage() {
  return <AdminReviewsScreen />;
}
