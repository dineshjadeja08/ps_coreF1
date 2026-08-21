# Purple Squad Frontend Auth Flow

Source of truth: `docs/openapi.yaml`

```text
Phone number
  ↓
Firebase Web SDK sends OTP
  ↓
Firebase verifies OTP
  ↓
Firebase returns ID token
  ↓
POST /api/v1/auth/firebase/ with { id_token }
  ↓
Django verifies Firebase token server-side
  ↓
Django returns Purple Squad user + JWT access/refresh tokens
  ↓
Frontend stores Purple Squad session and uses bearer access tokens
```

Firebase authentication alone is not Purple Squad application authentication. The app is authenticated only after Django token exchange succeeds.

## Backend Endpoints

- `POST /api/v1/auth/firebase/`: exchanges `{ id_token }` for `{ user, tokens, created }`.
- `POST /api/v1/auth/refresh/`: exchanges `{ refresh }` for a new `{ access }`.
- `GET /api/v1/auth/me/`: returns the authenticated user.
- `POST /api/v1/auth/logout/`: blacklists the submitted refresh token.

## Session Lifecycle

- Tokens and stored user state live in `src/features/auth/storage.ts`.
- Protected API requests use `apiRequest(..., { auth: true })`.
- On `401`, the API client attempts one refresh and retries the original request.
- Simultaneous `401` responses share a single refresh promise.
- Refresh failure clears local session state.
- App startup restores stored user state and confirms the session through `/api/v1/auth/me/`.
- Logout calls Django logout when possible and always clears local session state.

## Protected Routes

- `/book`
- `/bookings`
- `/bookings/[id]`
- `/profile`

Logged-out customers are redirected to `/login?returnTo=...`; after successful Django exchange they return to the preserved path.

## Environment

Frontend-safe Firebase web variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

Do not expose Firebase Admin credentials or Django secrets in the frontend.
