"use client";

import { FirebaseError } from "firebase/app";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { env } from "@/config/env";
import { getFirebaseAuth } from "@/lib/firebase/client";

let verifier: RecaptchaVerifier | null = null;

export async function sendPhoneOtp(phoneNumber: string, containerId: string) {
  const auth = getFirebaseAuth();
  auth.settings.appVerificationDisabledForTesting = env.firebase.authTestMode;

  if (env.firebase.authTestMode) {
    if (window.location.hostname !== "localhost") {
      throw new Error("Firebase Auth test mode is restricted to localhost.");
    }
  }

  clearPhoneVerifier();
  verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });

  try {
    await verifier.render();
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  } catch (error) {
    clearPhoneVerifier();
    if (error instanceof FirebaseError && error.code === "auth/invalid-app-credential") {
      throw new Error(
        "Firebase rejected the reCAPTCHA app verification. Check Firebase Auth reCAPTCHA/App Check enforcement and use http://localhost:3000 (not 127.0.0.1).",
      );
    }
    if (error instanceof FirebaseError && error.code === "auth/captcha-check-failed") {
      throw new Error(
        "Firebase could not validate the reCAPTCHA response. Reload the page and use http://localhost:3000. If Firebase Auth test mode is enabled, the phone number must be registered as a fictional test number in Firebase Console.",
      );
    }
    if (error instanceof FirebaseError && error.code === "auth/too-many-requests") {
      throw new Error(
        "Firebase has temporarily blocked additional OTP requests because too many attempts were made. Please wait before trying again, or use a configured fictional test phone number for local development.",
      );
    }
    throw error;
  }
}

export async function verifyPhoneOtp(confirmation: ConfirmationResult, code: string) {
  const credential = await confirmation.confirm(code);
  return credential.user.getIdToken(true);
}

export function clearPhoneVerifier() {
  verifier?.clear();
  verifier = null;
}
