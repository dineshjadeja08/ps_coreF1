"use client";

import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { canAccessAdminPath } from "@/components/admin/admin-access";
import { Button } from "@/components/ui/button";
import { AdminBookingDrawer } from "@/features/admin/components/admin-booking-drawer";
import { updateBookingCursor, type BookingCursor } from "@/features/admin/live-bookings";
import { useAuth } from "@/features/auth/hooks";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking, PaginatedResponse } from "@/types/api";

function subscribeConnection(callback: () => void) {
  window.addEventListener("online", callback); window.addEventListener("offline", callback);
  return () => { window.removeEventListener("online", callback); window.removeEventListener("offline", callback); };
}

export function AdminLiveStatus() {
  const { user } = useAuth();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["admin"] });
  const [now, setNow] = useState(0);
  const [alerts, setAlerts] = useState<Booking[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const cursor = useRef<BookingCursor | null>(null);
  const online = useSyncExternalStore(subscribeConnection, () => navigator.onLine, () => true);
  const subscribe = useCallback((callback: () => void) => client.getQueryCache().subscribe(callback), [client]);
  const snapshot = useCallback(() => {
    const queries = client.getQueryCache().findAll({ queryKey: ["admin"], type: "active" });
    const updates = queries.map((query) => query.state.dataUpdatedAt).filter(Boolean);
    return `${updates.length ? Math.min(...updates) : 0}:${queries.some((query) => query.state.status === "error")}`;
  }, [client]);
  const state = useSyncExternalStore(subscribe, snapshot, () => "0:false");
  const [updatedAt, hasError] = state.split(":");
  useQuery({ queryKey: ["admin", "booking-alert-feed", user?.id], queryFn: () => adminApi.listBookings({ page_size: 25 }), enabled: canAccessAdminPath(user, "/admin/bookings") });
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const cache = client.getQueryCache();
    function detect(data: PaginatedResponse<Booking> | undefined) {
      if (!data) return;
      const result = updateBookingCursor(cursor.current, data.results);
      cursor.current = result.cursor;
      if (result.newBookings.length) setAlerts((previous) => Array.from(new Map([...result.newBookings, ...previous].map((booking) => [booking.id, booking])).values()).slice(0, 10));
    }
    detect(client.getQueryData(["admin", "booking-alert-feed", user?.id]));
    const unsubscribe = cache.subscribe((event) => {
      if (event.type === "updated" && event.action.type === "success" && event.query.queryKey[1] === "booking-alert-feed" && event.query.queryKey[2] === user?.id) detect(event.query.state.data as PaginatedResponse<Booking>);
    });
    return () => { clearInterval(timer); unsubscribe(); };
  }, [client, user?.id]);
  const age = Math.max(0, Math.floor((now - Number(updatedAt)) / 1000));
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2"><span className={`h-2 w-2 rounded-full ${!online || hasError === "true" ? "bg-amber-500" : "bg-emerald-500"}`} /><span>{!online ? "Offline · showing saved data" : hasError === "true" ? "Update failed · retry available" : "Auto-refresh every 15 seconds"}</span><span className="text-slate-500">{Number(updatedAt) && now ? `Last updated ${age < 60 ? `${age}s` : `${Math.floor(age / 60)}m`} ago` : "Waiting for data…"}</span>{fetching ? <span className="text-violet-700">Updating…</span> : null}</div>
        <Button type="button" size="sm" variant="ghost" disabled={Boolean(fetching) || !online} onClick={() => void client.invalidateQueries({ queryKey: ["admin"], refetchType: "active" })}><RefreshCw className={`h-3 w-3 ${fetching ? "animate-spin" : ""}`} />Refresh</Button>
      </div>
      {alerts.length ? <div role="status" aria-live="polite" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 p-3"><Bell className="h-5 w-5 shrink-0 text-violet-700" /><p className="flex-1 text-sm font-semibold">{alerts.length} new booking{alerts.length === 1 ? "" : "s"}</p><div className="flex flex-wrap gap-2">{alerts.slice(0, 3).map((booking) => <Button key={booking.id} type="button" variant="outline" size="sm" onClick={() => { setSelectedId(booking.id); setAlerts((items) => items.filter((item) => item.id !== booking.id)); }}>{booking.booking_number}</Button>)}</div><Button type="button" variant="ghost" size="icon" aria-label="Dismiss booking alerts" onClick={() => setAlerts([])}><X className="h-4 w-4" /></Button></div> : null}
      {selectedId ? <AdminBookingDrawer key={selectedId} bookingId={selectedId} onClose={() => setSelectedId("")} /> : null}
    </>
  );
}
