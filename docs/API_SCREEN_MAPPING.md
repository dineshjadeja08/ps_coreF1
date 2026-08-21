# Purple Squad API to Screen Mapping

Source of truth: `docs/openapi.yaml`

## Customer-Facing Endpoints

| Area | Endpoint | Method | Auth | Primary screens |
| --- | --- | --- | --- | --- |
| Health | `/api/v1/health/` | GET | No | App boot checks, deployment smoke test |
| Auth | `/api/v1/auth/firebase/` | POST | No | Login, OTP verification handoff |
| Auth | `/api/v1/auth/refresh/` | POST | Refresh token | Session refresh |
| Auth | `/api/v1/auth/logout/` | POST | JWT | Profile, protected route logout |
| Auth | `/api/v1/auth/me/` | GET | JWT | Profile, header account state |
| Service areas | `/api/v1/service-areas/check/` | GET | No | Location selector, address serviceability |
| Categories | `/api/v1/service-categories/` | GET | No | Home, services listing |
| Services | `/api/v1/services/` | GET | No | Home, services listing, search results |
| Service detail | `/api/v1/services/{slug}/` | GET | No | Service detail |
| Service reviews | `/api/v1/services/{service_id}/reviews/` | GET | No | Service detail reviews |
| Addresses | `/api/v1/addresses/` | GET | JWT | Booking address step, profile addresses |
| Addresses | `/api/v1/addresses/` | POST | JWT | Add address |
| Addresses | `/api/v1/addresses/{id}/` | GET | JWT | Edit address |
| Addresses | `/api/v1/addresses/{id}/` | PATCH | JWT | Edit address |
| Addresses | `/api/v1/addresses/{id}/` | DELETE | JWT | Delete address |
| Slots | `/api/v1/slots/` | GET | No | Booking date and time step, reschedule |
| Bookings | `/api/v1/bookings/` | GET | JWT | My bookings |
| Bookings | `/api/v1/bookings/` | POST | JWT | Booking review/create step |
| Booking detail | `/api/v1/bookings/{id}/` | GET | JWT | Booking detail, success page |
| Booking cancel | `/api/v1/bookings/{id}/cancel/` | POST | JWT | Booking detail operations |
| Booking reschedule | `/api/v1/bookings/{id}/reschedule/` | POST | JWT | Reschedule flow |
| Payment order | `/api/v1/bookings/{booking_id}/payments/order/` | POST | JWT | Checkout payment step |
| Payment verify | `/api/v1/payments/verify/` | POST | JWT | Razorpay callback verification |
| Reviews | `/api/v1/bookings/{booking_id}/review/` | POST | JWT | Completed booking review |

## Admin and Non-Customer Endpoints

The OpenAPI contract includes admin booking/catalogue APIs and the Razorpay webhook endpoint. They are intentionally excluded from the customer frontend because this project is customer-only.

## Screen Mapping

| Screen | Route | Uses |
| --- | --- | --- |
| Home | `/` | `GET /api/v1/service-areas/check/`, `GET /api/v1/service-categories/`, `GET /api/v1/services/` |
| Services listing | `/services` | `GET /api/v1/service-categories/`, `GET /api/v1/services/` |
| Service detail | `/services/[slug]` | `GET /api/v1/services/{slug}/`, `GET /api/v1/services/{service_id}/reviews/`, `GET /api/v1/services/` for related services |
| Login | `/login` | Firebase client OTP, then `POST /api/v1/auth/firebase/` |
| Session restore | App provider | `GET /api/v1/auth/me/`, `POST /api/v1/auth/refresh/` on protected API `401` |
| Logout | Header/profile | `POST /api/v1/auth/logout/` |
| Booking shell | `/book` | selected service state, protected auth state |
| Booking address step | `/book` | `GET/POST/PATCH/DELETE /api/v1/addresses/`, `GET /api/v1/service-areas/check/` |
| Booking slot step | `/book` | `GET /api/v1/slots/?service_id=...&postal_code=...&date=...` |
| Booking review/create step | `/book/review` | `GET /api/v1/services/{slug}/`, `GET /api/v1/addresses/`, `GET /api/v1/service-areas/check/`, `GET /api/v1/slots/`, `POST /api/v1/bookings/` |
| Payment step | `/book/pay/[bookingId]` | `GET /api/v1/bookings/{id}/`, `POST /api/v1/bookings/{booking_id}/payments/order/`, Razorpay Checkout, `POST /api/v1/payments/verify/` |
| Booking success | `/booking-success/[bookingId]` | `GET /api/v1/bookings/{id}/` |
| My bookings | `/bookings` | `GET /api/v1/bookings/` |
| Booking detail/actions | `/bookings/[id]` | `GET /api/v1/bookings/{id}/`, `POST /api/v1/bookings/{id}/cancel/`, `POST /api/v1/bookings/{id}/reschedule/`, `GET /api/v1/slots/` for reschedule choices |
| Review | completed booking detail CTA | `POST /api/v1/bookings/{booking_id}/review/` |
| Profile | `/profile` | `GET /api/v1/auth/me/`, `GET /api/v1/addresses/`, `POST /api/v1/auth/logout/` |
| Support | `/support` | No support ticket API in contract; show configured contact options only |
| FAQ/legal | `/faq`, `/privacy-policy`, `/terms`, `/cancellation-policy` | Static content/configuration |

