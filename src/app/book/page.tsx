import { Suspense } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { BookingSchedulingShell } from "@/features/bookings/components/booking-scheduling-shell";

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <BookingSchedulingShell />
      </AuthGuard>
    </Suspense>
  );
}
