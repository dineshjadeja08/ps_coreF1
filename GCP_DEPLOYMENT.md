# Purple Squad frontend on Firebase App Hosting

Firebase App Hosting builds and runs this Next.js app on Google Cloud, provides
HTTPS, and supports the service worker required by Firebase Cloud Messaging.

## 1. Create the App Hosting backend

In Firebase Console for project `purplesquad`:

1. Open **Hosting & Serverless > App Hosting**.
2. Connect the GitHub repository `ps_coreF1`.
3. For staging, select branch `codex/gcp-deployment`.
4. Set the root directory to `/` because this repository contains the frontend
   at its root. If deploying from a combined monorepo later, use
   `/customer-frontend`.
5. Enable automatic rollouts.
6. Select the closest region offered by App Hosting.
7. Create the backend and wait for its `hosted.app` URL.

`apphosting.yaml` provides conservative initial runtime limits. Increase
`minInstances` to `1` only when reduced cold-start latency justifies the cost.

## 2. Configure production variables

In the App Hosting backend, add all variables below. `NEXT_PUBLIC_*` variables
must be available during the build as well as at runtime.

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-CLOUD-RUN-URL.run.app
NEXT_PUBLIC_APP_URL=https://YOUR-APP-HOSTING-URL.hosted.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=<production-or-controlled-test-key-id>

NEXT_PUBLIC_FIREBASE_API_KEY=<Firebase web API key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=purplesquad.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=purplesquad
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=purplesquad.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=769187270273
NEXT_PUBLIC_FIREBASE_APP_ID=<Firebase web app ID>
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<Web Push public certificate>
NEXT_PUBLIC_FIREBASE_AUTH_TEST_MODE=false

NEXT_PUBLIC_ENABLE_DEV_PHONE_LOGIN=false
```

Firebase web configuration and the VAPID public key are client identifiers, not
server credentials. Never add a Firebase Admin private key to App Hosting.

## 3. Firebase production configuration

1. Enable the Phone provider in Firebase Authentication.
2. Link the project to Cloud Billing and use the Blaze plan for real SMS.
3. Allow India in the SMS region policy.
4. Add the generated `hosted.app` hostname to Authentication authorized
   domains for staging.
5. Keep **App Check > Authentication** unenforced until App Check is integrated
   and verified by metrics.
6. Generate or confirm the Web Push certificate in **Project settings > Cloud
   Messaging** and use its public key as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

Do not test real web OTP on localhost. Use Firebase fictional phone numbers
locally and real OTP only from the HTTPS App Hosting or final production domain.

## 4. Acceptance test on the temporary domain

1. Open the `hosted.app` URL in a clean browser profile.
2. Complete a real Firebase phone login.
3. Confirm `/api/v1/auth/firebase-login/` returns Purple Squad JWTs.
4. Grant notification permission after login.
5. Confirm `/api/v1/devices/register/` returns `200`.
6. Create a booking and verify foreground push delivery.
7. Put the browser in the background and trigger payment confirmation,
   technician assignment, and status changes.
8. Click each push and confirm it opens `/bookings/<booking-id>`.
9. Confirm Google address search, Razorpay checkout, and Cloudinary images.

## 5. Production cutover

1. Connect `purplesquad.in` in App Hosting and follow the DNS records displayed
   by Firebase.
2. Add `purplesquad.in` to Firebase Authentication authorized domains.
3. Change `NEXT_PUBLIC_APP_URL` to `https://purplesquad.in`.
4. Change `NEXT_PUBLIC_API_BASE_URL` to `https://api.purplesquad.in` after the
   backend load balancer and certificate are ready.
5. Update the backend CORS and CSRF origins to the final domain.
6. Switch the App Hosting live branch from `codex/gcp-deployment` to `main`
   only after acceptance passes and the branch is merged.
7. Keep the previous production deployment available during the rollback
   window.

## Browser support note

Web push requires HTTPS, service-worker support, notification permission, and a
registered FCM token. Users who deny permission will not receive booking push
notifications. Native Android/iOS apps require their own Firebase platform
configuration in addition to this web deployment.