## Contract Notes for Later Phases

- OTP entry is handled by Firebase on the client, while the backend accepts only a Firebase `id_token`.
- Booking creation requires `service_id`, `address_id`, `slot_id`, and `problem_description`.
- Booking creation sends only the documented request fields: `service_id`, `address_id`, `slot_id`, required `problem_description`, and optional `customer_notes`.
- Booking creation response fields used in Phase 6: `id`, `booking_number`, `service`, `address_snapshot`, `service_date`, `time_slot`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `advance_required`, `advance_paid`, `balance_due`, `balance_collected`, `booking_status`, and `payment_status`.
- Booking status enum: `PENDING_PAYMENT`, `PAYMENT_FAILED`, `CONFIRMED`, `TECHNICIAN_ASSIGNED`, `TECHNICIAN_EN_ROUTE`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REFUND_PENDING`, `REFUNDED`.
- Payment status enum: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `FAILED`, `REFUNDED`.
- Backend booking response is authoritative for service snapshot, address snapshot, slot, pricing, advance, balance, booking status, and payment status.
- OpenAPI does not document an idempotency header/key for `POST /api/v1/bookings/`; the frontend prevents duplicate submits client-side and avoids automatic retry after ambiguous network/server failures.
- Payment is authoritative only after `POST /api/v1/payments/verify/`.
- Address required fields are `label`, `recipient_name`, `phone`, `address_line_1`, `city`, `state`, and `postal_code`.
- Slot UI must use backend `available_capacity`; unavailable slots should not be silently selectable.
- There is no customer support ticket endpoint in the contract.
- Firebase OTP is identity proof only; Purple Squad auth starts after Django returns access/refresh tokens from `/api/v1/auth/firebase/`.
- Phase 4 address management uses authenticated address CRUD and pincode serviceability checks only; slots and booking creation remain later phases.
- Phase 5 scheduling preserves `service`, `address`, `date`, and `slot` in URL state and hands off to `/book/review`; no booking is created yet.
- Phase 6 review revalidates the draft before creation. A `409` booking conflict is treated as a stale slot, clears only `slot`, and returns the customer to `/book` with service, address, and date preserved.
- Phase 7 order creation uses `POST /api/v1/bookings/{booking_id}/payments/order/` with no request body. Response fields used: `payment_id`, `booking_id`, `provider_order_id`, `amount`, `amount_paise`, `currency`, and `key_id`.
- Phase 7 verification uses `POST /api/v1/payments/verify/` with `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. Verification response fields used: `payment_id`, `booking_id`, `payment_status`, and `booking_status`; the frontend then reloads the booking and trusts the booking response.
- `balance_due` means total amount still unpaid before advance payment. After successful verification, backend updates `advance_paid` and sets `balance_due = total_amount - advance_paid`.
- Phase 9 cancel uses `POST /api/v1/bookings/{id}/cancel/` with optional `notes`.
- Phase 9 reschedule uses `POST /api/v1/bookings/{id}/reschedule/` with required `slot_id` and optional `notes`. Slot choices are fetched using the booking response service id and address snapshot postal code.
- Phase 10 review uses `POST /api/v1/bookings/{booking_id}/review/` with required `rating` from 1 to 5 and required `comment`. Backend allows only completed bookings and one review per booking.
