"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LocateFixed, Loader2, MapPin, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressSchema, emptyAddressValues, type AddressFormValues } from "@/features/addresses/schema";
import type { Address } from "@/features/addresses/types";
import { detectCurrentAddress, resolveAddressSuggestion, searchAddressSuggestions } from "@/features/addresses/location";
import { useAddressServiceability } from "@/features/addresses/queries";
import type { AddressSuggestion } from "@/types/api";

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
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    is_default: address.is_default,
  };
}

export function AddressForm({ initialAddress, submitting, onSubmit, onCancel }: AddressFormProps) {
  const [detecting, setDetecting] = useState(false);
  const [detectMessage, setDetectMessage] = useState("");
  const [detectFailed, setDetectFailed] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: toFormValues(initialAddress),
  });
  const postalCode = useWatch({ control: form.control, name: "postal_code" });
  const serviceability = useAddressServiceability(postalCode?.trim() ?? "", Boolean(postalCode?.trim() && postalCode.trim().length >= 5));

  useEffect(() => {
    form.reset(toFormValues(initialAddress));
  }, [form, initialAddress]);

  useEffect(() => {
    const query = addressQuery.trim();
    if (query.length < 3) return;

    let active = true;
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const results = await searchAddressSuggestions(query);
        if (active) setSuggestions(results);
      } catch {
        if (active) {
          setSuggestions([]);
          setSearchError("Address search is unavailable. You can still enter the address manually.");
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [addressQuery]);

  function applyDetectedAddress(values: Partial<AddressFormValues>) {
    for (const [name, value] of Object.entries(values)) {
      if (value !== "" && value !== null && value !== undefined) {
        form.setValue(name as keyof AddressFormValues, value, { shouldDirty: true, shouldValidate: true });
      }
    }
  }

  async function detectAddressFromLocation() {
    setDetecting(true);
    setDetectMessage("");
    setDetectFailed(false);
    try {
      const detected = await detectCurrentAddress();
      applyDetectedAddress(detected);
      setDetectMessage("Location detected. Check the address before saving.");
    } catch (error) {
      setDetectFailed(true);
      setDetectMessage(error instanceof Error ? error.message : "Location detection failed.");
    } finally {
      setDetecting(false);
    }
  }

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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{initialAddress ? "Edit address" : "Add address"}</h3>
        </div>
        <Button type="button" variant="outline" onClick={() => void detectAddressFromLocation()} disabled={detecting || submitting}>
          {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          {detectFailed ? "Retry location" : "Auto detect address"}
        </Button>
      </div>
      {detectMessage ? <p className={`mb-4 rounded-md p-3 text-sm ${detectFailed ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-primary"}`}>{detectMessage}</p> : null}
      <div className="relative mb-4">
        <label htmlFor="address-search" className="text-sm font-semibold text-foreground">Search address</label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="address-search"
            value={addressQuery}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setAddressQuery(nextQuery);
              if (nextQuery.trim().length < 3) {
                setSuggestions([]);
                setSearching(false);
                setSearchError("");
              }
            }}
            placeholder="Start typing your street, area or landmark"
            className="pl-9 pr-10"
            autoComplete="off"
          />
          {searching ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" /> : null}
        </div>
        {suggestions.length ? (
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-[var(--shadow-card)]" role="listbox" aria-label="Address suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={async () => {
                  setSearching(true);
                  const resolved = await resolveAddressSuggestion(suggestion);
                  applyDetectedAddress(resolved);
                  setAddressQuery("");
                  setSuggestions([]);
                  setSearching(false);
                  setDetectFailed(false);
                  setDetectMessage("Address selected. Check the details before saving.");
                }}
                className="flex w-full gap-3 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-primary-soft focus-visible:bg-primary-soft focus-visible:outline-none"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{suggestion.main_text}</span>
                  <span className="mt-0.5 block truncate text-xs text-secondary">{suggestion.secondary_text || suggestion.description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {searchError ? <p className="mt-2 text-sm text-destructive">{searchError}</p> : null}
      </div>
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
