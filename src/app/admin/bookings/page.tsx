import type { Metadata } from "next";

import { AdminBookingsScreen } from "@/features/admin/components/admin-bookings-screen";

export const metadata: Metadata = {
  title: "Admin Bookings",
};

export default function AdminBookingsPage() {
  return <AdminBookingsScreen />;
}
