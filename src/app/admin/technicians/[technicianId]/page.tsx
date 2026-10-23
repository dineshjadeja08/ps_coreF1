import type { Metadata } from "next";

import { AdminTechnicianWorkspace } from "@/features/admin/components/admin-technician-workspace";

export const metadata: Metadata = { title: "Technician Workspace" };

export default async function TechnicianWorkspacePage({ params }: { params: Promise<{ technicianId: string }> }) {
  const { technicianId } = await params;
  return <AdminTechnicianWorkspace technicianId={technicianId} />;
}
