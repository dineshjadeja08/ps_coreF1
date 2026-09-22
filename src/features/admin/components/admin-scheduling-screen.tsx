"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";

const fieldClass = "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm";

export function AdminSchedulingScreen() {
  const queryClient = useQueryClient();
  const [serviceAreaFilter, setServiceAreaFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const areas = useQuery({ queryKey: ["admin", "service-areas"], queryFn: adminApi.listServiceAreas });
  const closures = useQuery({ queryKey: ["admin", "schedule-closures"], queryFn: adminApi.listScheduleClosures });
  const slots = useQuery({ queryKey: ["admin", "time-slots", serviceAreaFilter, dateFilter], queryFn: () => adminApi.listTimeSlots({ page_size: 100, service_area: serviceAreaFilter || undefined, date: dateFilter || undefined }) });
  const [form, setForm] = useState({ service_area: "", closure_type: "BLACKOUT" as "HOLIDAY" | "BLACKOUT" | "EMERGENCY", start_date: "", end_date: "", reason: "" });
  const [editingId, setEditingId] = useState("");
  const [editingSlotId, setEditingSlotId] = useState("");
  const [slotForm, setSlotForm] = useState({ date: "", start_time: "", end_time: "", capacity: 1, is_active: true });

  const saveClosure = useMutation({
    mutationFn: () => editingId ? adminApi.updateScheduleClosure(editingId, { ...form, service_area: form.service_area || null, is_active: true }) : adminApi.createScheduleClosure({ ...form, service_area: form.service_area || null, is_active: true }),
    onSuccess: async () => {
      setForm({ service_area: "", closure_type: "BLACKOUT", start_date: "", end_date: "", reason: "" });
      setEditingId("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "schedule-closures"] });
    },
  });
  const removeClosure = useMutation({
    mutationFn: adminApi.removeScheduleClosure,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "schedule-closures"] }),
  });
  const updateSlot = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof adminApi.updateTimeSlot>[1] }) => adminApi.updateTimeSlot(id, body),
    onSuccess: async () => {
      setEditingSlotId("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "time-slots"] });
    },
  });

  function editSlot(slot: NonNullable<typeof slots.data>["results"][number]) {
    setEditingSlotId(slot.id);
    setSlotForm({ date: slot.date, start_time: slot.start_time.slice(0, 5), end_time: slot.end_time.slice(0, 5), capacity: slot.capacity, is_active: slot.is_active });
    updateSlot.reset();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    saveClosure.mutate();
  }

  const visibleClosures = (closures.data?.results ?? []).filter((closure) => {
    if (serviceAreaFilter && closure.service_area !== serviceAreaFilter) return false;
    if (dateFilter && !(closure.start_date <= dateFilter && closure.end_date >= dateFilter)) return false;
    return true;
  });

  const loading = areas.isLoading || closures.isLoading || slots.isLoading;
  return (
    <>
      <AdminPageHeader title="Scheduling" description="Manage holidays, blackout periods, emergency closures, slot capacity, and availability." />
      {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : (
        <div className="grid gap-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-950">{editingId ? "Edit closure" : "Add closure"}</h2>{editingId ? <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingId(""); setForm({ service_area: "", closure_type: "BLACKOUT", start_date: "", end_date: "", reason: "" }); }}>Cancel edit</Button> : null}</div>
            <form className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={submit}>
              <select className={fieldClass} value={form.service_area} onChange={(event) => setForm({ ...form, service_area: event.target.value })}>
                <option value="">All service areas</option>
                {areas.data?.results.map((area) => <option key={area.id} value={area.id}>{area.name} · {area.postal_code}</option>)}
              </select>
              <select className={fieldClass} value={form.closure_type} onChange={(event) => setForm({ ...form, closure_type: event.target.value as typeof form.closure_type })}>
                <option value="HOLIDAY">Holiday</option><option value="BLACKOUT">Blackout</option><option value="EMERGENCY">Emergency</option>
              </select>
              <Input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required />
              <Input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required />
              <Input placeholder="Reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required />
              <Button type="submit" disabled={saveClosure.isPending}>Save closure</Button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><select className={fieldClass} value={serviceAreaFilter} onChange={(event) => setServiceAreaFilter(event.target.value)}><option value="">All service areas</option>{areas.data?.results.map((area) => <option key={area.id} value={area.id}>{area.name} · {area.postal_code}</option>)}</select><Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /><Button type="button" variant="outline" onClick={() => { setServiceAreaFilter(""); setDateFilter(""); }}>Clear filters</Button></div></section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-slate-950">Closures</h2></div>
            <div className="divide-y divide-slate-100">
              {visibleClosures.map((closure) => <div key={closure.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{closure.service_area_name || "All service areas"} · {closure.closure_type}</p><p className="text-sm text-slate-500">{closure.start_date} to {closure.end_date} · {closure.reason}</p></div><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(closure.id); setForm({ service_area: closure.service_area ?? "", closure_type: closure.closure_type, start_date: closure.start_date, end_date: closure.end_date, reason: closure.reason }); }}>Edit</Button><Button variant="ghost" size="icon" onClick={() => removeClosure.mutate(closure.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></div>)}
              {!visibleClosures.length ? <div className="p-8 text-center text-sm text-slate-500"><CalendarOff className="mx-auto mb-2 h-6 w-6" />No closures configured.</div> : null}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-slate-950">Generated slots and capacity</h2></div>
            {editingSlotId ? <form className="grid gap-3 border-b border-violet-200 bg-violet-50/60 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_120px_auto] lg:items-end" onSubmit={(event) => { event.preventDefault(); updateSlot.mutate({ id: editingSlotId, body: slotForm }); }}>
              <label className="text-xs font-bold uppercase text-slate-600">Date<Input className="mt-1 bg-white" type="date" value={slotForm.date} onChange={(event) => setSlotForm({ ...slotForm, date: event.target.value })} required /></label>
              <label className="text-xs font-bold uppercase text-slate-600">Start time<Input className="mt-1 bg-white" type="time" value={slotForm.start_time} onChange={(event) => setSlotForm({ ...slotForm, start_time: event.target.value })} required /></label>
              <label className="text-xs font-bold uppercase text-slate-600">End time<Input className="mt-1 bg-white" type="time" value={slotForm.end_time} onChange={(event) => setSlotForm({ ...slotForm, end_time: event.target.value })} required /></label>
              <label className="text-xs font-bold uppercase text-slate-600">Capacity<Input className="mt-1 bg-white" type="number" min="1" value={slotForm.capacity} onChange={(event) => setSlotForm({ ...slotForm, capacity: Number(event.target.value) })} required /></label>
              <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={slotForm.is_active} onChange={(event) => setSlotForm({ ...slotForm, is_active: event.target.checked })} />Active</label><Button type="submit" size="sm" disabled={updateSlot.isPending}>{updateSlot.isPending ? "Saving" : "Save slot"}</Button><Button type="button" variant="ghost" size="sm" onClick={() => setEditingSlotId("")}>Cancel</Button></div>
              {updateSlot.isError ? <p className="text-sm font-semibold text-red-600 sm:col-span-2 lg:col-span-5">{updateSlot.error.message}</p> : null}
            </form> : null}
            <div className="divide-y divide-slate-100">
              {slots.data?.results.map((slot) => <div key={slot.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center"><div><p className="font-semibold text-slate-900">{slot.service_area_name}</p><p className="text-sm text-slate-500">{slot.date} · {slot.start_time}–{slot.end_time}</p></div><span className="text-sm">Capacity {slot.capacity}</span><span className="text-sm">Available {slot.available_capacity}</span><button type="button" onClick={() => updateSlot.mutate({ id: slot.id, body: { is_active: !slot.is_active } })}><AdminStatusBadge status={slot.is_active ? "ACTIVE" : "INACTIVE"} /></button><Button type="button" variant="outline" size="sm" onClick={() => editSlot(slot)}><Pencil className="h-4 w-4" />Edit</Button></div>)}
              {!slots.data?.results.length ? <div className="p-8 text-center text-sm text-slate-500">Slots appear here after customers or administrators request dates.</div> : null}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
