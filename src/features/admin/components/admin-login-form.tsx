"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/config/env";
import { useAuth } from "@/features/auth/hooks";
import { normalizeIndianPhone } from "@/features/auth/schema";

const adminLoginSchema = z.object({
  phone: z.string().min(10, "Enter the staff mobile number."),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

function canEnterAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function AdminLoginForm() {
  const router = useRouter();
  const { loginWithDevPhone } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { phone: env.devPhoneLogin.phone || "" },
  });

  async function onSubmit(values: AdminLoginValues) {
    const phone = normalizeIndianPhone(values.phone);
    if (!phone) {
      form.setError("phone", { message: "Enter a valid Indian mobile number." });
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const user = await loginWithDevPhone(phone);
      if (!canEnterAdmin(user.role)) {
        setMessage("This account is not an active admin staff account.");
        return;
      }
      router.replace("/admin/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not login to admin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-100 text-violet-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">Use a backend staff account to enter the operations portal.</p>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Staff mobile number</span>
        <div className="mt-2 grid grid-cols-[72px_1fr] gap-2">
          <div className="grid h-11 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">+91</div>
          <Input inputMode="tel" autoComplete="tel" placeholder="96290 25814" {...form.register("phone")} />
        </div>
      </label>
      {form.formState.errors.phone ? <p className="mt-2 text-sm text-red-700">{form.formState.errors.phone.message}</p> : null}

      <Button type="submit" className="mt-5 w-full bg-violet-700 hover:bg-violet-800" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Continue to admin
      </Button>

      {message ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p> : null}
    </form>
  );
}
