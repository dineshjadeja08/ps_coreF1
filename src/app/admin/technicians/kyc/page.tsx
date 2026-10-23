import type { Metadata } from "next";

import { AdminPartnerKycScreen } from "@/features/admin/components/admin-partner-kyc-screen";

export const metadata: Metadata = { title: "Partner KYC · Admin" };

export default function AdminPartnerKycPage() {
  return <AdminPartnerKycScreen />;
}
