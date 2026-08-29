import type { Metadata } from "next";

import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <AdminLoginForm />
    </div>
  );
}
