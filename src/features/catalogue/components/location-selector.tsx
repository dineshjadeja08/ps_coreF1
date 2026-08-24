"use client";

import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServiceAreaCheck } from "@/features/catalogue/queries";

const selectedPostalCodeKey = "purple_squad_postal_code";

export function LocationSelector() {
  const [postalCode, setPostalCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(selectedPostalCodeKey) ?? "";
  });
  const [submittedPostalCode, setSubmittedPostalCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(selectedPostalCodeKey) ?? "";
  });

  const serviceArea = useServiceAreaCheck(submittedPostalCode, submittedPostalCode.length > 0);

  useEffect(() => {
    if (serviceArea.data?.is_supported) {
      window.localStorage.setItem(selectedPostalCodeKey, serviceArea.data.postal_code);
    }
  }, [serviceArea.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = postalCode.trim();
    if (cleaned) {
      setSubmittedPostalCode(cleaned);
    }
  }

  const status = (() => {
    if (!submittedPostalCode) return null;
    if (serviceArea.isLoading || serviceArea.isFetching) {
      return (
        <p className="flex items-center gap-2 text-sm text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Checking availability...
        </p>
      );
    }
    if (serviceArea.isError) {
      return (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          We could not check this pincode. Please try again.
        </p>
      );
    }
    if (serviceArea.data?.is_supported) {
      return (
        <p className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Service available in {String(serviceArea.data.service_area?.city ?? serviceArea.data.postal_code)}.
        </p>
      );
    }
    return (
      <p className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="h-4 w-4" />
        Service is not available for this pincode yet.
      </p>
    );
  })();

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        Check service availability
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="service-postal-code">
          Enter pincode
        </label>
        <Input
          id="service-postal-code"
          inputMode="numeric"
          value={postalCode}
          onChange={(event) => setPostalCode(event.target.value)}
          placeholder="Enter pincode"
          className="sm:flex-1"
        />
        <Button type="submit" disabled={!postalCode.trim()}>
          Check
        </Button>
      </form>
      <div className="mt-3 min-h-5">{status ?? <p className="text-sm text-secondary">Select your area before choosing a service.</p>}</div>
    </div>
  );
}
