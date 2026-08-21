import { Suspense } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { BookingReviewShell } from "@/features/bookings/components/booking-review-shell";

export default function BookingReviewPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <BookingReviewShell />
      </AuthGuard>
    </Suspense>
  );
}
