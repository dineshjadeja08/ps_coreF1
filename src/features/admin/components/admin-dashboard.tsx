"use client";

import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Pencil,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserCog,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { adminApi } from "@/lib/api/endpoints";
import type {
  AdminService,
  AdminServiceCategory,
  Booking,
  BookingStatus,
  PaginatedResponse,
  TechnicianProfile,
  UUID,
} from "@/types/api";

type AdminTab = "services" | "categories" | "bookings";

type ServiceFormState = {
  id?: UUID;
  category: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  whats_included: string;
  whats_excluded: string;
  important_notes: string;
  base_price: string;
  selling_price: string;
  advance_payment_type: "FIXED" | "PERCENTAGE";
  advance_payment_value: string;
  estimated_duration_minutes: string;
  is_featured: boolean;
  is_popular: boolean;
  is_active: boolean;
  display_order: string;
  cover_image: File | null;
};

type CategoryFormState = {
  id?: UUID;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

const emptyServiceForm: ServiceFormState = {
  category: "",
  name: "",
  slug: "",
  short_description: "",
  description: "",
  whats_included: "",
  whats_excluded: "",
  important_notes: "",
  base_price: "0.00",
  selling_price: "",
  advance_payment_type: "FIXED",
  advance_payment_value: "0.00",
  estimated_duration_minutes: "60",
  is_featured: false,
  is_popular: false,
  is_active: true,
  display_order: "0",
  cover_image: null,
};

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  display_order: "0",
  is_active: true,
};

const bookingStatuses: Array<{ value: ""; label: string } | { value: BookingStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "PENDING_PAYMENT", label: "Pending payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "TECHNICIAN_ASSIGNED", label: "Technician assigned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PAYMENT_FAILED", label: "Payment failed" },
];

function unwrap<T>(payload: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.results;
}

function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function getServiceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

function buildServiceFormData(form: ServiceFormState) {
  const data = new FormData();
  data.set("category", form.category);
  data.set("name", form.name);
  data.set("slug", form.slug);
  data.set("short_description", form.short_description);
  data.set("description", form.description);
  data.set("whats_included", form.whats_included);
  data.set("whats_excluded", form.whats_excluded);
  data.set("important_notes", form.important_notes);
  data.set("base_price", form.base_price || "0.00");
  if (form.selling_price) {
    data.set("selling_price", form.selling_price);
  }
  data.set("advance_payment_type", form.advance_payment_type);
  data.set("advance_payment_value", form.advance_payment_value || "0.00");
  data.set("estimated_duration_minutes", form.estimated_duration_minutes || "60");
  data.set("is_featured", String(form.is_featured));
  data.set("is_popular", String(form.is_popular));
  data.set("is_active", String(form.is_active));
  data.set("display_order", form.display_order || "0");
  if (form.cover_image) {
    data.set("cover_image", form.cover_image);
  }
  return data;
}

function serviceToForm(service: AdminService): ServiceFormState {
  return {
    id: service.id,
    category: service.category,
    name: service.name,
    slug: service.slug,
    short_description: service.short_description,
    description: service.description ?? "",
    whats_included: service.whats_included ?? "",
    whats_excluded: service.whats_excluded ?? "",
    important_notes: service.important_notes ?? "",
    base_price: service.base_price,
    selling_price: service.selling_price ?? "",
    advance_payment_type: service.advance_payment_type,
    advance_payment_value: service.advance_payment_value,
    estimated_duration_minutes: String(service.estimated_duration_minutes),
    is_featured: service.is_featured,
    is_popular: service.is_popular,
    is_active: service.is_active,
    display_order: String(service.display_order),
    cover_image: null,
  };
}

function categoryToForm(category: AdminServiceCategory): CategoryFormState {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image_url: category.image_url ?? "",
    display_order: String(category.display_order ?? 0),
    is_active: category.is_active,
  };
}

