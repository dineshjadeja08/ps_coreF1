"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { technicianForm, technicianSkillNames } from "@/features/admin/technician-form";
import { adminApi } from "@/lib/api/endpoints";
import type { TechnicianProfile, TechnicianWriteRequest } from "@/types/api";

const selectClass = "h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm";

export function AdminTechnicianEditor({ profile, onSaved, onCancel, onPendingChange }: { profile?: TechnicianProfile; onSaved: (profile: TechnicianProfile) => void; onCancel: () => void; onPendingChange: (pending: boolean) => void }) {
  const client = useQueryClient();
  const [form, setForm] = useState(() => technicianForm(profile));
  const [skills, setSkills] = useState(form.skill_names.join(", "));
  const options = useQuery({ queryKey: ["admin", "technicians", "options"], queryFn: adminApi.getTechnicianOptions });
  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, skill_names: technicianSkillNames(skills) };
      return profile ? adminApi.updateTechnician(profile.id, body) : adminApi.createTechnician(body);
    },
    onSuccess: async (saved) => { await client.invalidateQueries({ queryKey: ["admin", "technicians"] }); onSaved(saved); },
    onSettled: () => onPendingChange(false),
  });
  function update<K extends keyof TechnicianWriteRequest>(key: K, value: TechnicianWriteRequest[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  function toggle(key: "service_area_ids" | "supported_service_ids", id: string) {
    setForm((previous) => ({ ...previous, [key]: previous[key].includes(id) ? previous[key].filter((value) => value !== id) : [...previous[key], id] }));
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); onPendingChange(true); save.mutate(); }}>
      <fieldset disabled={save.isPending} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">Employee code<Input required maxLength={40} value={form.employee_code} onChange={(event) => update("employee_code", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Name<Input required maxLength={150} value={form.display_name} onChange={(event) => update("display_name", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Phone / login number<Input required type="tel" placeholder="+919876543210" value={form.phone} onChange={(event) => update("phone", event.target.value)} /><span className="text-xs font-normal text-slate-500">Changing this also changes the technician’s login number.</span></label>
        <label className="grid gap-2 text-sm font-semibold">Alternate phone<Input type="tel" value={form.alternate_phone} onChange={(event) => update("alternate_phone", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Email<Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Technician type<select className={selectClass} value={form.technician_type} onChange={(event) => update("technician_type", event.target.value as TechnicianWriteRequest["technician_type"])}>{["EMPLOYEE", "CONTRACT", "PARTNER"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold">City<Input value={form.city} onChange={(event) => update("city", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Home pincode<Input value={form.pincode} onChange={(event) => update("pincode", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Address<textarea className="min-h-20 rounded-lg border border-slate-200 p-3 font-normal" value={form.address} onChange={(event) => update("address", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Experience (years)<Input type="number" min="0" max="999.9" step="0.1" value={form.experience_years} onChange={(event) => update("experience_years", event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Joined on<Input type="date" value={form.joined_at ?? ""} onChange={(event) => update("joined_at", event.target.value || null)} /></label>
        <label className="grid gap-2 text-sm font-semibold">Employment<select className={selectClass} value={form.employment_status} onChange={(event) => setForm({ ...form, employment_status: event.target.value as TechnicianWriteRequest["employment_status"], is_active: event.target.value === "ACTIVE" && form.is_active })}>{["ACTIVE", "INACTIVE", "LEFT"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold">Verification<select className={selectClass} value={form.background_verification_status} onChange={(event) => setForm({ ...form, background_verification_status: event.target.value as TechnicianWriteRequest["background_verification_status"], is_active: event.target.value === "SUSPENDED" ? false : form.is_active })}>{["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "SUSPENDED"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold">Availability<select className={selectClass} value={form.availability_status} onChange={(event) => setForm({ ...form, availability_status: event.target.value as TechnicianWriteRequest["availability_status"], is_active: event.target.value === "SUSPENDED" ? false : form.is_active })}>{["AVAILABLE", "BUSY", "ON_LEAVE", "OFFLINE", "SUSPENDED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} disabled={form.employment_status !== "ACTIVE" || form.background_verification_status === "SUSPENDED" || form.availability_status === "SUSPENDED"} onChange={(event) => update("is_active", event.target.checked)} />Active technician</label>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Skills (comma-separated)<Input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="AC repair, Electrical work" /><span className="text-xs font-normal text-slate-500">{options.data?.skills.map((skill) => skill.name).join(", ") || "New skill names will be added when you save."}</span></label>
        <div className="sm:col-span-2"><p className="text-sm text-slate-600">No service selection means all services. No area selection uses the pincode above, or all areas if blank. Select coverage explicitly where possible.</p></div>
        <fieldset className="min-w-0 rounded-lg border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold">Supported services</legend><div className="grid gap-2">{options.data?.services.map((service) => <label key={service.id} className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={form.supported_service_ids.includes(service.id)} onChange={() => toggle("supported_service_ids", service.id)} /><span>{service.name}{!service.is_active ? " (inactive)" : ""}</span></label>)}</div></fieldset>
        <fieldset className="min-w-0 rounded-lg border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold">Service areas</legend><div className="grid gap-2">{options.data?.areas.map((area) => <label key={area.id} className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={form.service_area_ids.includes(area.id)} onChange={() => toggle("service_area_ids", area.id)} /><span>{area.name} · {area.city} · {area.postal_code}{!area.is_active ? " (inactive)" : ""}</span></label>)}</div></fieldset>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Admin notes<textarea className="min-h-24 rounded-lg border border-slate-200 p-3 font-normal" value={form.internal_notes} onChange={(event) => update("internal_notes", event.target.value)} /></label>
        <p className="text-xs text-slate-500 sm:col-span-2">Deactivation prevents new assignment without deleting existing bookings or history. Availability does not change existing booking status.</p>
        <div className="flex flex-wrap gap-2 sm:col-span-2"><Button type="submit" disabled={options.isLoading || options.isError || save.isPending}>{save.isPending ? "Saving…" : "Save technician"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
      </fieldset>
      {options.isError ? <AdminErrorState message="Could not load coverage options. Retry before saving." onRetry={() => void options.refetch()} /> : null}
      {save.isError ? <p role="alert" className="mt-3 text-sm text-red-600">{save.error.message}</p> : null}
    </form>
  );
}
