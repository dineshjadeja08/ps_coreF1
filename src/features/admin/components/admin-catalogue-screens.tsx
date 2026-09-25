"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookOpen, ImagePlus, Loader2, Package, Plus, Save, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminService, AdminServiceCategory, FAQ, HomepageBanner, UUID } from "@/types/api";

type CategoryForm = {
  id?: UUID;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

type ServiceForm = {
  id?: UUID;
  category: string;
  name: string;
  slug: string;
  short_description: string;
  landing_group: string;
  description: string;
  whats_included: string;
  whats_excluded: string;
  important_notes: string;
  base_price: string;
  selling_price: string;
  advance_payment_type: "FIXED" | "PERCENTAGE";
  advance_payment_value: string;
  estimated_duration_minutes: string;
  display_order: string;
  is_featured: boolean;
  is_popular: boolean;
  is_active: boolean;
};

type FaqForm = {
  id?: UUID;
  question: string;
  answer: string;
  category: string;
  service: string;
  package: string;
  display_order: string;
  is_active: boolean;
};

type BannerForm = {
  id?: UUID;
  title: string;
  description: string;
  image_alt_text: string;
  button_text: string;
  button_link: string;
  placement: HomepageBanner["placement"];
  display_order: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const fieldClass =
  "rounded-lg border-slate-200 bg-white shadow-none focus:border-violet-500 focus:ring-violet-500/15";
const labelClass = "text-xs font-bold uppercase text-slate-500";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryToForm(category?: AdminServiceCategory): CategoryForm {
  return {
    id: category?.id,
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image_url: category?.image_url ?? "",
    display_order: String(category?.display_order ?? 0),
    is_active: category?.is_active ?? true,
  };
}

function serviceToForm(service?: AdminService, firstCategory?: string): ServiceForm {
  return {
    id: service?.id,
    category: service?.category ?? firstCategory ?? "",
    name: service?.name ?? "",
    slug: service?.slug ?? "",
    short_description: service?.short_description ?? "",
    landing_group: service?.landing_group ?? "",
    description: service?.description ?? "",
    whats_included: service?.whats_included ?? "",
    whats_excluded: service?.whats_excluded ?? "",
    important_notes: service?.important_notes ?? "",
    base_price: String(service?.base_price ?? ""),
    selling_price: String(service?.selling_price ?? ""),
    advance_payment_type: service?.advance_payment_type ?? "FIXED",
    advance_payment_value: String(service?.advance_payment_value ?? service?.advance_amount ?? "0"),
    estimated_duration_minutes: String(service?.estimated_duration_minutes ?? 90),
    display_order: String(service?.display_order ?? 0),
    is_featured: service?.is_featured ?? false,
    is_popular: service?.is_popular ?? false,
    is_active: service?.is_active ?? true,
  };
}

function faqToForm(faq?: FAQ, firstCategory?: string, firstService?: string): FaqForm {
  return {
    id: faq?.id,
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? firstCategory ?? "",
    service: faq?.service ?? firstService ?? "",
    package: faq?.package ?? "",
    display_order: String(faq?.display_order ?? 0),
    is_active: faq?.is_active ?? true,
  };
}

function bannerToForm(banner?: HomepageBanner, placement: HomepageBanner["placement"] = "MAIN"): BannerForm {
  return {
    id: banner?.id,
    title: banner?.title ?? "",
    description: banner?.description ?? "",
    image_alt_text: banner?.image_alt_text ?? "",
    button_text: banner?.button_text ?? "",
    button_link: banner?.button_link ?? "",
    placement: banner?.placement ?? placement,
    display_order: String(banner?.display_order ?? 0),
    starts_at: banner?.starts_at ? banner.starts_at.slice(0, 16) : "",
    ends_at: banner?.ends_at ? banner.ends_at.slice(0, 16) : "",
    is_active: banner?.is_active ?? true,
  };
}

function Loading() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-slate-200 bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-500/15 ${props.className ?? ""}`}
    />
  );
}

function Panel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminCategoriesScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryForm | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: adminApi.listCategories });
  const services = useQuery({
    queryKey: ["admin", "services", "category-list"],
    queryFn: () => adminApi.listServices({ page_size: 100 }),
  });
  const servicesByCategory = useMemo(() => {
    const grouped = new Map<UUID, AdminService[]>();
    for (const service of services.data?.results ?? []) {
      const categoryServices = grouped.get(service.category) ?? [];
      categoryServices.push(service);
      grouped.set(service.category, categoryServices);
    }
    return grouped;
  }, [services.data?.results]);
  const save = useMutation({
    mutationFn: (payload: CategoryForm) => {
      const body = new FormData();
      body.set("name", payload.name);
      body.set("slug", payload.slug);
      body.set("description", payload.description);
      body.set("external_image_url", payload.image_url);
      body.set("display_order", payload.display_order || "0");
      body.set("is_active", String(payload.is_active));
      if (categoryImage) body.set("image", categoryImage);
      return payload.id ? adminApi.updateCategory(payload.id, body) : adminApi.createCategory(body);
    },
    onSuccess: async () => {
      setForm(null);
      setCategoryImage(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
  const remove = useMutation({
    mutationFn: adminApi.removeCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (form) save.mutate(form);
  }

  return (
    <>
      <AdminPageHeader
        title="Category catalogue"
        description="Categories are the main service groups. Add individual services under the matching category."
        action={
          <Button type="button" onClick={() => setForm(categoryToForm())}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />
      {form ? (
        <Panel title={form.id ? "Edit category" : "New category"} onClose={() => { setForm(null); setCategoryImage(null); }}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <Field label="Name">
              <Input className={fieldClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} required />
            </Field>
            <Field label="Slug">
              <Input className={fieldClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} required />
            </Field>
            <Field label="Image URL">
              <Input className={fieldClass} value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} />
            </Field>
            <Field label="Upload category image">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setCategoryImage(event.target.files?.[0] ?? null)} />
            </Field>
            {form.image_url ? (
              <div className="md:col-span-2">
                <p className={labelClass}>Current image</p>
                <div className="relative mt-2 h-36 max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image src={form.image_url} alt={form.name || "Category image"} fill unoptimized className="object-cover" />
                </div>
              </div>
            ) : null}
            <Field label="Order">
              <Input className={fieldClass} type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
              Active
            </label>
            <Field label="Description">
              <Textarea className="md:col-span-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Button type="submit" disabled={save.isPending}>
                <Save className="h-4 w-4" />
                {save.isPending ? "Saving" : "Save category"}
              </Button>
              {save.isError ? <p className="mt-2 text-sm font-semibold text-red-600">{save.error.message}</p> : null}
            </div>
          </form>
        </Panel>
      ) : null}
      <div className="mt-5">
        {categories.isLoading || services.isLoading ? (
          <Loading />
        ) : categories.isError ? (
          <AdminErrorState message={categories.error.message} onRetry={() => void categories.refetch()} />
        ) : services.isError ? (
          <AdminErrorState message={services.error.message} onRetry={() => void services.refetch()} />
        ) : !categories.data?.results.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-3 font-bold text-slate-950">No categories</h2>
            <p className="mt-1 text-sm text-slate-500">Create a category first, then add services under it.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.data.results.map((category) => {
              const categoryServices = servicesByCategory.get(category.id) ?? [];
              return (
                <section key={category.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {category.image_url ? (
                          <Image src={category.image_url} alt={category.name} fill unoptimized className="object-cover" />
                        ) : (
                          <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-950">{category.name}</h2>
                          <AdminStatusBadge status={category.is_active ? "ACTIVE" : "INACTIVE"} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {categoryServices.length} {categoryServices.length === 1 ? "service" : "services"} · Order {category.display_order ?? 0} · /{category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setForm(categoryToForm(category))}>Edit category</Button>
                      <Button asChild type="button" size="sm">
                        <Link href={`/admin/catalogue/services?category=${encodeURIComponent(category.id)}&new=1`}>
                          <Plus className="h-4 w-4" />
                          Add service
                        </Link>
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove.mutate(category.id)} aria-label={`Delete ${category.name}`}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {categoryServices.length ? (
                    <div className="divide-y divide-slate-100">
                      {categoryServices.map((service) => (
                        <div key={service.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">{service.name}</p>
                              <AdminStatusBadge status={service.is_active ? "ACTIVE" : "INACTIVE"} />
                            </div>
                            <p className="mt-1 line-clamp-1 text-sm text-slate-500">{service.short_description || `Service under ${category.name}`}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{money(service.effective_price)}</p>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/catalogue/services?edit=${encodeURIComponent(service.id)}`}>
                              Manage
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 p-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>No services have been added under this category.</span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/catalogue/services?category=${encodeURIComponent(category.id)}&new=1`}>Add the first service</Link>
                      </Button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export function AdminServicesScreen({
  initialCategoryId,
  initialServiceId,
  openNew = false,
}: {
  initialCategoryId?: string;
  initialServiceId?: string;
  openNew?: boolean;
} = {}) {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: adminApi.listCategories });
  const services = useQuery({ queryKey: ["admin", "services"], queryFn: () => adminApi.listServices({ page_size: 100 }) });
  const [formState, setForm] = useState<ServiceForm | null | undefined>(undefined);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [landingThumbnail, setLandingThumbnail] = useState<File | null>(null);
  const [popupCoverImage, setPopupCoverImage] = useState<File | null>(null);
  const [popupContentImage, setPopupContentImage] = useState<File | null>(null);
  const [listImage, setListImage] = useState<File | null>(null);
  const [galleryService, setGalleryService] = useState<AdminService | null>(null);
  const [galleryImage, setGalleryImage] = useState<File | null>(null);
  const firstCategory = categories.data?.results?.[0]?.id;
  const categoryOptions = useMemo(() => categories.data?.results ?? [], [categories.data?.results]);
  const deepLinkedForm = useMemo(() => {
    const serviceToEdit = services.data?.results.find((service) => service.id === initialServiceId);
    if (serviceToEdit) return serviceToForm(serviceToEdit, firstCategory);
    if (!openNew || !firstCategory) return null;
    const categoryId = categoryOptions.some((category) => category.id === initialCategoryId)
      ? initialCategoryId ?? firstCategory
      : firstCategory;
    return serviceToForm(undefined, categoryId);
  }, [categoryOptions, firstCategory, initialCategoryId, initialServiceId, openNew, services.data?.results]);
  const form = formState === undefined ? deepLinkedForm : formState;

  const save = useMutation({
    mutationFn: (payload: ServiceForm) => {
      const body = new FormData();
      body.set("category", payload.category);
      body.set("name", payload.name);
      body.set("slug", payload.slug);
      body.set("short_description", payload.short_description);
      body.set("landing_group", payload.landing_group);
      body.set("description", payload.description);
      body.set("whats_included", payload.whats_included);
      body.set("whats_excluded", payload.whats_excluded);
      body.set("important_notes", payload.important_notes);
      body.set("base_price", payload.base_price || "0");
      if (payload.selling_price) body.set("selling_price", payload.selling_price);
      body.set("advance_payment_type", payload.advance_payment_type);
      body.set("advance_payment_value", payload.advance_payment_value || "0");
      body.set("estimated_duration_minutes", payload.estimated_duration_minutes || "90");
      body.set("display_order", payload.display_order || "0");
      body.set("is_featured", String(payload.is_featured));
      body.set("is_popular", String(payload.is_popular));
      body.set("is_active", String(payload.is_active));
      if (coverImage) body.set("cover_image", coverImage);
      if (landingThumbnail) body.set("landing_thumbnail", landingThumbnail);
      if (popupCoverImage) body.set("popup_cover_image", popupCoverImage);
      if (popupContentImage) body.set("popup_content_image", popupContentImage);
      if (listImage) body.set("list_image", listImage);
      return payload.id ? adminApi.updateService(payload.id, body) : adminApi.createService(body);
    },
    onSuccess: async () => {
      setForm(null);
      setCoverImage(null);
      setLandingThumbnail(null);
      setPopupCoverImage(null);
      setPopupContentImage(null);
      setListImage(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    },
  });
  const remove = useMutation({ mutationFn: adminApi.removeService, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }) });
  const addImage = useMutation({
    mutationFn: ({ serviceId, file }: { serviceId: UUID; file: File }) => {
      const body = new FormData();
      body.set("image", file);
      body.set("alt_text", galleryService?.name ?? "Service image");
      return adminApi.addServiceImage(serviceId, body);
    },
    onSuccess: async () => {
      setGalleryImage(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    },
  });
  const removeImage = useMutation({
    mutationFn: ({ serviceId, imageId }: { serviceId: UUID; imageId: UUID }) => adminApi.removeServiceImage(serviceId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
  });
  const updateImage = useMutation({
    mutationFn: ({ serviceId, imageId, body }: { serviceId: UUID; imageId: UUID; body: { alt_text?: string; display_order?: number; is_active?: boolean } }) => adminApi.updateServiceImage(serviceId, imageId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] }),
  });

  const selectedGalleryService = useMemo(
    () => services.data?.results.find((service) => service.id === galleryService?.id) ?? galleryService,
    [galleryService, services.data?.results],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    if (form) save.mutate(form);
  }

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Manage service descriptions, prices, offers, visibility, cover images, and gallery images."
        action={
          <Button type="button" onClick={() => setForm(serviceToForm(undefined, firstCategory))} disabled={!firstCategory}>
            <Plus className="h-4 w-4" />
            New service
          </Button>
        }
      />
      {form ? (
        <Panel title={form.id ? "Edit service" : "New service"} onClose={() => setForm(null)}>
          <form className="grid gap-4 lg:grid-cols-3" onSubmit={submit}>
            <Field label="Service name">
              <Input className={fieldClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} required />
            </Field>
            <Field label="Slug">
              <Input className={fieldClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} required />
            </Field>
            <Field label="Category">
              <select className={`${fieldClass} h-11 rounded-lg border px-3 text-sm`} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Landing page group">
              <Input className={fieldClass} value={form.landing_group} onChange={(event) => setForm({ ...form, landing_group: event.target.value })} placeholder="Repair & Services" />
            </Field>
            <Field label="Base price">
              <Input className={fieldClass} type="number" min="0" value={form.base_price} onChange={(event) => setForm({ ...form, base_price: event.target.value })} required />
            </Field>
            <Field label="Selling price">
              <Input className={fieldClass} type="number" min="0" value={form.selling_price} onChange={(event) => setForm({ ...form, selling_price: event.target.value })} />
            </Field>
            <Field label="Duration minutes">
              <Input className={fieldClass} type="number" min="1" value={form.estimated_duration_minutes} onChange={(event) => setForm({ ...form, estimated_duration_minutes: event.target.value })} required />
            </Field>
            <Field label="Advance type">
              <select className={`${fieldClass} h-11 rounded-lg border px-3 text-sm`} value={form.advance_payment_type} onChange={(event) => setForm({ ...form, advance_payment_type: event.target.value as ServiceForm["advance_payment_type"] })}>
                <option value="FIXED">Fixed amount</option>
                <option value="PERCENTAGE">Percentage</option>
              </select>
            </Field>
            <Field label="Advance value">
              <Input className={fieldClass} type="number" min="0" value={form.advance_payment_value} onChange={(event) => setForm({ ...form, advance_payment_value: event.target.value })} />
            </Field>
            <Field label="Display order">
              <Input className={fieldClass} type="number" min="0" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} />
            </Field>
            <Field label="Cover image">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)} />
            </Field>
            <Field label="Landing thumbnail (1600 × 700, 16:7)">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLandingThumbnail(event.target.files?.[0] ?? null)} />
            </Field>
            <Field label="Popup cover (1200 × 750, 8:5)">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPopupCoverImage(event.target.files?.[0] ?? null)} />
            </Field>
            <Field label="Popup content image (1200 × 675, 16:9)">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPopupContentImage(event.target.files?.[0] ?? null)} />
            </Field>
            <Field label="Service list image (600 × 600, 1:1)">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setListImage(event.target.files?.[0] ?? null)} />
            </Field>
            <div className="flex flex-wrap items-center gap-4 pt-6 text-sm font-semibold text-slate-700 lg:col-span-2">
              {(["is_active", "is_featured", "is_popular"] as const).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />
                  {key.replace("is_", "").replace("_", " ")}
                </label>
              ))}
            </div>
            <Field label="Short description">
              <Textarea value={form.short_description} onChange={(event) => setForm({ ...form, short_description: event.target.value })} />
            </Field>
            <Field label="Full description">
              <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </Field>
            <Field label="What is included">
              <Textarea value={form.whats_included} onChange={(event) => setForm({ ...form, whats_included: event.target.value })} />
            </Field>
            <Field label="What is excluded">
              <Textarea value={form.whats_excluded} onChange={(event) => setForm({ ...form, whats_excluded: event.target.value })} />
            </Field>
            <Field label="Important notes">
              <Textarea value={form.important_notes} onChange={(event) => setForm({ ...form, important_notes: event.target.value })} />
            </Field>
            <div className="lg:col-span-3">
              <Button type="submit" disabled={save.isPending}>
                <Save className="h-4 w-4" />
                {save.isPending ? "Saving" : "Save service"}
              </Button>
              {save.isError ? <p className="mt-2 text-sm font-semibold text-red-600">{save.error.message}</p> : null}
            </div>
          </form>
        </Panel>
      ) : null}
      {selectedGalleryService ? (
        <Panel title={`Images for ${selectedGalleryService.name}`} onClose={() => setGalleryService(null)}>
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="rounded-lg border border-slate-200 p-4">
              <Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setGalleryImage(event.target.files?.[0] ?? null)} />
              <Button className="mt-3 w-full" type="button" disabled={!galleryImage || addImage.isPending} onClick={() => galleryImage && addImage.mutate({ serviceId: selectedGalleryService.id, file: galleryImage })}>
                <Upload className="h-4 w-4" />
                Upload image
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedGalleryService.images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <div className="relative aspect-[4/3]">
                    <Image src={image.image} alt={image.alt_text || selectedGalleryService.name} fill unoptimized className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="grid min-w-0 gap-2">
                      <Input className="h-9" defaultValue={image.alt_text} aria-label="Image alt text" onBlur={(event) => { if (event.target.value !== image.alt_text) updateImage.mutate({ serviceId: selectedGalleryService.id, imageId: image.id, body: { alt_text: event.target.value } }); }} />
                      <div className="flex items-center gap-2"><Input className="h-9 w-20" type="number" min="0" defaultValue={image.display_order} aria-label="Image display order" onBlur={(event) => { const value = Number(event.target.value); if (value !== image.display_order) updateImage.mutate({ serviceId: selectedGalleryService.id, imageId: image.id, body: { display_order: value } }); }} /><button type="button" onClick={() => updateImage.mutate({ serviceId: selectedGalleryService.id, imageId: image.id, body: { is_active: !image.is_active } })}><AdminStatusBadge status={image.is_active ? "ACTIVE" : "INACTIVE"} /></button></div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImage.mutate({ serviceId: selectedGalleryService.id, imageId: image.id })}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
              {!selectedGalleryService.images.length ? <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500">No gallery images yet.</div> : null}
            </div>
          </div>
        </Panel>
      ) : null}
      <div className="mt-5">
        {services.isLoading || categories.isLoading ? <Loading /> : services.isError ? <AdminErrorState message={services.error.message} onRetry={() => void services.refetch()} /> : (
          <AdminDataTable
            rows={services.data?.results ?? []}
            getRowKey={(service) => service.id}
            emptyIcon={Package}
            emptyTitle="No services"
            emptyMessage="Create services to publish them on the customer site."
            columns={[
              { key: "name", header: "Service", render: (service) => <span className="font-semibold text-slate-950">{service.name}</span> },
              { key: "category", header: "Category", render: (service) => service.category_detail.name },
              { key: "price", header: "Price", render: (service) => money(service.effective_price) },
              { key: "advance", header: "Advance", render: (service) => money(service.advance_amount) },
              { key: "status", header: "Status", render: (service) => <AdminStatusBadge status={service.is_active ? "ACTIVE" : "INACTIVE"} /> },
              {
                key: "actions",
                header: "Actions",
                render: (service) => (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setCoverImage(null); setForm(serviceToForm(service, firstCategory)); }}>Edit</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setGalleryService(service)}>
                      <ImagePlus className="h-4 w-4" />
                      Images
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove.mutate(service.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </>
  );
}

export function AdminPackagesScreen() {
  const query = useQuery({ queryKey: ["admin", "services", "packages"], queryFn: () => adminApi.listServices({ page_size: 50 }) });
  return (
    <>
      <AdminPageHeader title="Packages" description="Bundle-style offers are managed through service records for now." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results.filter((service) => service.is_popular || service.is_featured) ?? []}
          getRowKey={(service) => service.id}
          emptyIcon={Package}
          emptyTitle="No packages"
          emptyMessage="Mark services as featured or popular to use them as package offers."
          columns={[
            { key: "name", header: "Offer", render: (service) => <span className="font-semibold text-slate-950">{service.name}</span> },
            { key: "category", header: "Category", render: (service) => service.category_detail.name },
            { key: "price", header: "Price", render: (service) => money(service.effective_price) },
            { key: "flags", header: "Flags", render: (service) => [service.is_featured && "Featured", service.is_popular && "Popular"].filter(Boolean).join(", ") || "-" },
          ]}
        />
      )}
    </>
  );
}

export function AdminFaqsScreen() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: adminApi.listCategories });
  const services = useQuery({ queryKey: ["admin", "services"], queryFn: () => adminApi.listServices({ page_size: 100 }) });
  const [search, setSearch] = useState("");
  const faqs = useQuery({ queryKey: ["admin", "faqs", search], queryFn: () => adminApi.listFaqs({ page_size: 50, search: search || undefined }) });
  const [form, setForm] = useState<FaqForm | null>(null);
  const firstCategory = categories.data?.results?.[0]?.id;
  const firstService = services.data?.results?.[0]?.id;
  const save = useMutation({
    mutationFn: (payload: FaqForm) => {
      const body = {
        question: payload.question,
        answer: payload.answer,
        category: payload.category || null,
        service: payload.service || null,
        package: payload.package,
        display_order: Number(payload.display_order || 0),
        is_active: payload.is_active,
      };
      return payload.id ? adminApi.updateFaq(payload.id, body) : adminApi.createFaq(body);
    },
    onSuccess: async () => {
      setForm(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });
    },
  });
  const remove = useMutation({ mutationFn: adminApi.removeFaq, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] }) });

  return (
    <>
      <AdminPageHeader title="FAQs" description="Publish answers for service and category pages." action={<Button type="button" onClick={() => setForm(faqToForm(undefined, firstCategory, firstService))}><Plus className="h-4 w-4" />New FAQ</Button>} />
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search FAQ questions and answers" /></div>
      {form ? (
        <Panel title={form.id ? "Edit FAQ" : "New FAQ"} onClose={() => setForm(null)}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); save.mutate(form); }}>
            <Field label="Question"><Input className={fieldClass} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} required /></Field>
            <Field label="Order"><Input className={fieldClass} type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></Field>
            <Field label="Category"><select className={`${fieldClass} h-11 rounded-lg border px-3 text-sm`} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">General</option>{categories.data?.results.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Service"><select className={`${fieldClass} h-11 rounded-lg border px-3 text-sm`} value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}><option value="">All services</option>{services.data?.results.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Package label"><Input className={fieldClass} value={form.package} onChange={(event) => setForm({ ...form, package: event.target.value })} /></Field>
            <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active</label>
            <Field label="Answer"><Textarea className="md:col-span-2" value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required /></Field>
            <div className="md:col-span-2"><Button type="submit" disabled={save.isPending}><Save className="h-4 w-4" />Save FAQ</Button>{save.isError ? <p className="mt-2 text-sm font-semibold text-red-600">{save.error.message}</p> : null}</div>
          </form>
        </Panel>
      ) : null}
      <div className="mt-5">
        {faqs.isLoading ? <Loading /> : faqs.isError ? <AdminErrorState message={faqs.error.message} onRetry={() => void faqs.refetch()} /> : (
          <AdminDataTable
            rows={faqs.data?.results ?? []}
            getRowKey={(faq) => faq.id}
            emptyIcon={BookOpen}
            emptyTitle="No FAQs"
            emptyMessage="Add FAQ entries for common customer questions."
            columns={[
              { key: "question", header: "Question", render: (faq) => <span className="font-semibold text-slate-950">{faq.question}</span> },
              { key: "order", header: "Order", render: (faq) => faq.display_order },
              { key: "status", header: "Status", render: (faq) => <AdminStatusBadge status={faq.is_active ? "ACTIVE" : "INACTIVE"} /> },
              { key: "actions", header: "Actions", render: (faq) => <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setForm(faqToForm(faq, firstCategory, firstService))}>Edit</Button><Button type="button" variant="ghost" size="icon" onClick={() => remove.mutate(faq.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div> },
            ]}
          />
        )}
      </div>
    </>
  );
}

export function AdminBannersScreen({ placement, title }: { placement?: HomepageBanner["placement"]; title?: string }) {
  const queryClient = useQueryClient();
  const banners = useQuery({ queryKey: ["admin", "banners", placement ?? "all"], queryFn: () => adminApi.listHomepageBanners({ page_size: 50, placement }) });
  const [form, setForm] = useState<BannerForm | null>(null);
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const defaultPlacement = placement ?? "MAIN";
  const save = useMutation({
    mutationFn: (payload: BannerForm) => {
      const body = new FormData();
      body.set("title", payload.title);
      body.set("description", payload.description);
      body.set("image_alt_text", payload.image_alt_text);
      body.set("button_text", payload.button_text);
      body.set("button_link", payload.button_link);
      body.set("placement", payload.placement);
      body.set("display_order", payload.display_order || "0");
      body.set("starts_at", payload.starts_at ? new Date(payload.starts_at).toISOString() : "");
      body.set("ends_at", payload.ends_at ? new Date(payload.ends_at).toISOString() : "");
      body.set("is_active", String(payload.is_active));
      if (desktopImage) body.set("desktop_image", desktopImage);
      if (mobileImage) body.set("mobile_image", mobileImage);
      return payload.id ? adminApi.updateHomepageBanner(payload.id, body) : adminApi.createHomepageBanner(body);
    },
    onSuccess: async () => {
      setForm(null);
      setDesktopImage(null);
      setMobileImage(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    },
  });
  const remove = useMutation({ mutationFn: adminApi.removeHomepageBanner, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }) });

  return (
    <>
      <AdminPageHeader title={title ?? "Homepage Banners"} description="Manage hero, category, service, and carousel content." action={<Button type="button" onClick={() => setForm(bannerToForm(undefined, defaultPlacement))}><Plus className="h-4 w-4" />New banner</Button>} />
      {form ? (
        <Panel title={form.id ? "Edit banner" : "New banner"} onClose={() => setForm(null)}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); save.mutate(form); }}>
            <Field label="Title"><Input className={fieldClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field>
            <Field label="Placement"><select className={`${fieldClass} h-11 rounded-lg border px-3 text-sm`} value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value as HomepageBanner["placement"] })} disabled={Boolean(placement)}><option value="MAIN">Main banner</option><option value="PROMOTIONAL_CAROUSEL">Promotional carousel</option><option value="CATEGORY">Category banner</option><option value="SERVICE_PAGE">Service page</option></select></Field>
            <Field label="Desktop image"><Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setDesktopImage(event.target.files?.[0] ?? null)} required={!form.id} /></Field>
            <Field label="Mobile image"><Input className={fieldClass} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setMobileImage(event.target.files?.[0] ?? null)} /></Field>
            <Field label="Image alt text"><Input className={fieldClass} value={form.image_alt_text} onChange={(event) => setForm({ ...form, image_alt_text: event.target.value })} required /></Field>
            <Field label="Button text"><Input className={fieldClass} value={form.button_text} onChange={(event) => setForm({ ...form, button_text: event.target.value })} /></Field>
            <Field label="Button link"><Input className={fieldClass} value={form.button_link} onChange={(event) => setForm({ ...form, button_link: event.target.value })} /></Field>
            <Field label="Order"><Input className={fieldClass} type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></Field>
            <Field label="Starts at"><Input className={fieldClass} type="datetime-local" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} /></Field>
            <Field label="Ends at"><Input className={fieldClass} type="datetime-local" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active</label>
            <Field label="Description"><Textarea className="md:col-span-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
            <div className="md:col-span-2"><Button type="submit" disabled={save.isPending}><Save className="h-4 w-4" />Save banner</Button>{save.isError ? <p className="mt-2 text-sm font-semibold text-red-600">{save.error.message}</p> : null}</div>
          </form>
        </Panel>
      ) : null}
      <div className="mt-5">
        {banners.isLoading ? <Loading /> : banners.isError ? <AdminErrorState message={banners.error.message} onRetry={() => void banners.refetch()} /> : (
          <AdminDataTable
            rows={banners.data?.results ?? []}
            getRowKey={(banner) => banner.id}
            emptyIcon={ImagePlus}
            emptyTitle="No banners"
            emptyMessage="Upload banners to control website content."
            columns={[
              { key: "title", header: "Title", render: (banner) => <span className="font-semibold text-slate-950">{banner.title}</span> },
              { key: "placement", header: "Placement", render: (banner) => banner.placement.replaceAll("_", " ") },
              { key: "order", header: "Order", render: (banner) => banner.display_order },
              { key: "status", header: "Status", render: (banner) => <AdminStatusBadge status={banner.is_active ? "ACTIVE" : "INACTIVE"} /> },
              { key: "actions", header: "Actions", render: (banner) => <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => { setDesktopImage(null); setMobileImage(null); setForm(bannerToForm(banner, defaultPlacement)); }}>Edit</Button><Button type="button" variant="ghost" size="icon" onClick={() => remove.mutate(banner.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div> },
            ]}
          />
        )}
      </div>
    </>
  );
}
