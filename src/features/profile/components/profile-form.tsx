"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks";
import { profileSchema, type ProfileFormValues } from "@/features/profile/schema";
import { getFriendlyApiMessage } from "@/lib/api/errors";
import type { AuthUser } from "@/features/auth/types";

function toFormValues(user: AuthUser | null): ProfileFormValues {
  return {
    display_name: user?.customer_profile?.display_name ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    alternate_phone: user?.customer_profile?.alternate_phone ?? "",
  };
}

export function ProfileForm() {
  const { user, updateCurrentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  });

  useEffect(() => {
    form.reset(toFormValues(user));
  }, [form, user]);

  async function handleSubmit(values: ProfileFormValues) {
    setMessage("");
    setSaved(false);

    try {
      await updateCurrentUser({
        display_name: values.display_name,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        alternate_phone: values.alternate_phone,
      });
      setSaved(true);
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    }
  }

  const fields: Array<{ name: keyof ProfileFormValues; label: string; placeholder: string; type?: string }> = [
    { name: "display_name", label: "Display name", placeholder: "Name shown in Purple Squad" },
    { name: "first_name", label: "First name", placeholder: "First name" },
    { name: "last_name", label: "Last name", placeholder: "Last name" },
    { name: "email", label: "Email", placeholder: "you@example.com", type: "email" },
    { name: "alternate_phone", label: "Alternate phone", placeholder: "+919876543210" },
  ];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Account</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Profile details</h1>
          <p className="mt-2 text-sm text-secondary">Primary phone stays locked to the verified login number.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" />
          {user?.is_verified ? "Verified" : "Not verified"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone_number" className="text-sm font-semibold text-foreground">
            Login phone
          </label>
          <Input id="phone_number" value={user?.phone_number ?? ""} className="mt-2" readOnly />
        </div>
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-semibold text-foreground">
              {field.label}
            </label>
            <Input id={field.name} type={field.type ?? "text"} placeholder={field.placeholder} className="mt-2" {...form.register(field.name)} />
            {form.formState.errors[field.name] ? <p className="mt-1 text-sm text-destructive">{form.formState.errors[field.name]?.message}</p> : null}
          </div>
        ))}
      </div>

      {message ? <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{message}</p> : null}
      {saved ? <p className="mt-4 text-sm font-medium text-success">Profile saved.</p> : null}

      <Button type="submit" className="mt-5" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </Button>
    </form>
  );
}
