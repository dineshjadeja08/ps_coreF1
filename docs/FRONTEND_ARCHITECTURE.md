# Purple Squad Customer Frontend Architecture

## Phase 1 Scope

- Next.js App Router with TypeScript and Tailwind CSS.
- shadcn-compatible component setup using Radix primitives, `class-variance-authority`, and shared `cn`.
- TanStack Query provider at the root layout.
- Global Purple Squad theme tokens in `src/app/globals.css`.
- Customer app shell with header, mobile search bar, mobile bottom navigation, footer, and prepared routes.
- API client primitives, endpoint map, query keys, API error mapper, token storage helpers, and contract-aligned starter types.
- Phase 3 auth foundation with Firebase phone OTP, Django token exchange, session restoration, protected route guards, automatic JWT refresh, and logout.
- Phase 4 address foundation with saved-address list, add/edit/delete, pincode serviceability checks, and booking-entry address handoff.
- Phase 5 scheduling foundation with selected service summary, address selection, serviceability re-check, date selection, slot API integration, slot selection, and review handoff.
- Phase 6 booking review and creation with server-side booking POST, backend-authoritative snapshots/pricing, duplicate-submit protection, conflict recovery, and a Phase 7 payment handoff route.
- Phase 7 Razorpay advance payment with backend-created orders, Razorpay Checkout, Django verification, booking refetch/reconciliation, and reload-safe success state.
- Phase 8 My Bookings list/detail with snapshot-based summaries, backend statuses, payment state, and status timeline.
- Phase 9 customer booking actions with cancel/reschedule controls, policy-aware status gating, fresh slot selection, and backend conflict/error handling.
- Phase 10 completed-booking review form with rating/comment submission and backend duplicate/completion rule handling.

## Project Structure

```text
src/app                  App Router routes
src/components/ui        shadcn-style primitives
src/components/layout    Header, footer, mobile navigation, brand
src/components/common    Shared customer UI pieces
src/features             Feature modules for later phases
src/features/auth        Phone OTP, Django token exchange, auth provider, route guards
src/features/addresses   Address CRUD, validation, serviceability checks, address cards/forms
src/features/bookings    Booking draft shell, step indicator, date selector, scheduling flow, review/create API, list/detail screens, action mutations, status helpers
src/features/payments    Razorpay order/verify API, checkout loader/types, payment state helpers, payment and success screens
src/features/reviews     Completed booking review API, mutation, form, and review eligibility helpers
src/features/slots       Slot API, queries, grouping/formatting utilities
src/lib/api              API client, endpoint map, errors, query keys
src/lib/auth             Compatibility exports for centralized auth token helpers
src/lib/firebase         Firebase Web SDK initialization and OTP helpers
src/types                OpenAPI-aligned TypeScript types
src/config               Site and environment config
src/constants            Route constants
docs                     OpenAPI and implementation planning docs
```

## Prepared Routes

- `/`
- `/services`
- `/services/[slug]`
- `/book`
- `/book/review`
- `/book/pay/[bookingId]`
- `/booking-success/[bookingId]`
- `/bookings`
- `/bookings/[id]`
- `/profile`
- `/support`
- `/faq`
- `/privacy-policy`
- `/terms`
- `/cancellation-policy`
- `/login`

## Authentication

See `docs/AUTH_FLOW.md`.

Firebase Web SDK handles only phone OTP verification and Firebase ID token creation. Django remains authoritative for Purple Squad app sessions through `/api/v1/auth/firebase/`, `/api/v1/auth/refresh/`, `/api/v1/auth/me/`, and `/api/v1/auth/logout/`.

Protected requests call `apiRequest` with `{ auth: true }`. The API client attaches the bearer access token, refreshes once on `401`, and retries the original request. Protected route shells use `AuthGuard` and preserve the intended destination for post-login return.

## Addresses

Address management uses the OpenAPI-backed endpoints:

