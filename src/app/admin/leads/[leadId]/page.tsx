import type { Metadata } from "next";

import { AdminLeadDetailScreen } from "@/features/admin/components/admin-live-backlog-screens";

export const metadata: Metadata = { title: "Admin Lead Detail" };

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  return <AdminLeadDetailScreen leadId={leadId} />;
}
