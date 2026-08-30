import type { Metadata } from "next";

import { AdminFaqsScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = { title: "Admin FAQs" };

export default function AdminFaqsPage() {
  return <AdminFaqsScreen />;
}
