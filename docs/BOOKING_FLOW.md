# Purple Squad Booking Flow

Source of truth: `docs/openapi.yaml`

```text
Service
  ↓
Address
  ↓
Serviceability
  ↓
Date
  ↓
Slot
  ↓
Review
  ↓
POST Booking
  ↓
Backend Snapshot + Pricing
  ↓
Payment Pending
  ↓
Phase 7 Razorpay
```

## Phase 5 Scope

Implemented:

- Load selected service from `GET /api/v1/services/{slug}/`.
- Load saved addresses from `GET /api/v1/addresses/`.
- Re-check selected address pincode through `GET /api/v1/service-areas/check/?postal_code=...`.
- Select a date using URL-backed state.
- Fetch available slots through `GET /api/v1/slots/?service_id=...&postal_code=...&date=...`.
- Select one available slot.
- Preserve safe booking draft fields in the URL:
  - `service`
  - `address`
  - `date`
  - `slot`
- Continue to `/book/review?...` as a Phase 6 placeholder.

Not implemented in Phase 5:

- Booking creation
- Slot locking tied to booking creation
- Price snapshot
- Razorpay
- Booking confirmation

## Slot Contract

Endpoint:

```text
GET /api/v1/slots/
```

Required query parameters:

- `service_id`: service UUID
- `postal_code`: customer address postal code
- `date`: service date in `YYYY-MM-DD`

Response:

```text
TimeSlot[]
```

The frontend treats slot selection as advisory only. The backend must still lock and validate the slot during booking creation in Phase 6.

## Phase 6 Scope

Implemented:

- `/book/review` reads the URL-backed draft fields: `service`, `address`, `date`, and `slot`.
- Missing draft state shows: `Your booking details are incomplete. Please select your service, address and time again.`
- Review revalidates:
  - selected service through `GET /api/v1/services/{slug}/`
  - selected address ownership through `GET /api/v1/addresses/`
  - serviceability through `GET /api/v1/service-areas/check/?postal_code=...`
  - selected slot through `GET /api/v1/slots/?service_id=...&postal_code=...&date=...`
- Booking creation uses `POST /api/v1/bookings/`.
- The exact request fields are `service_id`, `address_id`, `slot_id`, required `problem_description`, and optional `customer_notes`.
- The frontend does not send `final_total`, `advance_amount`, `balance_amount`, service names, catalogue prices, or address snapshots.
- The created booking response is authoritative for `service`, `address_snapshot`, `time_slot`, `total_amount`, `advance_required`, `balance_due`, `booking_status`, and `payment_status`.
- Booking and payment statuses are displayed separately.
- A `409` create response is treated as a slot conflict. The customer is returned to scheduling with `service`, `address`, and `date` preserved and stale `slot` removed.
- A successful create uses the backend booking `id` as the continuation key and redirects to `/book/pay/[bookingId]`.

## Phase 6 API Limitation

OpenAPI documents only the `201` success response for `POST /api/v1/bookings/`. It does not document idempotency support or structured conflict/error payloads. Phase 6 therefore uses client-side duplicate-submit prevention and status-based error mapping, and it avoids automatic retry when a network/server failure could have created a booking.

The public service detail schema does not expose an `is_active` field. If the backend needs the frontend to explicitly distinguish inactive services from other service retrieval failures, the smallest backend change is to document a customer-visible service availability field or a structured service-unavailable error.

## Phase 7 Scope

Implemented:

- `/book/pay/[bookingId]` reloads the booking before payment.
- Payment is allowed only for backend state `booking_status=PENDING_PAYMENT` and `payment_status=UNPAID`.
- The customer must click `Pay <advance>`; the page does not create Razorpay orders on load.
- Order creation uses:

```text
POST /api/v1/bookings/{booking_id}/payments/order/
```

Request body: none.

Response fields used: `payment_id`, `booking_id`, `provider_order_id`, `amount`, `amount_paise`, `currency`, `key_id`.

- Razorpay Checkout is loaded only on the payment page, after the customer starts payment.
- Checkout uses backend order amount and order id. The frontend does not send or override payment amount.
- Razorpay callback is treated only as proof to send to Django.
- Backend verification uses:

```text
POST /api/v1/payments/verify/
```

Request fields: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.

- After verification, the frontend refetches the booking and uses backend status/amounts only.
- `/booking-success/[bookingId]` reloads the booking and remains safe on refresh.
- Cancellation/failure states keep the customer on `/book/pay/[bookingId]` and allow retry only if the reloaded booking remains payable.
- Ambiguous verification enters a pending-confirmation state and performs limited short-term refetching for webhook reconciliation.

## Payment State Model

Frontend-only states:

```text
idle
creating_order
checkout_open
verifying
reconciling
success
cancelled
failed
pending_confirmation
```

These are UI states only. They do not replace backend `booking_status` or `payment_status`.

## Balance Due Semantics

Backend currently creates a booking with:

```text
balance_due = total_amount - advance_paid
```

Before advance payment, `advance_paid=0`, so `balance_due` equals the full unpaid total. After successful verification, the backend sets `advance_paid` to the advance amount and updates `balance_due` to the remaining amount after advance. The frontend displays these values exactly as returned.

## Webhook Reconciliation

The frontend does not process Razorpay webhooks. If checkout succeeds but frontend verification fails or times out, the payment page refetches the booking for a limited period. If the backend webhook confirms the payment, the refetch sees the confirmed booking and redirects to `/booking-success/[bookingId]`.

## Phase 8 Scope

Implemented:

- `/bookings` lists authenticated customer bookings from `GET /api/v1/bookings/`.
- `/bookings/[id]` loads one booking from `GET /api/v1/bookings/{id}/`.
- Service, address, schedule, amounts, booking status, payment status, and timeline use backend booking snapshots and status history.

## Phase 9 Scope

Implemented:

- Customer cancel action on `/bookings/[id]`.
- Customer reschedule action on `/bookings/[id]`.
- Cancel request:

```text
POST /api/v1/bookings/{id}/cancel/
```

Request fields:

- `notes` optional

- Reschedule request:

```text
POST /api/v1/bookings/{id}/reschedule/
```

Request fields:

- `slot_id` required
- `notes` optional

Reschedule slot selection fetches available slots using the booking service id and address snapshot postal code. The frontend only enables actions for backend-supported statuses, but the backend remains authoritative for policy windows, unavailable slots, and status conflicts.

## Phase 10 Scope

Implemented:

- Completed bookings show a rating/comment form on `/bookings/[id]`.
- Review request:

```text
POST /api/v1/bookings/{booking_id}/review/
```

Request fields:

- `rating` required, integer 1 to 5
- `comment` required, non-empty string

The frontend gates the form to `COMPLETED` bookings. The backend remains authoritative for completed-only review eligibility and one review per booking.
