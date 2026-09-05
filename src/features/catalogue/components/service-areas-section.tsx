"use client";

import { CheckCircle2, Loader2, MapPin, Search, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServiceAreaCheck } from "@/features/catalogue/queries";

const supportedCities = ["Chennai", "Bangalore", "Coimbatore"];

export function ServiceAreasSection() {
  const [postalCode, setPostalCode] = useState("");
  const [submittedPostalCode, setSubmittedPostalCode] = useState("");
  const serviceability = useServiceAreaCheck(submittedPostalCode, Boolean(submittedPostalCode));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedPostalCode(postalCode.trim());
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-md border border-border bg-surface p-5 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
        <SectionHeading
          eyebrow="Service areas"
          title="Currently serving three launch cities"
          description="Purple Squad is live in selected pincodes across Chennai, Bangalore and Coimbatore. More locations will be added as operations expand."
        />
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {supportedCities.map((city) => (
              <span key={city} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {city}
              </span>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label>
              <span className="sr-only">Check pincode</span>
              <Input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="Enter pincode, e.g. 600001" inputMode="numeric" />
            </label>
            <Button type="submit">
              {serviceability.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Check
            </Button>
          </form>
          <div className="min-h-6">
            {serviceability.data?.is_supported ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                This pincode is serviceable.
              </p>
            ) : serviceability.data && !serviceability.data.is_supported ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <XCircle className="h-4 w-4" />
                This pincode is not serviceable yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
