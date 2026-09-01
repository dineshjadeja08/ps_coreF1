"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/config/env";
import { backendAuthApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks";
import { mapBackendAuthError, mapOtpAuthError } from "@/features/auth/errors";
import {
  maskPhone,
  normalizeIndianPhone,
  otpSchema,
  passwordLoginSchema,
  passwordSignupSchema,
  phoneLoginSchema,
  type OtpFormValues,
  type PasswordLoginFormValues,
  type PasswordSignupFormValues,
  type PhoneLoginFormValues,
} from "@/features/auth/schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithOtp, loginWithPassword, signupWithPassword, loginWithDevPhone, consumeReturnPath } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [step, setStep] = useState<"password" | "phone" | "otp" | "success">("password");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const phoneForm = useForm<PhoneLoginFormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: "" },
  });
  const passwordLoginForm = useForm<PasswordLoginFormValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phone: "", password: "" },
  });
  const passwordSignupForm = useForm<PasswordSignupFormValues>({
    resolver: zodResolver(passwordSignupSchema),
    defaultValues: { phone: "", password: "", firstName: "", lastName: "", email: "" },
  });
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const returnTo = useMemo(() => searchParams.get("returnTo") || undefined, [searchParams]);
  const canUseDevLogin = env.devPhoneLogin.enabled && Boolean(env.devPhoneLogin.phone);
  const isBusy = isSending || isVerifying;
  const fallback = returnTo && returnTo.startsWith("/") ? returnTo : "/";

  function chooseMode(nextMode: "login" | "signup" | "otp") {
    setMode(nextMode);
    setStep(nextMode === "otp" ? "phone" : "password");
    setMessage("");
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function sendOtp(phone: string) {
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      phoneForm.setError("phone", { message: "Enter a valid Indian mobile number." });
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      await backendAuthApi.sendOtp(normalized);
      setNormalizedPhone(normalized);
      setCooldown(30);
      setStep("otp");
      otpForm.reset({ otp: "" });
    } catch (error) {
      setMessage(mapOtpAuthError(error));
    } finally {
      setIsSending(false);
    }
  }

  async function verifyOtp(values: OtpFormValues) {
    if (!normalizedPhone) {
      setMessage("Please request a new OTP.");
      setStep("phone");
      return;
    }

    setIsVerifying(true);
    setMessage("");

    try {
      await loginWithOtp(normalizedPhone, values.otp);
      setStep("success");
      router.replace(consumeReturnPath(fallback));
    } catch (error) {
      setMessage(mapOtpAuthError(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function passwordLogin(values: PasswordLoginFormValues) {
    const normalized = normalizeIndianPhone(values.phone);
    if (!normalized) {
      passwordLoginForm.setError("phone", { message: "Enter a valid Indian mobile number." });
      return;
    }

    setIsVerifying(true);
    setMessage("");
    try {
      await loginWithPassword(normalized, values.password);
      setStep("success");
      router.replace(consumeReturnPath(fallback));
    } catch (error) {
      setMessage(mapBackendAuthError(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function passwordSignup(values: PasswordSignupFormValues) {
    const normalized = normalizeIndianPhone(values.phone);
    if (!normalized) {
      passwordSignupForm.setError("phone", { message: "Enter a valid Indian mobile number." });
      return;
    }

    setIsVerifying(true);
    setMessage("");
    try {
      await signupWithPassword({
        phone_number: normalized,
        password: values.password,
        first_name: values.firstName || "",
        last_name: values.lastName || "",
        email: values.email || "",
      });
      setStep("success");
      router.replace(consumeReturnPath(fallback));
    } catch (error) {
      setMessage(mapBackendAuthError(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function devLogin() {
    const normalized = normalizeIndianPhone(env.devPhoneLogin.phone || phoneForm.getValues("phone"));
    if (!normalized) {
      phoneForm.setError("phone", { message: "Development login is not configured." });
      return;
    }

    setIsSending(true);
    setMessage("");
    try {
      await loginWithDevPhone(normalized);
      router.replace(consumeReturnPath(fallback));
    } catch (error) {
      setMessage(mapBackendAuthError(error));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-soft text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Purple Squad</h1>
          <p className="mt-1 text-sm leading-6 text-secondary">Create an account or login with your mobile number.</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 rounded-lg bg-muted p-1 text-sm font-semibold">
        <button
          type="button"
          className={`rounded-md px-3 py-2 ${mode === "login" ? "bg-surface text-foreground shadow-sm" : "text-secondary"}`}
          onClick={() => chooseMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-2 ${mode === "signup" ? "bg-surface text-foreground shadow-sm" : "text-secondary"}`}
          onClick={() => chooseMode("signup")}
        >
          Create
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-2 ${mode === "otp" ? "bg-surface text-foreground shadow-sm" : "text-secondary"}`}
          onClick={() => chooseMode("otp")}
        >
          OTP
        </button>
      </div>

      {step === "password" && mode === "login" ? (
        <form onSubmit={passwordLoginForm.handleSubmit(passwordLogin)} className="space-y-4">
          <div>
            <label htmlFor="password-login-phone" className="text-sm font-semibold text-foreground">
              Mobile number
            </label>
            <div className="mt-2 grid grid-cols-[72px_1fr] gap-2">
              <div className="grid h-11 place-items-center rounded-lg border border-border bg-muted text-sm font-semibold text-secondary">+91</div>
              <Input
                id="password-login-phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                aria-invalid={Boolean(passwordLoginForm.formState.errors.phone)}
                {...passwordLoginForm.register("phone")}
              />
            </div>
            {passwordLoginForm.formState.errors.phone ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {passwordLoginForm.formState.errors.phone.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-login-password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <Input
              id="password-login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              className="mt-2"
              aria-invalid={Boolean(passwordLoginForm.formState.errors.password)}
              {...passwordLoginForm.register("password")}
            />
            {passwordLoginForm.formState.errors.password ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {passwordLoginForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={isBusy}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Login
          </Button>
        </form>
      ) : null}

      {step === "password" && mode === "signup" ? (
        <form onSubmit={passwordSignupForm.handleSubmit(passwordSignup)} className="space-y-4">
          <div>
            <label htmlFor="password-signup-phone" className="text-sm font-semibold text-foreground">
              Mobile number
            </label>
            <div className="mt-2 grid grid-cols-[72px_1fr] gap-2">
              <div className="grid h-11 place-items-center rounded-lg border border-border bg-muted text-sm font-semibold text-secondary">+91</div>
              <Input
                id="password-signup-phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                aria-invalid={Boolean(passwordSignupForm.formState.errors.phone)}
                {...passwordSignupForm.register("phone")}
              />
            </div>
            {passwordSignupForm.formState.errors.phone ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {passwordSignupForm.formState.errors.phone.message}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="signup-first-name" className="text-sm font-semibold text-foreground">
                First name
              </label>
              <Input id="signup-first-name" autoComplete="given-name" className="mt-2" {...passwordSignupForm.register("firstName")} />
            </div>
            <div>
              <label htmlFor="signup-last-name" className="text-sm font-semibold text-foreground">
                Last name
              </label>
              <Input id="signup-last-name" autoComplete="family-name" className="mt-2" {...passwordSignupForm.register("lastName")} />
            </div>
          </div>
          <div>
            <label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
              Email
            </label>
            <Input id="signup-email" type="email" autoComplete="email" placeholder="Optional" className="mt-2" {...passwordSignupForm.register("email")} />
            {passwordSignupForm.formState.errors.email ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {passwordSignupForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-signup-password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <Input
              id="password-signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="mt-2"
              aria-invalid={Boolean(passwordSignupForm.formState.errors.password)}
              {...passwordSignupForm.register("password")}
            />
            {passwordSignupForm.formState.errors.password ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {passwordSignupForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={isBusy}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create account
          </Button>
        </form>
      ) : null}

      {step === "phone" ? (
        <form onSubmit={phoneForm.handleSubmit((values) => sendOtp(values.phone))} className="space-y-4">
          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-foreground">
              Mobile number
            </label>
            <div className="mt-2 grid grid-cols-[72px_1fr] gap-2">
              <div className="grid h-11 place-items-center rounded-lg border border-border bg-muted text-sm font-semibold text-secondary">+91</div>
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                aria-invalid={Boolean(phoneForm.formState.errors.phone)}
                {...phoneForm.register("phone")}
              />
            </div>
            {phoneForm.formState.errors.phone ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {phoneForm.formState.errors.phone.message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-secondary">We&apos;ll send a one-time verification code.</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send OTP
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold text-primary"
            onClick={() => {
              setStep("phone");
              setMessage("");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Change phone number
          </button>
          <div>
            <label htmlFor="otp" className="text-sm font-semibold text-foreground">
              Enter verification code
            </label>
            <p className="mt-1 text-sm text-secondary">We&apos;ve sent a 6 digit code to {maskPhone(normalizedPhone)}.</p>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="mt-3 text-center text-lg tracking-[0.45em]"
              aria-invalid={Boolean(otpForm.formState.errors.otp)}
              {...otpForm.register("otp")}
            />
            {otpForm.formState.errors.otp ? (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {otpForm.formState.errors.otp.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify OTP
          </Button>
          <Button type="button" variant="ghost" className="w-full" disabled={cooldown > 0 || isSending} onClick={() => sendOtp(normalizedPhone)}>
            {cooldown > 0 ? `Resend code in 00:${String(cooldown).padStart(2, "0")}` : "Resend OTP"}
          </Button>
        </form>
      ) : null}

      {step === "success" ? <p className="text-sm text-success">Login successful. Taking you back...</p> : null}

      {canUseDevLogin ? (
        <div className="mt-5 rounded-lg border border-dashed border-primary/40 bg-primary-soft/40 p-3">
          <p className="text-sm font-semibold text-foreground">Developer access</p>
          <p className="mt-1 text-sm text-secondary">Use the local test profile without OTP.</p>
          <Button type="button" variant="secondary" className="mt-3 w-full" disabled={isBusy} onClick={devLogin}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue as dev user
          </Button>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}

    </div>
  );
}
