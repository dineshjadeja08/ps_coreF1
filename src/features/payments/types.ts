import type { Booking, PaymentOrder, PaymentVerifyRequest, PaymentVerifyResponse } from "@/types/api";

export type { PaymentOrder, PaymentVerifyRequest, PaymentVerifyResponse };

export type PaymentUiState =
  | "idle"
  | "creating_order"
  | "checkout_open"
  | "verifying"
  | "reconciling"
  | "success"
  | "cancelled"
  | "failed"
  | "pending_confirmation";

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

export type RazorpayCheckout = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
};

export type Payability = {
  canPay: boolean;
  alreadyPaid: boolean;
  pending: boolean;
  reason: string;
};

export type PaymentSummaryModel = {
  bookingReference: string;
  serviceName: string;
  schedule: string;
  address: string;
  totalAmount: string;
  advancePayable: string;
  advancePaid: string;
  balanceDue: string;
  bookingStatus: Booking["booking_status"];
  paymentStatus: Booking["payment_status"];
};
