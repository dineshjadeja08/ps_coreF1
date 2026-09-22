"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { LocateFixed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { detectCurrentAddress } from "@/features/addresses/location";
import { adminApi } from "@/lib/api/endpoints";

const emptyForm = { customer_name: "", primary_mobile: "", required_service: "", city: "", address: "", pincode: "" };

export function AdminLeadCreateScreen() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locationError, setLocationError] = useState("");
  const [detecting, setDetecting] = useState(false);
  const categories = useQuery({ queryKey: ["admin", "categories", "lead-create"], queryFn: adminApi.listCategories });
  const services = useQuery({ queryKey: ["admin", "services", "lead-create"], queryFn: () => adminApi.listServices({ page_size: 100 }) });
  const categoryServices = (services.data?.results ?? []).filter(
    (service) => service.is_active && service.category === selectedCategory,
  );
  const create = useMutation({
    mutationFn: () => adminApi.createLead({
      ...form,
      source: "ONCALL",
      status: "NEW",
      funnel_status: "VISITED",
      payment_status: "NOT_REQUIRED",
    }),
    onSuccess: (lead) => router.push(`/admin/leads/${lead.id}`),
  });
  const canCreate = Boolean(form.customer_name.trim() && form.primary_mobile.trim() && form.required_service && form.city.trim() && form.address.trim() && form.pincode.trim());

  async function detectAddress() {
    setDetecting(true);
    setLocationError("");
    try {
      const value = await detectCurrentAddress();
      setForm((current) => ({
        ...current,
        city: value.city || current.city,
        address: value.address_line_1 || value.locality || current.address,
        pincode: value.postal_code || current.pincode,
      }));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Location could not be detected.");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <>
      <AdminPageHeader title="Create Lead" description="Record a phone or walk-in enquiry before payment." />
      <form className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={(event) => { event.preventDefault(); if (canCreate) create.mutate(); }}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-800">Customer Name <span className="text-red-600">*</span><Input className="mt-2" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></label>
          <label className="text-sm font-bold text-slate-800">Mobile Number <span className="text-red-600">*</span><Input className="mt-2" inputMode="tel" value={form.primary_mobile} onChange={(event) => setForm({ ...form, primary_mobile: event.target.value })} /></label>
          <label className="text-sm font-bold text-slate-800">
            Service Category <span className="text-red-600">*</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setForm({ ...form, required_service: "" });
              }}
            >
              <option value="">Select a category</option>
              {categories.data?.results.filter((category) => category.is_active).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-800">
            Service <span className="text-red-600">*</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
              value={form.required_service}
              disabled={!selectedCategory || services.isLoading}
              onChange={(event) => setForm({ ...form, required_service: event.target.value })}
            >
              <option value="">{selectedCategory ? "Select a service" : "Select a category first"}</option>
              {categoryServices.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            {selectedCategory && !services.isLoading && categoryServices.length === 0 ? <span className="mt-2 block text-xs font-medium text-amber-700">No active services are available under this category.</span> : null}
          </label>
        </div>
        <section className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-950">Create Address</h2><p className="mt-1 text-xs text-slate-500">Use location detection or enter the service address.</p></div><Button type="button" variant="outline" size="sm" onClick={detectAddress} disabled={detecting}><LocateFixed className="h-4 w-4" />{detecting ? "Detecting" : "Auto detect"}</Button></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">City <Input className="mt-2 bg-white" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
            <label className="text-sm font-semibold text-slate-700">Pincode <Input className="mt-2 bg-white" inputMode="numeric" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} /></label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Search Address <Input className="mt-2 bg-white" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="House, street, locality" /></label>
          </div>
          {locationError ? <p className="mt-3 text-sm text-red-600">{locationError}</p> : null}
        </section>
        {create.isError ? <p className="mt-4 text-sm text-red-600">{create.error.message}</p> : null}
        <div className="mt-7 flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.back()}>Back</Button><Button type="submit" disabled={!canCreate || create.isPending}>{create.isPending ? "Creating" : "Create"}</Button></div>
      </form>
    </>
  );
}
