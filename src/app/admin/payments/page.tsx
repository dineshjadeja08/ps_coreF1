import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Payments" };

export default function AdminPaymentsPage() {
  return <AdminSectionPlaceholder title="Payments" description="Payment links, collections, refunds, and receipts." missing="Missing backend API: payment list, payment-link actions, refunds, offline verification." />;
}
