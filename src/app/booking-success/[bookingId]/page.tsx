import { Suspense } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { BookingSuccessScreen } from "@/features/payments/components/booking-success-screen";

type BookingSuccessPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function BookingSuccessPage({ params }: BookingSuccessPageProps) {
  const { bookingId } = await params;

  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <BookingSuccessScreen bookingId={bookingId} />
      </AuthGuard>
    </Suspense>
  );
}
