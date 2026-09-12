"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminServiceArea, UUID } from "@/types/api";

type AreaForm = {
  id?: UUID;
  name: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  service_ids: UUID[];
  is_active: boolean;
};

const emptyForm: AreaForm = {
  name: "",
  city: "",
  state: "",
  country: "India",
  postal_code: "",
  service_ids: [],
  is_active: true,
};

function toForm(area: AdminServiceArea): AreaForm {
  return {
    id: area.id,
    name: area.name,
    city: area.city,
    state: area.state,
    country: area.country,
    postal_code: area.postal_code,
    service_ids: area.services.map((service) => service.id),
    is_active: area.is_active,
  };
}

export function AdminServiceAreasScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AreaForm | null>(null);
  const areas = useQuery({ queryKey: ["admin", "service-areas"], queryFn: adminApi.listServiceAreas });
  const services = useQuery({ queryKey: ["admin", "services", "area-options"], queryFn: () => adminApi.listServices({ page_size: 100 }) });
  const save = useMutation({
    mutationFn: (payload: AreaForm) => {
      const body = {
        name: payload.name,
        city: payload.city,
        state: payload.state,
        country: payload.country,
        postal_code: payload.postal_code,
        service_ids: payload.service_ids,
        is_active: payload.is_active,
      };
      return payload.id ? adminApi.updateServiceArea(payload.id, body) : adminApi.createServiceArea(body);
    },
    onSuccess: async () => {
      setForm(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "service-areas"] });
    },
  });
  const remove = useMutation({
    mutationFn: adminApi.removeServiceArea,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "service-areas"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (form) save.mutate(form);
  }

  function toggleService(id: UUID) {
    if (!form) return;
    setForm({
      ...form,
      service_ids: form.service_ids.includes(id) ? form.service_ids.filter((entry) => entry !== id) : [...form.service_ids, id],
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Service Areas"
        description="Choose exactly which services customers can book in each pincode."
        action={<Button type="button" onClick={() => setForm({ ...emptyForm })}><Plus className="h-4 w-4" />Add pincode</Button>}
      />

      {form ? (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-950">{form.id ? "Edit service area" : "Add service area"}</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>Close</Button>
          </div>
          <form onSubmit={submit} className="grid gap-5 p-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Field label="Area name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
              <Field label="Pincode"><Input value={form.postal_code} onChange={(event) => setForm({ ...form, postal_code: event.target.value })} required /></Field>
              <Field label="City"><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required /></Field>
              <Field label="State"><Input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} required /></Field>
              <Field label="Country"><Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} required /></Field>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">Available services</p>
                  <p className="text-xs text-slate-500">Only selected services can be scheduled or booked for this pincode.</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, service_ids: (services.data?.results ?? []).map((item) => item.id) })}>Select all</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setForm({ ...form, service_ids: [] })}>Clear</Button>
                </div>
              </div>
              <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {(services.data?.results ?? []).map((service) => (
                  <label key={service.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-slate-50">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-violet-700" checked={form.service_ids.includes(service.id)} onChange={() => toggleService(service.id)} />
                    <span><span className="block text-sm font-semibold text-slate-800">{service.name}</span><span className="text-xs text-slate-500">{service.category_detail.name}</span></span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-violet-700" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
              Pincode is active
            </label>
            <div>
              <Button type="submit" disabled={save.isPending}><Save className="h-4 w-4" />{save.isPending ? "Saving" : "Save service area"}</Button>
              {save.isError ? <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{save.error.message}</p> : null}
            </div>
          </form>
        </section>
      ) : null}

      {areas.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : null}
      {areas.isError ? <AdminErrorState message={areas.error.message} onRetry={() => void areas.refetch()} /> : null}
      {areas.data ? (
        <AdminDataTable
          rows={areas.data.results}
          getRowKey={(area) => area.id}
          emptyIcon={MapPin}
          emptyTitle="No service areas"
          emptyMessage="Add a pincode and select the services available there."
          columns={[
            { key: "pincode", header: "Pincode", render: (area) => <span className="font-bold text-slate-950">{area.postal_code}</span> },
            { key: "area", header: "Area", render: (area) => `${area.name}, ${area.city}` },
            { key: "services", header: "Services", render: (area) => `${area.services.length} selected` },
            { key: "status", header: "Status", render: (area) => <AdminStatusBadge status={area.is_active ? "ACTIVE" : "INACTIVE"} /> },
            { key: "actions", header: "Actions", render: (area) => <div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setForm(toForm(area))}>Edit</Button><Button type="button" size="icon" variant="ghost" aria-label={`Delete ${area.postal_code}`} onClick={() => { if (window.confirm(`Delete service area ${area.postal_code}?`)) remove.mutate(area.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button></div> },
          ]}
        />
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-xs font-bold uppercase text-slate-500">{label}</span>{children}</label>;
}
