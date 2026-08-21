import { Suspense } from "react";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { BookingDetailScreen } from "@/features/bookings/components/booking-detail-screen";

type BookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <BookingDetailScreen bookingId={id} />
      </AuthGuard>
    </Suspense>
  );
}
