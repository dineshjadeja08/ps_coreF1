# Purple Squad Payment Flow

Source of truth: `docs/openapi.yaml`

```text
Booking PENDING_PAYMENT
        ↓
Create Razorpay Order
        ↓
Open Checkout
        ↓
Razorpay callback
        ↓
Backend verification
        ↓
Refetch booking
        ↓
CONFIRMED / PARTIALLY_PAID
```

## Endpoints

Create order:

```text
POST /api/v1/bookings/{booking_id}/payments/order/
```

Request body: none. The backend determines `amount`, `amount_paise`, `currency`, `provider_order_id`, and `key_id`.

Verify payment:

```text
POST /api/v1/payments/verify/
```

Request fields:

- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

The frontend never verifies the signature itself and never marks payment successful before Django verification and booking reload.

## Duplicate Payment Protection

The payment CTA is disabled while creating an order, checkout is open, verification is running, reconciliation is running, or confirmation is pending. Revisited paid bookings are detected from backend booking state and cannot start another checkout.

## Webhook Path

If frontend verification is interrupted, the backend may still receive the Razorpay webhook:

```text
Checkout success
        ↓
frontend verification fails
        ↓
Razorpay webhook reaches Django
        ↓
booking becomes confirmed
        ↓
frontend refetch sees confirmed status
```

The page uses limited polling during pending confirmation and then asks the customer to check booking status instead of making another payment immediately.
