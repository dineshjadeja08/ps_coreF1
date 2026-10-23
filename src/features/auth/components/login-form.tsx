"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ConfirmationResult } from "firebase/auth";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapBackendAuthError } from "@/features/auth/errors";
import { useAuth } from "@/features/auth/hooks";
import { maskPhone, normalizeIndianPhone, otpSchema, phoneLoginSchema, type PhoneLoginFormValues } from "@/features/auth/schema";
import { clearPhoneVerifier, sendPhoneOtp, verifyPhoneOtp } from "@/lib/firebase/phone-auth";

const RESEND_DELAY_SECONDS = 60;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithFirebaseToken, consumeReturnPath } = useAuth();
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const returnTo = useMemo(() => searchParams.get("returnTo") || undefined, [searchParams]);
  const fallback = returnTo?.startsWith("/") ? returnTo : "/";
  const form = useForm<PhoneLoginFormValues>({ resolver: zodResolver(phoneLoginSchema), defaultValues: { phone: "" } });

  useEffect(() => () => clearPhoneVerifier(), []);

  useEffect(() => {
    if (!confirmation || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [confirmation, resendSeconds]);

  async function requestOtp(values: PhoneLoginFormValues) {
    const phone = normalizeIndianPhone(values.phone);
    if (!phone) {
      form.setError("phone", { message: "Enter a valid Indian mobile number." });
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      setConfirmation(await sendPhoneOtp(phone, "firebase-recaptcha"));
      setVerifiedPhone(phone);
      setResendSeconds(RESEND_DELAY_SECONDS);
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Could not send the OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendOtp() {
    if (!verifiedPhone || resendSeconds > 0 || isResending) return;
    setIsResending(true);
    setMessage("");
    try {
      setConfirmation(await sendPhoneOtp(verifiedPhone, "firebase-recaptcha"));
      setOtp("");
      setResendSeconds(RESEND_DELAY_SECONDS);
      setMessageKind("success");
      setMessage("A new OTP has been sent to your mobile number.");
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Could not resend the OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  async function confirmOtp() {
    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success || !confirmation) {
      setMessage(parsed.error?.issues[0]?.message || "Request an OTP first.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      const idToken = await verifyPhoneOtp(confirmation, parsed.data.otp);
      await loginWithFirebaseToken(idToken);
      router.replace(consumeReturnPath(fallback));
    } catch (error) {
      setMessageKind("error");
      setMessage(mapBackendAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Continue to Purple Squad</h1>
          <p className="mt-1 text-sm leading-6 text-secondary">Verify your mobile number with a secure SMS OTP.</p>
        </div>
      </div>

      {!confirmation ? (
        <form onSubmit={form.handleSubmit(requestOtp)} className="space-y-5">
          <div>
            <label htmlFor="customer-phone" className="text-sm font-semibold text-foreground">Mobile number</label>
            <div className="mt-2 grid grid-cols-[72px_1fr] gap-2">
              <div className="grid h-11 place-items-center rounded-lg border border-border bg-muted text-sm font-semibold text-secondary">+91</div>
              <Input id="customer-phone" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className="h-11" aria-invalid={Boolean(form.formState.errors.phone)} {...form.register("phone")} />
            </div>
            {form.formState.errors.phone ? <p className="mt-2 text-sm text-destructive" role="alert">{form.formState.errors.phone.message}</p> : null}
          </div>
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Send OTP
          </Button>
          <div id="firebase-recaptcha" className="flex min-h-0 justify-center" />
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-secondary">Enter the 6 digit code sent to {maskPhone(verifiedPhone)}.</p>
          <div>
            <label htmlFor="customer-otp" className="text-sm font-semibold text-foreground">OTP</label>
            <Input id="customer-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 h-11 tracking-[0.35em]" />
          </div>
          <Button type="button" className="h-11 w-full" disabled={isSubmitting || isResending} onClick={() => void confirmOtp()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Verify and continue
          </Button>
          <Button type="button" variant="outline" className="h-11 w-full" disabled={isSubmitting || isResending || resendSeconds > 0} onClick={() => void resendOtp()} aria-live="polite">
            {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isResending ? "Resending OTP..." : resendSeconds > 0 ? `Resend OTP in 00:${String(resendSeconds).padStart(2, "0")}` : "Resend OTP"}
          </Button>
          <div id="firebase-recaptcha" className="flex min-h-0 justify-center" />
          <Button type="button" variant="ghost" className="h-11 w-full" disabled={isSubmitting || isResending} onClick={() => { clearPhoneVerifier(); setConfirmation(null); setOtp(""); setMessage(""); setResendSeconds(0); }}>
            Use another number
          </Button>
        </div>
      )}
      {message ? <p className={`mt-4 rounded-lg p-3 text-sm ${messageKind === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`} role={messageKind === "success" ? "status" : "alert"}>{message}</p> : null}
    </div>
  );
}
