import type { Metadata } from "next";

import { TechnicianJobsScreen } from "@/features/technicians/components/technician-jobs-screen";

export const metadata: Metadata = {
  title: "Technician Jobs",
  robots: { index: false, follow: false },
};

export default function TechnicianJobsPage() {
  return <TechnicianJobsScreen />;
}
