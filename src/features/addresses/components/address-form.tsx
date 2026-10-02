"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LocateFixed, Loader2, MapPin, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectCurrentAddress, resolveAddressSuggestion, searchAddressSuggestions } from "@/features/addresses/location";
import { addressSchema, emptyAddressValues, type AddressFormValues } from "@/features/addresses/schema";
import type { Address } from "@/features/addresses/types";
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
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [selectingAddress, setSelectingAddress] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
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
    const query = searchQuery.trim();
    if (query.length < 3) return;

    let ignore = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddressSuggestions(query);
        if (!ignore) setSuggestions(results);
      } catch (error) {
        if (!ignore) {
          setSuggestions([]);
          setLocationError(true);
          setLocationMessage(error instanceof Error ? error.message : "Could not search for this address.");
        }
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  function applyAddress(detected: Awaited<ReturnType<typeof detectCurrentAddress>>) {
    const addressFields = [
      ["address_line_1", detected.address_line_1],
      ["locality", detected.locality],
      ["city", detected.city],
      ["state", detected.state],
      ["postal_code", detected.postal_code],
      ["country", detected.country],
    ] as const;

    addressFields.forEach(([name, value]) => {
      if (value) form.setValue(name, value, { shouldDirty: true, shouldValidate: true });
    });
    form.setValue("latitude", detected.latitude, { shouldDirty: true });
    form.setValue("longitude", detected.longitude, { shouldDirty: true });
  }

  async function detectAddress() {
    setDetectingLocation(true);
    setLocationMessage("");
    setLocationError(false);

    try {
      const detected = await detectCurrentAddress();
      applyAddress(detected);
      setLocationMessage("Location detected. Check the address details before saving.");
    } catch (error) {
      setLocationError(true);
      setLocationMessage(error instanceof Error ? error.message : "Could not detect your location. Enter the address manually.");
    } finally {
      setDetectingLocation(false);
    }
  }

  async function selectSuggestion(suggestion: AddressSuggestion) {
    setSelectingAddress(true);
    setSuggestions([]);
    setLocationMessage("");
    setLocationError(false);
    try {
      const resolved = await resolveAddressSuggestion(suggestion);
      applyAddress(resolved);
      setLocationMessage("Address selected. Check the details before saving.");
    } catch (error) {
      setLocationError(true);
      setLocationMessage(error instanceof Error ? error.message : "Could not use this address. Please search again.");
    } finally {
      setSelectingAddress(false);
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{initialAddress ? "Edit address" : "Add address"}</h3>
        <p className="mt-1 text-sm text-secondary">Use your current location or search for your service address.</p>
        <Button type="button" variant="outline" className="mt-3 h-12 w-full justify-start" onClick={() => void detectAddress()} disabled={detectingLocation || selectingAddress || submitting}>
          {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          {detectingLocation ? "Detecting location..." : "Detect my location"}
        </Button>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              const value = event.target.value;
              setSearchQuery(value);
              setLocationMessage("");
              if (value.trim().length < 3) setSuggestions([]);
            }}
            className="h-12 pl-10 pr-10"
            placeholder="Search for area, street or landmark"
            autoComplete="off"
            disabled={detectingLocation || selectingAddress || submitting}
          />
          {searching || selectingAddress ? <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" /> : null}
          {suggestions.length ? (
            <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
              {suggestions.map((suggestion) => (
                <button key={suggestion.id} type="button" className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-primary-subtle" onClick={() => void selectSuggestion(suggestion)}>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{suggestion.main_text}</span><span className="mt-0.5 block truncate text-xs text-secondary">{suggestion.secondary_text || suggestion.description}</span></span>
                </button>
              ))}
              <div className="border-t border-border px-3 py-2 text-right text-[10px] font-semibold text-muted-foreground">Powered by Google</div>
            </div>
          ) : null}
        </div>
        {locationMessage ? (
          <p className={`mt-2 text-sm ${locationError ? "text-destructive" : "text-success"}`} role={locationError ? "alert" : "status"}>
            {locationMessage}
          </p>
        ) : null}
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
        <Button type="submit" className="w-full sm:w-auto" disabled={submitting || serviceability.isFetching || serviceability.data?.is_supported === false}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initialAddress ? "Update address" : "Save address"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