- `GET /api/v1/addresses/`
- `POST /api/v1/addresses/`
- `PATCH /api/v1/addresses/{id}/`
- `DELETE /api/v1/addresses/{id}/`
- `GET /api/v1/service-areas/check/?postal_code=...`

The profile page exposes saved address management. The `/book` shell preserves selected service context and lets authenticated customers prepare a serviceable address, but does not implement slots, booking creation, or payments.

## Scheduling

See `docs/BOOKING_FLOW.md`.

The `/book?service=<slug>` route loads the selected service, saved addresses, serviceability, and real available slots. Slots use:

```text
GET /api/v1/slots/?service_id=<uuid>&postal_code=<pincode>&date=<YYYY-MM-DD>
```

The booking draft state is URL-backed using safe identifiers only. Continuing sends customers to `/book/review` with `service`, `address`, `date`, and `slot` preserved.

## Booking Creation

The `/book/review` route revalidates the selected service, saved address, serviceability, and available slot before it allows booking creation. The create mutation calls:

```text
POST /api/v1/bookings/
```

Request fields are limited to the OpenAPI contract: `service_id`, `address_id`, `slot_id`, required `problem_description`, and optional `customer_notes`. The frontend does not send totals, advance amounts, balance amounts, service snapshots, or address snapshots.

After creation, the booking response becomes the source of truth. UI values for service, address, slot, `total_amount`, `advance_required`, `balance_due`, `booking_status`, and `payment_status` come from the created booking, not from current catalogue/address data. The review submit button is disabled while pending. OpenAPI does not document idempotency support, so ambiguous network/server failures are not automatically retried.

Successful booking creation redirects with `router.replace` to `/book/pay/[bookingId]`, which reloads the created booking by ID.

## Payments

The `/book/pay/[bookingId]` route fetches the booking before offering payment. It allows payment only when the backend booking is `PENDING_PAYMENT` and payment status is `UNPAID`.

The payment flow is:

```text
GET /api/v1/bookings/{id}/
POST /api/v1/bookings/{booking_id}/payments/order/
Razorpay Checkout
POST /api/v1/payments/verify/
GET /api/v1/bookings/{id}/
/booking-success/[bookingId]
```

Order creation sends no frontend amount. Checkout uses the backend order response fields: `provider_order_id`, `amount_paise`, `currency`, and `key_id`. The frontend-safe `NEXT_PUBLIC_RAZORPAY_KEY_ID` can act as fallback when the backend response does not include a key, but no secret is exposed.

The frontend does not treat the Razorpay callback as final success. It first sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to Django. After verification, it refetches the booking and displays the backend `booking_status`, `payment_status`, `advance_paid`, and `balance_due`.

If verification is ambiguous, the payment page enters a pending-confirmation state, disables duplicate payment attempts, and performs limited short-term booking refetching so webhook-based confirmation can be picked up.

## Booking Actions

The `/bookings/[id]` detail page exposes customer actions when backend-supported statuses allow them:

- Cancel: `PENDING_PAYMENT`, `CONFIRMED`, `TECHNICIAN_ASSIGNED`
- Reschedule: `CONFIRMED`, `TECHNICIAN_ASSIGNED`

Cancel calls `POST /api/v1/bookings/{id}/cancel/` with optional `notes`. Reschedule fetches fresh slots with `GET /api/v1/slots/?service_id=...&postal_code=...&date=...`, then calls `POST /api/v1/bookings/{id}/reschedule/` with `slot_id` and optional `notes`.

The backend remains authoritative for policy windows and conflicts. The frontend maps validation, permission, conflict, rate limit, and server failures into customer-facing messages and updates the booking cache only from the returned booking response.

## Reviews

Completed bookings show a review form on `/bookings/[id]`. The form submits:

```text
POST /api/v1/bookings/{booking_id}/review/
```

Request fields are `rating` from 1 to 5 and trimmed `comment`. The backend remains authoritative for completion eligibility and the one-review-per-booking rule.
