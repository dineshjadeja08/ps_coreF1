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
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <ProfileForm />
      <div className="mt-8">
        <AddressManager />
      </div>
      <Button type="button" variant="outline" className="mt-8" onClick={handleLogout}>
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
