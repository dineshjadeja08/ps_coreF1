import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = {
  title: "Admin Assignments",
};

export default function AdminAssignmentsPage() {
  return (
    <AdminSectionPlaceholder
      title="Assignments"
      description="Dedicated technician assignment workspace."
      missing="Next backend/frontend pass: booking-specific eligible technician picker, assignment notes, and notification action UI."
    />
  );
}
