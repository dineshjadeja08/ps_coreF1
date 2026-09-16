"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Loader2, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";

const fieldClass = "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm";

export function AdminSchedulingScreen() {
  const queryClient = useQueryClient();
  const areas = useQuery({ queryKey: ["admin", "service-areas"], queryFn: adminApi.listServiceAreas });
  const closures = useQuery({ queryKey: ["admin", "schedule-closures"], queryFn: adminApi.listScheduleClosures });
  const slots = useQuery({ queryKey: ["admin", "time-slots"], queryFn: () => adminApi.listTimeSlots({ page_size: 100 }) });
  const [form, setForm] = useState({ service_area: "", closure_type: "BLACKOUT" as "HOLIDAY" | "BLACKOUT" | "EMERGENCY", start_date: "", end_date: "", reason: "" });

  const createClosure = useMutation({
    mutationFn: () => adminApi.createScheduleClosure({ ...form, service_area: form.service_area || null, is_active: true }),
    onSuccess: async () => {
      setForm({ service_area: "", closure_type: "BLACKOUT", start_date: "", end_date: "", reason: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "schedule-closures"] });
    },
  });
  const removeClosure = useMutation({
    mutationFn: adminApi.removeScheduleClosure,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "schedule-closures"] }),
  });
  const updateSlot = useMutation({
    mutationFn: ({ id, capacity, is_active }: { id: string; capacity: number; is_active: boolean }) => adminApi.updateTimeSlot(id, { capacity, is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "time-slots"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    createClosure.mutate();
  }

  const loading = areas.isLoading || closures.isLoading || slots.isLoading;
  return (
    <>
      <AdminPageHeader title="Scheduling" description="Manage holidays, blackout periods, emergency closures, slot capacity, and availability." />
      {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : (
        <div className="grid gap-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Add closure</h2>
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
              <Button type="submit" disabled={createClosure.isPending}>Save closure</Button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-slate-950">Closures</h2></div>
            <div className="divide-y divide-slate-100">
              {closures.data?.results.map((closure) => <div key={closure.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{closure.service_area_name || "All service areas"} · {closure.closure_type}</p><p className="text-sm text-slate-500">{closure.start_date} to {closure.end_date} · {closure.reason}</p></div><Button variant="ghost" size="icon" onClick={() => removeClosure.mutate(closure.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div>)}
              {!closures.data?.results.length ? <div className="p-8 text-center text-sm text-slate-500"><CalendarOff className="mx-auto mb-2 h-6 w-6" />No closures configured.</div> : null}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-slate-950">Generated slots and capacity</h2></div>
            <div className="divide-y divide-slate-100">
              {slots.data?.results.map((slot) => <div key={slot.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><div><p className="font-semibold text-slate-900">{slot.service_area_name}</p><p className="text-sm text-slate-500">{slot.date} · {slot.start_time}–{slot.end_time}</p></div><span className="text-sm">Available {slot.available_capacity}</span><Input className="w-24" type="number" min="1" defaultValue={slot.capacity} onBlur={(event) => { const capacity = Number(event.target.value); if (capacity !== slot.capacity && capacity > 0) updateSlot.mutate({ id: slot.id, capacity, is_active: slot.is_active }); }} /><button type="button" onClick={() => updateSlot.mutate({ id: slot.id, capacity: slot.capacity, is_active: !slot.is_active })}><AdminStatusBadge status={slot.is_active ? "ACTIVE" : "INACTIVE"} /></button></div>)}
              {!slots.data?.results.length ? <div className="p-8 text-center text-sm text-slate-500">Slots appear here after customers or administrators request dates.</div> : null}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
