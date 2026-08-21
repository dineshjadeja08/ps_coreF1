import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to Purple Squad with phone OTP.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="rounded-lg border border-border bg-surface p-5 text-sm text-secondary">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
