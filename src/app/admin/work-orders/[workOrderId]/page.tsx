import type { Metadata } from "next";

import { AdminWorkOrderDetail } from "@/features/admin/components/admin-work-order-detail";

export const metadata: Metadata = { title: "Admin Work Order" };

export default async function AdminWorkOrderDetailPage({ params }: { params: Promise<{ workOrderId: string }> }) {
  const { workOrderId } = await params;
  return <AdminWorkOrderDetail workOrderId={workOrderId} />;
}
