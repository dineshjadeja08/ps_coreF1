import { Suspense } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { BookingPaymentHandoff } from "@/features/bookings/components/booking-payment-handoff";

type BookingPaymentPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function BookingPaymentPage({ params }: BookingPaymentPageProps) {
  const { bookingId } = await params;

  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <BookingPaymentHandoff bookingId={bookingId} />
      </AuthGuard>
    </Suspense>
  );
}
