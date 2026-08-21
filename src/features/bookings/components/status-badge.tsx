import { Badge } from "@/components/ui/badge";
import { getBookingStatusLabel, getPaymentStatusLabel } from "@/features/bookings/utils";

import type { BookingStatus, PaymentStatus } from "../types";

type StatusBadgeProps =
  | {
      type: "booking";
      status: BookingStatus;
    }
  | {
      type: "payment";
      status: PaymentStatus;
    };

export function StatusBadge(props: StatusBadgeProps) {
  const label = props.type === "booking" ? getBookingStatusLabel(props.status) : getPaymentStatusLabel(props.status);

  return (
    <Badge className={props.status === "CONFIRMED" || props.status === "PAID" ? "bg-success/10 text-success" : undefined}>
      {label}
    </Badge>
  );
}
