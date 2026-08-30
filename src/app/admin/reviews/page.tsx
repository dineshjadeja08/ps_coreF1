import type { Metadata } from "next";

import { AdminReviewsScreen } from "@/features/admin/components/admin-system-screens";

export const metadata: Metadata = { title: "Admin Reviews" };

export default function AdminReviewsPage() {
  return <AdminReviewsScreen />;
}
