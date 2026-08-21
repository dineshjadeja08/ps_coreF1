import { Suspense } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { BookingsListScreen } from "@/features/bookings/components/bookings-list-screen";

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <BookingsListScreen />
      </AuthGuard>
    </Suspense>
  );
}
