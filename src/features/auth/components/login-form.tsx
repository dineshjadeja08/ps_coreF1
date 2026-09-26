"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapBackendAuthError } from "@/features/auth/errors";
import { useAuth } from "@/features/auth/hooks";
import { customerAccessSchema, normalizeIndianPhone, type CustomerAccessFormValues } from "@/features/auth/schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithNameAndPhone, consumeReturnPath } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnTo = useMemo(() => searchParams.get("returnTo") || undefined, [searchParams]);
  const fallback = returnTo?.startsWith("/") ? returnTo : "/";
  const form = useForm<CustomerAccessFormValues>({
    resolver: zodResolver(customerAccessSchema),
    defaultValues: { name: "", phone: "" },
  });

  async function onSubmit(values: CustomerAccessFormValues) {
    const phone = normalizeIndianPhone(values.phone);
    if (!phone) {
      form.setError("phone", { message: "Enter a valid Indian mobile number." });
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await loginWithNameAndPhone(values.name.trim(), phone);
      router.replace(consumeReturnPath(fallback));
    } catch (error) {
      setMessage(mapBackendAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><UserRound className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Continue to Purple Squad</h1>
          <p className="mt-1 text-sm leading-6 text-secondary">Enter your name and mobile number to continue. No OTP or password is required.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="customer-name" className="text-sm font-semibold text-foreground">Name</label>
          <Input id="customer-name" autoComplete="name" placeholder="Your full name" className="mt-2 h-11" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
          {form.formState.errors.name ? <p className="mt-2 text-sm text-destructive" role="alert">{form.formState.errors.name.message}</p> : null}
        </div>
        <div>
          <label htmlFor="customer-phone" className="text-sm font-semibold text-foreground">Mobile number</label>
          <div className="mt-2 grid grid-cols-[72px_1fr] gap-2">
            <div className="grid h-11 place-items-center rounded-lg border border-border bg-muted text-sm font-semibold text-secondary">+91</div>
            <Input id="customer-phone" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className="h-11" aria-invalid={Boolean(form.formState.errors.phone)} {...form.register("phone")} />
          </div>
          {form.formState.errors.phone ? <p className="mt-2 text-sm text-destructive" role="alert">{form.formState.errors.phone.message}</p> : null}
        </div>
        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Continue
        </Button>
      </form>
      <p className="mt-4 text-xs leading-5 text-secondary">Your details are saved so we can keep your cart and contact you about the services you select.</p>
      {message ? <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{message}</p> : null}
    </div>
  );
}