export function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("services");
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(emptyServiceForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [notesByBooking, setNotesByBooking] = useState<Record<string, string>>({});
  const [technicianByBooking, setTechnicianByBooking] = useState<Record<string, string>>({});
  const [balanceByBooking, setBalanceByBooking] = useState<Record<string, { amount: string; method: string }>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const loadAdminData = useCallback(async () => {
    if (!canManage) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const [categoryPayload, servicePayload, bookingPayload, technicianPayload] = await Promise.all([
        adminApi.listCategories(),
        adminApi.listServices({ page_size: 100 }),
        adminApi.listBookings({ page_size: 100, status: bookingStatus || undefined, search: bookingSearch || undefined }),
        adminApi.listTechnicians(),
      ]);
      const nextCategories = unwrap(categoryPayload);
      setCategories(nextCategories);
      setServices(unwrap(servicePayload));
      setBookings(unwrap(bookingPayload));
      setTechnicians(technicianPayload);
      setServiceForm((current) => (current.category ? current : { ...current, category: nextCategories[0]?.id ?? "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin data.");
    } finally {
      setBusy(false);
    }
  }, [bookingSearch, bookingStatus, canManage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdminData]);

  const totals = useMemo(
    () => ({
      activeServices: services.filter((service) => service.is_active).length,
      categories: categories.length,
      openBookings: bookings.filter((booking) => !["COMPLETED", "CANCELLED"].includes(booking.booking_status)).length,
      technicians: technicians.filter((technician) => technician.is_available).length,
    }),
    [bookings, categories.length, services, technicians],
  );

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminShell>
        <AccessPanel title="Admin login required" message="Login first, then open /admin again to manage the dashboard." />
      </AdminShell>
    );
  }

  if (!canManage) {
    return (
      <AdminShell>
        <AccessPanel title="Admin permission required" message="Your current account is not marked as ADMIN or SUPER_ADMIN." />
      </AdminShell>
    );
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (serviceForm.id) {
        await adminApi.updateService(serviceForm.id, buildServiceFormData(serviceForm));
        setNotice("Service updated.");
      } else {
        await adminApi.createService(buildServiceFormData(serviceForm));
        setNotice("Service created.");
        setServiceForm({ ...emptyServiceForm, category: categories[0]?.id ?? "" });
      }
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save service.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description,
        image_url: categoryForm.image_url,
        display_order: Number(categoryForm.display_order || 0),
        is_active: categoryForm.is_active,
      };
      if (categoryForm.id) {
        await adminApi.updateCategory(categoryForm.id, body);
        setNotice("Category updated.");
      } else {
        await adminApi.createCategory(body);
        setNotice("Category created.");
        setCategoryForm(emptyCategoryForm);
      }
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category.");
    } finally {
      setBusy(false);
    }
  }

  async function removeService(id: UUID) {
    if (!window.confirm("Remove this service? If bookings exist, the backend will deactivate it instead.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminApi.removeService(id);
      setNotice("Service removed or deactivated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove service.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(id: UUID) {
    if (!window.confirm("Remove this category? If services exist, the backend will deactivate it instead.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminApi.removeCategory(id);
      setNotice("Category removed or deactivated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove category.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadGalleryImage(serviceId: UUID, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.set("image", file);
      data.set("alt_text", file.name);
      data.set("display_order", "0");
      data.set("is_active", "true");
      await adminApi.addServiceImage(serviceId, data);
      setNotice("Service gallery image added.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  }

  async function removeGalleryImage(serviceId: UUID, imageId: UUID) {
    setBusy(true);
    setError("");
    try {
      await adminApi.removeServiceImage(serviceId, imageId);
      setNotice("Service gallery image removed.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove image.");
    } finally {
      setBusy(false);
    }
  }

  async function runBookingAction(bookingId: UUID, action: "assign" | "start" | "balance" | "complete" | "cancel") {
    setBusy(true);
    setError("");
    const notes = notesByBooking[bookingId] ?? "";
    try {
      if (action === "assign") {
        const technicianId = technicianByBooking[bookingId];
        if (!technicianId) {
          throw new Error("Select a technician first.");
        }
        await adminApi.assignTechnician(bookingId, { technician_id: technicianId, notes });
      }
      if (action === "start") {
        await adminApi.startBooking(bookingId, { notes });
      }
      if (action === "balance") {
        const balance = balanceByBooking[bookingId] ?? { amount: "", method: "CASH" };
        if (!balance.amount) {
          throw new Error("Enter the collected balance amount.");
        }
        await adminApi.recordBalance(bookingId, {
          amount: balance.amount,
          method: balance.method as "CASH" | "UPI" | "CARD_OFFLINE" | "OTHER",
          notes,
        });
      }
      if (action === "complete") {
        await adminApi.completeBooking(bookingId, { notes });
      }
      if (action === "cancel") {
        await adminApi.cancelBooking(bookingId, { notes });
      }
      setNotice("Booking updated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric icon={Wrench} label="Active services" value={totals.activeServices} />
        <Metric icon={LayoutGrid} label="Categories" value={totals.categories} />
        <Metric icon={CalendarCheck} label="Open bookings" value={totals.openBookings} />
        <Metric icon={UserCog} label="Available techs" value={totals.technicians} />
      </div>

      {(notice || error) && (
        <div className="mb-5 rounded-2xl border border-border bg-surface p-4 text-sm">
          {notice && <p className="font-semibold text-success">{notice}</p>}
          {error && <p className="font-semibold text-destructive">{error}</p>}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")}>
          Services
        </TabButton>
        <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
          Categories
        </TabButton>
        <TabButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")}>
          Bookings
        </TabButton>
        <Button type="button" variant="outline" className="ml-auto" onClick={() => void loadAdminData()} disabled={busy}>
          <RefreshCcw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refresh
        </Button>
      </div>

      {activeTab === "services" && (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Panel title={serviceForm.id ? "Edit service" : "Create service"} icon={Pencil}>
            <ServiceForm
              form={serviceForm}
              categories={categories}
              busy={busy}
              onSubmit={handleServiceSubmit}
              onReset={() => setServiceForm({ ...emptyServiceForm, category: categories[0]?.id ?? "" })}
              onChange={setServiceForm}
            />
          </Panel>
          <Panel title="Services catalogue" icon={Wrench}>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-foreground">{service.name}</h3>
                        <Badge>{service.category_detail.name}</Badge>
                        {!service.is_active && <Badge className="bg-destructive/10 text-destructive">Inactive</Badge>}
                        {service.is_featured && <Badge className="bg-primary-soft text-primary">Featured</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-secondary">{service.short_description}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {formatCurrency(service.effective_price)} · Advance {formatCurrency(service.advance_amount)} ·{" "}
                        {service.estimated_duration_minutes} min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setServiceForm(serviceToForm(service))}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => void removeService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold">
                      <ImagePlus className="h-4 w-4" />
                      Add image
                      <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadGalleryImage(service.id, event)} />
                    </label>
                    {service.images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-secondary hover:border-destructive hover:text-destructive"
                        onClick={() => void removeGalleryImage(service.id, image.id)}
                      >
                        Remove image {image.display_order}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Panel title={categoryForm.id ? "Edit category" : "Create category"} icon={LayoutGrid}>
            <CategoryForm
              form={categoryForm}
              busy={busy}
              onSubmit={handleCategorySubmit}
              onReset={() => setCategoryForm(emptyCategoryForm)}
              onChange={setCategoryForm}
            />
          </Panel>
          <Panel title="Catalogue categories" icon={LayoutGrid}>
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{category.name}</h3>
                        {!category.is_active && <Badge className="bg-destructive/10 text-destructive">Inactive</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-secondary">{category.description || "No description yet."}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="icon" aria-label="Edit category" onClick={() => setCategoryForm(categoryToForm(category))}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" aria-label="Remove category" onClick={() => void removeCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "bookings" && (
        <Panel title="Booking operations" icon={CalendarCheck}>
          <form
            className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadAdminData();
            }}
          >
            <label className="relative">
              <span className="sr-only">Search booking</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={bookingSearch} onChange={(event) => setBookingSearch(event.target.value)} className="pl-9" placeholder="Search booking number" />
            </label>
            <select className="h-11 rounded-xl border border-border bg-surface px-3 text-sm" value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value)}>
              {bookingStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Button type="submit">
              <Search className="h-4 w-4" />
              Apply
            </Button>
          </form>

          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{booking.booking_number}</h3>
                      <StatusBadge type="booking" status={booking.booking_status} />
                      <StatusBadge type="payment" status={booking.payment_status} />
                    </div>
                    <p className="mt-1 text-sm text-secondary">
                      {getServiceName(booking)} · {booking.service_date} · {formatCurrency(booking.total_amount)}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      Balance due {formatCurrency(booking.balance_due)} · Collected {formatCurrency(booking.balance_collected)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_180px_1fr]">
                  <Input
                    placeholder="Admin notes"
                    value={notesByBooking[booking.id] ?? ""}
                    onChange={(event) => setNotesByBooking((current) => ({ ...current, [booking.id]: event.target.value }))}
                  />
                  <select
                    className="h-11 rounded-xl border border-border bg-surface px-3 text-sm"
                    value={technicianByBooking[booking.id] ?? ""}
                    onChange={(event) => setTechnicianByBooking((current) => ({ ...current, [booking.id]: event.target.value }))}
                  >
                    <option value="">Select technician</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.display_name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-11 rounded-xl border border-border bg-surface px-3 text-sm"
                    value={balanceByBooking[booking.id]?.method ?? "CASH"}
                    onChange={(event) =>
                      setBalanceByBooking((current) => ({
                        ...current,
                        [booking.id]: { amount: current[booking.id]?.amount ?? "", method: event.target.value },
                      }))
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD_OFFLINE">Card offline</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <Input
                    inputMode="decimal"
                    placeholder="Balance amount"
                    value={balanceByBooking[booking.id]?.amount ?? ""}
                    onChange={(event) =>
                      setBalanceByBooking((current) => ({
                        ...current,
                        [booking.id]: { method: current[booking.id]?.method ?? "CASH", amount: event.target.value },
                      }))
                    }
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => void runBookingAction(booking.id, "assign")}>
                    <UserCog className="h-4 w-4" />
                    Assign
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void runBookingAction(booking.id, "start")}>
                    <Activity className="h-4 w-4" />
                    Start
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void runBookingAction(booking.id, "balance")}>
                    <CheckCircle2 className="h-4 w-4" />
                    Record balance
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void runBookingAction(booking.id, "complete")}>
                    <Star className="h-4 w-4" />
                    Complete
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void runBookingAction(booking.id, "cancel")}>
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary">Private Operations</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Purple Squad Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              Manage catalogue, service content, images, bookings, dispatch, balance collection, and completion from the frontend.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.home}>Customer site</Link>
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
}

function AccessPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-secondary">{message}</p>
      <Button asChild className="mt-5">
        <Link href="/login">Login</Link>
      </Button>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Wrench; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-secondary">{label}</p>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl border px-4 text-sm font-semibold transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:border-primary/30"
      }`}
    >
      {children}
    </button>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Wrench; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-secondary">{label}</span>
      {children}
    </label>
  );
}

function ServiceForm({
  form,
  categories,
  busy,
  onSubmit,
  onReset,
  onChange,
}: {
  form: ServiceFormState;
  categories: AdminServiceCategory[];
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onChange: (form: ServiceFormState) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Category">
        <select className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm" value={form.category} onChange={(event) => onChange({ ...form, category: event.target.value })} required>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Name">
          <Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
        </Field>
        <Field label="Slug">
          <Input value={form.slug} onChange={(event) => onChange({ ...form, slug: event.target.value })} required />
        </Field>
      </div>
      <Field label="Short description">
        <Input value={form.short_description} onChange={(event) => onChange({ ...form, short_description: event.target.value })} required />
      </Field>
      <Field label="Description">
        <textarea className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Included">
          <textarea className="min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" value={form.whats_included} onChange={(event) => onChange({ ...form, whats_included: event.target.value })} />
        </Field>
        <Field label="Excluded">
          <textarea className="min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" value={form.whats_excluded} onChange={(event) => onChange({ ...form, whats_excluded: event.target.value })} />
        </Field>
      </div>
      <Field label="Important notes">
        <Input value={form.important_notes} onChange={(event) => onChange({ ...form, important_notes: event.target.value })} />
      </Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Base price">
          <Input inputMode="decimal" value={form.base_price} onChange={(event) => onChange({ ...form, base_price: event.target.value })} required />
        </Field>
        <Field label="Selling price">
          <Input inputMode="decimal" value={form.selling_price} onChange={(event) => onChange({ ...form, selling_price: event.target.value })} />
        </Field>
        <Field label="Duration minutes">
          <Input inputMode="numeric" value={form.estimated_duration_minutes} onChange={(event) => onChange({ ...form, estimated_duration_minutes: event.target.value })} required />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Advance type">
          <select className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm" value={form.advance_payment_type} onChange={(event) => onChange({ ...form, advance_payment_type: event.target.value as "FIXED" | "PERCENTAGE" })}>
            <option value="FIXED">Fixed</option>
            <option value="PERCENTAGE">Percentage</option>
          </select>
        </Field>
        <Field label="Advance value">
          <Input inputMode="decimal" value={form.advance_payment_value} onChange={(event) => onChange({ ...form, advance_payment_value: event.target.value })} required />
        </Field>
        <Field label="Display order">
          <Input inputMode="numeric" value={form.display_order} onChange={(event) => onChange({ ...form, display_order: event.target.value })} />
        </Field>
      </div>
      <Field label="Cover image">
        <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onChange({ ...form, cover_image: event.target.files?.[0] ?? null })} />
      </Field>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.is_featured} onChange={(event) => onChange({ ...form, is_featured: event.target.checked })} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.is_popular} onChange={(event) => onChange({ ...form, is_popular: event.target.checked })} />
          Popular
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.is_active} onChange={(event) => onChange({ ...form, is_active: event.target.checked })} />
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          <Save className="h-4 w-4" />
          Save service
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Clear
        </Button>
      </div>
    </form>
  );
}

function CategoryForm({
  form,
  busy,
  onSubmit,
  onReset,
  onChange,
}: {
  form: CategoryFormState;
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onChange: (form: CategoryFormState) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Name">
        <Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
      </Field>
      <Field label="Slug">
        <Input value={form.slug} onChange={(event) => onChange({ ...form, slug: event.target.value })} required />
      </Field>
      <Field label="Description">
        <textarea className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm" value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
      </Field>
      <Field label="Image URL">
        <Input value={form.image_url} onChange={(event) => onChange({ ...form, image_url: event.target.value })} />
      </Field>
      <Field label="Display order">
        <Input inputMode="numeric" value={form.display_order} onChange={(event) => onChange({ ...form, display_order: event.target.value })} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.is_active} onChange={(event) => onChange({ ...form, is_active: event.target.checked })} />
        Active
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          <Save className="h-4 w-4" />
          Save category
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Clear
        </Button>
      </div>
    </form>
  );
}
