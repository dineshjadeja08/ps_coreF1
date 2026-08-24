"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressSchema, emptyAddressValues, type AddressFormValues } from "@/features/addresses/schema";
import type { Address } from "@/features/addresses/types";
import { useAddressServiceability } from "@/features/addresses/queries";

type AddressFormProps = {
  initialAddress?: Address | null;
  submitting?: boolean;
  onSubmit: (values: AddressFormValues) => void;
  onCancel?: () => void;
};

function toFormValues(address?: Address | null): AddressFormValues {
  if (!address) return emptyAddressValues;
  return {
    label: address.label,
    recipient_name: address.recipient_name,
    phone: address.phone,
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2 ?? "",
    landmark: address.landmark ?? "",
    locality: address.locality ?? "",
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country ?? "India",
    is_default: address.is_default,
  };
}

export function AddressForm({ initialAddress, submitting, onSubmit, onCancel }: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: toFormValues(initialAddress),
  });
  const postalCode = useWatch({ control: form.control, name: "postal_code" });
  const serviceability = useAddressServiceability(postalCode?.trim() ?? "", Boolean(postalCode?.trim() && postalCode.trim().length >= 5));

  useEffect(() => {
    form.reset(toFormValues(initialAddress));
  }, [form, initialAddress]);

  const fields: Array<{ name: keyof AddressFormValues; label: string; placeholder: string; required?: boolean }> = [
    { name: "recipient_name", label: "Recipient name", placeholder: "Name", required: true },
    { name: "phone", label: "Phone", placeholder: "9876543210", required: true },
    { name: "address_line_1", label: "House / Street", placeholder: "House no, street", required: true },
    { name: "address_line_2", label: "Address line 2", placeholder: "Apartment, floor" },
    { name: "locality", label: "Area", placeholder: "Area / locality" },
    { name: "landmark", label: "Landmark", placeholder: "Nearby landmark" },
    { name: "city", label: "City", placeholder: "Chennai", required: true },
    { name: "state", label: "State", placeholder: "Tamil Nadu", required: true },
    { name: "postal_code", label: "Pincode", placeholder: "600001", required: true },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="label" className="text-sm font-semibold text-foreground">
            Address type
          </label>
          <select
            id="label"
            className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
            {...form.register("label")}
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {fields.slice(0, 2).map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-semibold text-foreground">
              {field.label}
            </label>
            <Input id={field.name} placeholder={field.placeholder} className="mt-2" {...form.register(field.name)} />
            {form.formState.errors[field.name] ? <p className="mt-1 text-sm text-destructive">{form.formState.errors[field.name]?.message}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.slice(2).map((field) => (
          <div key={field.name} className={field.name === "address_line_1" ? "sm:col-span-2" : undefined}>
            <label htmlFor={field.name} className="text-sm font-semibold text-foreground">
              {field.label}
            </label>
            <Input id={field.name} placeholder={field.placeholder} className="mt-2" {...form.register(field.name)} />
            {form.formState.errors[field.name] ? <p className="mt-1 text-sm text-destructive">{form.formState.errors[field.name]?.message}</p> : null}
          </div>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-secondary">
        <input type="checkbox" className="h-4 w-4 accent-primary" {...form.register("is_default")} />
        Set as default address
      </label>

      <div className="mt-4 min-h-6">
        {serviceability.isFetching ? (
          <p className="flex items-center gap-2 text-sm text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Checking serviceability...
          </p>
        ) : serviceability.data?.is_supported ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Purple Squad serves this pincode.
          </p>
        ) : serviceability.data && !serviceability.data.is_supported ? (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            This pincode is not serviceable yet.
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={submitting || serviceability.isFetching || serviceability.data?.is_supported === false}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initialAddress ? "Update address" : "Save address"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
