"use client";

import { AlertCircle, CheckCircle2, CreditCard, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { useAuth } from "@/features/auth/provider";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { useBooking } from "@/features/bookings/queries";
import { getOrderCreationErrorMessage, getVerificationErrorMessage, getCheckoutFailureMessage } from "@/features/payments/error-map";
import { useCreateAdvancePaymentOrder, useVerifyPayment } from "@/features/payments/mutations";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/features/payments/razorpay";
import type { PaymentUiState, RazorpaySuccessResponse } from "@/features/payments/types";
import { buildPaymentSummary, buildVerifyPaymentPayload, getBookingPayability, getCheckoutAmountLabel } from "@/features/payments/utils";

const maxReconcileAttempts = 6;

export function BookingPaymentHandoff({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const booking = useBooking(bookingId);
  const createOrder = useCreateAdvancePaymentOrder();
  const verifyPayment = useVerifyPayment();
  const [uiState, setUiState] = useState<PaymentUiState>("idle");
  const [message, setMessage] = useState("");
  const [reconcileAttempts, setReconcileAttempts] = useState(0);
  const paymentInFlight = useRef(false);
  const verificationInFlight = useRef(false);

  const payability = booking.data ? getBookingPayability(booking.data) : null;
  const summary = useMemo(() => (booking.data ? buildPaymentSummary(booking.data) : null), [booking.data]);
  const busy = uiState === "creating_order" || uiState === "checkout_open" || uiState === "verifying" || uiState === "reconciling";

  useEffect(() => {
    if (uiState !== "pending_confirmation" || reconcileAttempts >= maxReconcileAttempts) return;

    const timer = window.setTimeout(async () => {
      setUiState("reconciling");
      const result = await booking.refetch();
      if (result.data && getBookingPayability(result.data).alreadyPaid) {
        router.replace(routes.bookingSuccess(result.data.id));
        return;
      }
      setReconcileAttempts((current) => current + 1);
      setUiState("pending_confirmation");
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [booking, reconcileAttempts, router, uiState]);

  async function reconcileAfterVerificationIssue(error: unknown) {
    setMessage(getVerificationErrorMessage(error));
    setUiState("reconciling");
    const result = await booking.refetch();
    if (result.data && getBookingPayability(result.data).alreadyPaid) {
      router.replace(routes.bookingSuccess(result.data.id));
      return;
    }
    setReconcileAttempts(0);
    setUiState("pending_confirmation");
  }

  async function verifyCheckoutResponse(response: RazorpaySuccessResponse) {
    verificationInFlight.current = true;
    setUiState("verifying");
    setMessage("Verifying your payment...");

    try {
      await verifyPayment.mutateAsync(buildVerifyPaymentPayload(response));
      setUiState("reconciling");
      const result = await booking.refetch();
      if (result.data && getBookingPayability(result.data).alreadyPaid) {
        router.replace(routes.bookingSuccess(result.data.id));
        return;
      }
      setMessage("We're confirming your payment. Please don't make another payment.");
      setUiState("pending_confirmation");
    } catch (error) {
      await reconcileAfterVerificationIssue(error);
    } finally {
      verificationInFlight.current = false;
      paymentInFlight.current = false;
    }
  }

  async function startPayment() {
    if (!booking.data || !payability?.canPay || busy || paymentInFlight.current) return;

    paymentInFlight.current = true;
    setMessage("");
    setUiState("creating_order");

    try {
      const freshBooking = await booking.refetch();
      if (!freshBooking.data || !getBookingPayability(freshBooking.data).canPay) {
        setUiState("idle");
        setMessage("Payment already received or this booking can no longer accept payment.");
        paymentInFlight.current = false;
        return;
      }

      const order = await createOrder.mutateAsync(bookingId);
      const checkoutKey = order.key_id || env.razorpayKeyId;
      if (!checkoutKey) {
        throw new Error("Payment service couldn't be loaded.");
      }

      await loadRazorpayCheckout();
      setUiState("checkout_open");
      setMessage(`Secure checkout is ready for ${getCheckoutAmountLabel(order)}.`);

      const checkout = openRazorpayCheckout({
        key: checkoutKey,
        amount: order.amount_paise,
        currency: order.currency,
        name: "Purple Squad",
        description: `Advance payment for ${freshBooking.data.booking_number || freshBooking.data.id}`,
        order_id: order.provider_order_id,
        prefill: {
          name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || undefined,
          email: user?.email ?? undefined,
          contact: user?.phone_number ?? undefined,
        },
        theme: {
          color: "#6d28d9",
        },
        handler: (response) => {
          void verifyCheckoutResponse(response);
        },
        modal: {
          ondismiss: () => {
            if (verificationInFlight.current) return;
            paymentInFlight.current = false;
            setUiState("cancelled");
            setMessage("Payment wasn't completed. Your booking is still waiting for advance payment.");
          },
        },
      });

      checkout.on("payment.failed", () => {
        paymentInFlight.current = false;
        setUiState("failed");
        setMessage(getCheckoutFailureMessage());
        void booking.refetch();
      });
    } catch (error) {
      paymentInFlight.current = false;
      setUiState("failed");
      setMessage(error instanceof Error && error.message.includes("Payment service") ? error.message : getOrderCreationErrorMessage(error));
    }
  }

  if (booking.isLoading) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-4xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading booking...
        </p>
      </section>
    );
  }

  if (booking.isError) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="We could not load this booking" error={booking.error} onRetry={() => booking.refetch()} />
      </section>
    );
  }

  if (!booking.data || !summary || !payability) return null;

  const actionLabel = uiState === "creating_order" ? "Preparing secure payment..." : uiState === "verifying" ? "Verifying your payment..." : `Pay ${summary.advancePayable}`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <main className="rounded-md border border-border bg-surface p-6 shadow-sm">
          <CreditCard className="h-10 w-10 text-primary" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary">Complete Payment</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">{payability.alreadyPaid ? "Payment already completed" : "Pay your advance"}</h1>
          <p className="mt-2 text-secondary">
            {payability.alreadyPaid
              ? "Your advance payment is already recorded by Purple Squad."
              : "Razorpay Checkout will open only after you choose to pay."}
          </p>
          <p className="mt-4 rounded-md bg-primary-soft p-3 text-sm font-semibold text-primary">Secure payment powered by Razorpay</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Panel label="Booking" value={summary.bookingReference} />
            <Panel label="Service" value={summary.serviceName} />
            <Panel label="Scheduled Time" value={summary.schedule} />
            <Panel label="Address" value={summary.address} />
            <Panel label="Booking Total" value={summary.totalAmount} />
            <Panel label="Pay Now" value={summary.advancePayable} />
            <Panel label="Advance Paid" value={summary.advancePaid} />
            <Panel label="Balance Due" value={summary.balanceDue} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge type="booking" status={summary.bookingStatus} />
            <StatusBadge type="payment" status={summary.paymentStatus} />
          </div>
        </main>

        <aside className="rounded-md border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-foreground">Payment</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{payability.reason}</p>

          {uiState === "success" || payability.alreadyPaid ? (
            <div className="mt-5 rounded-md bg-success/10 p-4 text-sm text-success">
              <CheckCircle2 className="mb-2 h-5 w-5" />
              Payment already received.
            </div>
          ) : null}

          {uiState === "pending_confirmation" ? (
            <div className="mt-5 rounded-md bg-primary-soft p-4 text-sm leading-6 text-primary">
              <RefreshCw className="mb-2 h-5 w-5 animate-spin" />
              We&apos;re confirming your payment. Please don&apos;t make another payment. Your booking will update automatically once confirmed.
            </div>
          ) : null}

          {uiState === "cancelled" || uiState === "failed" ? (
            <div className="mt-5 rounded-md bg-destructive/10 p-4 text-sm leading-6 text-destructive">
              <AlertCircle className="mb-2 h-5 w-5" />
              {message}
            </div>
          ) : null}

          {message && !["cancelled", "failed"].includes(uiState) ? <p className="mt-5 rounded-md bg-muted p-3 text-sm text-secondary">{message}</p> : null}

          <Button type="button" className="mt-5 w-full" disabled={!payability.canPay || busy || uiState === "pending_confirmation"} onClick={startPayment}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {actionLabel}
          </Button>

          {payability.alreadyPaid ? (
            <Button asChild className="mt-3 w-full" variant="secondary">
              <Link href={routes.bookingSuccess(booking.data.id)}>View Booking</Link>
            </Button>
          ) : null}

          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => booking.refetch()}>
            Check booking status
          </Button>
        </aside>
      </div>
    </section>
  );
}

function Panel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
