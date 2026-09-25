"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LocateFixed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectCurrentAddress } from "@/features/addresses/location";
import { LeadAddressCombobox } from "@/features/admin/components/leads/lead-address-combobox";
import { LeadServiceCombobox } from "@/features/admin/components/leads/lead-service-combobox";
import { extractPincode, leadCreateSchema, normalizeIndianMobile, type LeadCreateValues } from "@/features/admin/components/leads/lead-utils";
import { adminApi } from "@/lib/api/endpoints";

const emptyForm: LeadCreateValues = {
  customer_name: "", primary_mobile: "", required_service: "", city: "", address: "", pincode: "", latitude: "", longitude: "",
};

export function AdminLeadCreateScreen() {
  const router = useRouter();
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showPincode, setShowPincode] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const deferredServiceSearch = useDeferredValue(serviceSearch.trim());
  const services = useQuery({
    queryKey: ["admin", "service-options", deferredServiceSearch],
    queryFn: () => adminApi.listServices({ page_size: 20, search: deferredServiceSearch || undefined }),
    staleTime: 2 * 60_000,
  });
  const form = useForm<LeadCreateValues>({ resolver: zodResolver(leadCreateSchema), defaultValues: emptyForm, mode: "onChange" });
  const addressValue = useWatch({ control: form.control, name: "address" });
  const pincodeValue = useWatch({ control: form.control, name: "pincode" });
  const create = useMutation({
    mutationFn: (values: LeadCreateValues) => adminApi.createLead({
      customer_name: values.customer_name.trim(), primary_mobile: normalizeIndianMobile(values.primary_mobile),
      required_service: values.required_service, city: values.city.trim(), address: values.address.trim(), pincode: values.pincode.trim(),
      source: "ONCALL", status: "NEW", funnel_status: "VISITED", payment_status: "NOT_REQUIRED",
    }),
    onSuccess: (lead) => router.push(`/admin/leads/${lead.id}`),
  });

  async function detectAddress() {
    setDetecting(true);
    setLocationError("");
    try {
      const value = await detectCurrentAddress();
      form.setValue("address", value.address_line_1 || value.locality || "", { shouldDirty: true, shouldValidate: true });
      form.setValue("city", value.city || "", { shouldDirty: true, shouldValidate: true });
      form.setValue("pincode", value.postal_code || "", { shouldDirty: true, shouldValidate: true });
      form.setValue("latitude", value.latitude, { shouldDirty: true });
      form.setValue("longitude", value.longitude, { shouldDirty: true });
      setShowPincode(!value.postal_code);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Location could not be detected.");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Create Request</h1>
      <form id="create-lead-form" className="mx-auto mt-7 w-full max-w-[760px] flex-1 space-y-5 pb-28" onSubmit={form.handleSubmit((values) => create.mutate(values))}>
        <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-7">
          <div className="grid gap-6 sm:grid-cols-2">
            <LeadField label="Customer Name" htmlFor="lead-customer-name" required error={form.formState.errors.customer_name?.message}>
              <Input id="lead-customer-name" className="h-[50px]" {...form.register("customer_name")} aria-invalid={Boolean(form.formState.errors.customer_name)} />
            </LeadField>
            <LeadField label="Mobile Number" htmlFor="lead-mobile" required error={form.formState.errors.primary_mobile?.message}>
              <Input id="lead-mobile" className="h-[50px]" inputMode="tel" autoComplete="tel" {...form.register("primary_mobile")} aria-invalid={Boolean(form.formState.errors.primary_mobile)} />
            </LeadField>
            <LeadField label="Select Service" htmlFor="lead-service" required className="sm:col-span-2">
              <Controller control={form.control} name="required_service" render={({ field, fieldState }) => (
                <LeadServiceCombobox services={services.data?.results ?? []} value={field.value} onChange={field.onChange} onSearch={setServiceSearch} error={fieldState.error?.message} loading={services.isLoading} />
              )} />
            </LeadField>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-medium text-foreground">Create Address</h2>
            <button type="button" onClick={() => void detectAddress()} disabled={detecting} className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-bold text-primary hover:bg-primary-subtle focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
              {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}Auto detect
            </button>
          </div>
          <div className="mt-7 space-y-6">
            <LeadField label="City" htmlFor="lead-city" required error={form.formState.errors.city?.message}>
              <Input id="lead-city" className="h-[50px]" {...form.register("city")} aria-invalid={Boolean(form.formState.errors.city)} />
            </LeadField>
            <LeadField label="Search Address" htmlFor="lead-address" required>
              <Controller control={form.control} name="address" render={({ field, fieldState }) => (
                <LeadAddressCombobox value={field.value} onChange={(value) => {
                  field.onChange(value);
                  form.setValue("pincode", extractPincode(value), { shouldValidate: true });
                }} onResolve={(value) => {
                  form.setValue("address", value.address, { shouldDirty: true, shouldValidate: true });
                  form.setValue("city", value.city, { shouldDirty: true, shouldValidate: true });
                  form.setValue("pincode", value.pincode, { shouldDirty: true, shouldValidate: true });
                  form.setValue("latitude", value.latitude, { shouldDirty: true });
                  form.setValue("longitude", value.longitude, { shouldDirty: true });
                  setShowPincode(!value.pincode);
                }} error={fieldState.error?.message} />
              )} />
            </LeadField>
            {showPincode || (addressValue.trim().length >= 3 && !pincodeValue) ? (
              <LeadField label="Pincode" htmlFor="lead-pincode" error={form.formState.errors.pincode?.message}><Input id="lead-pincode" className="h-[50px] max-w-xs" inputMode="numeric" {...form.register("pincode")} /></LeadField>
            ) : null}
          </div>
          {locationError ? <p className="mt-4 text-sm font-medium text-red-600">{locationError}</p> : null}
        </section>
        {create.isError ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{create.error.message}</p> : null}
      </form>

      <div className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-border bg-primary-subtle/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-[760px] items-center justify-center gap-8">
          <button type="button" onClick={() => router.back()} className="min-h-11 px-5 text-sm font-bold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">Back</button>
          <Button type="submit" form="create-lead-form" className="min-w-32 rounded-full" disabled={!form.formState.isValid || create.isPending}>
            {create.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Creating</> : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadField({ label, htmlFor, required, error, className, children }: { label: string; htmlFor: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-foreground">{label}{required ? <span className="text-red-600">*</span> : null}</label>{children}{error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}</div>;
}
