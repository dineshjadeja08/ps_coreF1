"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks";
import { normalizeIndianPhone } from "@/features/auth/schema";
import type { OtpDeliveryChannel } from "@/types/api";

const adminLoginSchema = z.object({
  phone: z.string().min(10, "Enter the staff mobile number."),
  password: z.string().min(8, "Enter your administrator password."),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

function canEnterAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function AdminLoginForm() {
  const router = useRouter();
  const { startAdminMfa, completeAdminMfa } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState<OtpDeliveryChannel>("WHATSAPP");
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { phone: "", password: "" },
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
      const challenge = await startAdminMfa(phone, values.password, channel);
      setChallengeId(challenge.challenge_id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not login to admin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId || !/^\d{4,8}$/.test(otp)) {
      setMessage("Enter the OTP sent to your staff mobile number.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      const user = await completeAdminMfa(challengeId, otp);
      if (!canEnterAdmin(user.role)) throw new Error("This account is not an active admin staff account.");
      router.replace("/admin/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify administrator MFA.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (challengeId) {
    return (
      <form onSubmit={verifyMfa} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-100 text-violet-700"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Verify administrator</h1>
            <p className="mt-1 text-sm text-slate-500">Enter the one-time code sent via {channel === "WHATSAPP" ? "WhatsApp" : "SMS"}.</p>
          </div>
        </div>
        <Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="Enter OTP" aria-label="Administrator OTP" />
        <Button type="submit" className="mt-5 w-full bg-violet-700 hover:bg-violet-800" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Verify and sign in
        </Button>
        <button type="button" className="mt-3 w-full text-sm font-semibold text-violet-700" onClick={() => { setChallengeId(null); setOtp(""); setMessage(""); }}>Start again</button>
        {message ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p> : null}
      </form>
    );
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

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-800">Password</span>
        <Input type="password" autoComplete="current-password" className="mt-2" {...form.register("password")} />
      </label>
      {form.formState.errors.password ? <p className="mt-2 text-sm text-red-700">{form.formState.errors.password.message}</p> : null}

      <div className="mt-4">
        <span className="text-sm font-semibold text-slate-800">Send verification code via</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["WHATSAPP", "SMS"] as const).map((option) => (
            <Button key={option} type="button" variant={channel === option ? "default" : "outline"} onClick={() => setChannel(option)}>
              {option === "WHATSAPP" ? "WhatsApp" : "SMS"}
            </Button>
          ))}
        </div>
      </div>

      <Button type="submit" className="mt-5 w-full bg-violet-700 hover:bg-violet-800" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send verification code
      </Button>

      {message ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p> : null}
    </form>
  );
}
