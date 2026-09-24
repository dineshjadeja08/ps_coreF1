"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuth } from "@/features/auth/hooks";
import { AddressManager } from "@/features/addresses/components/address-manager";
import { ProfileForm } from "@/features/profile/components/profile-form";

function ProfileContent() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <section className="mx-auto max-w-6xl px-3 py-4 pb-28 sm:px-6 sm:py-8 sm:pb-12 lg:px-8 lg:py-10">
      <div className="mb-4 rounded-xl border border-border bg-primary-subtle p-4 sm:mb-6 sm:p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Account</p>
        <h1 className="mt-1.5 text-2xl font-bold text-foreground sm:mt-2 sm:text-3xl">Profile & saved addresses</h1>
        <p className="mt-2 text-sm leading-6 text-secondary">Manage your details, service addresses, support links, and session.</p>
      </div>
      <ProfileForm />
      <div className="mt-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:mt-8 sm:p-5">
        <AddressManager />
      </div>
      <Button type="button" variant="outline" className="mt-5 w-full sm:mt-8 sm:w-auto" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <ProfileContent />
      </AuthGuard>
    </Suspense>
  );
}
