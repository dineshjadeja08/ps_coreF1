"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadAllPages } from "@/features/admin/load-all-pages";
import { blogSlug } from "@/features/blog/body";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminBlogPost, BlogPostWriteRequest, UUID } from "@/types/api";

type BlogForm = BlogPostWriteRequest & { id?: UUID; published_at?: string | null };
const emptyForm: BlogForm = {
  title: "", slug: "", excerpt: "", body: "", author_name: "Purple Squad Team",
  cover_image_url: "", related_service: null, is_published: false,
};
const inputClass = "grid gap-2 text-sm font-semibold text-slate-800";

function toForm(post: AdminBlogPost): BlogForm {
  return {
    id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt,
    body: post.body, author_name: post.author_name, cover_image_url: post.cover_image_url,
    related_service: post.related_service, is_published: post.is_published, published_at: post.published_at,
  };
}

export function AdminBlogScreen() {
  const client = useQueryClient();
  const [form, setForm] = useState<BlogForm | null>(null);
  const [notice, setNotice] = useState("");
  const posts = useQuery({
    queryKey: ["admin", "blog-posts"],
    queryFn: () => loadAllPages((page) => adminApi.listBlogPosts({ page, page_size: 100 })),
  });
  const services = useQuery({
    queryKey: ["admin", "blog-services"],
    queryFn: () => loadAllPages((page) => adminApi.listServices({ page, page_size: 100 })),
    staleTime: 5 * 60_000,
    enabled: Boolean(form),
  });
  const save = useMutation({
    mutationFn: (current: BlogForm) => {
      const body: BlogPostWriteRequest = {
        title: current.title.trim(), slug: current.slug.trim(), excerpt: current.excerpt.trim(),
        body: current.body.trim(), author_name: current.author_name.trim(),
        cover_image_url: current.cover_image_url.trim(), related_service: current.related_service || null,
        is_published: current.is_published,
      };
      return current.id ? adminApi.updateBlogPost(current.id, body) : adminApi.createBlogPost(body);
    },
    onSuccess: async (saved) => {
      setForm(null);
      setNotice(saved.is_published ? "Article published." : "Draft saved.");
      await client.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form) save.mutate(form);
  }

  return (
    <div>
      <AdminPageHeader title="Home Care Guides" description="Write helpful articles, save drafts, and publish when reviewed." action={<Button type="button" onClick={() => { save.reset(); setNotice(""); setForm({ ...emptyForm }); }}><Plus className="h-4 w-4" />New article</Button>} />
      {notice ? <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p> : null}
      {posts.isLoading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : null}
      {posts.isError ? <AdminErrorState message={posts.error.message} onRetry={() => void posts.refetch()} /> : null}
      {posts.data?.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">No articles yet. Start with a practical question customers ask before booking.</p> : null}
      <div className="grid gap-3">
        {posts.data?.map((post) => <article key={post.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{post.is_published ? "PUBLISHED" : "DRAFT"} · /blog/{post.slug}</p><h2 className="mt-1 font-bold text-slate-950">{post.title}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p></div>
          <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => { save.reset(); setNotice(""); setForm(toForm(post)); }}>Edit</Button>{post.is_published ? <Button asChild variant="ghost" size="sm"><Link href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">View</Link></Button> : null}</div>
        </article>)}
      </div>
      {form ? <Dialog.Root open onOpenChange={(open) => { if (!open && !save.isPending) setForm(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl focus:outline-none">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5"><div><Dialog.Title className="text-xl font-bold">{form.id ? "Edit article" : "New article"}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-slate-500">Only published articles appear on the website and sitemap.</Dialog.Description></div><Dialog.Close disabled={save.isPending} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close article editor"><X className="h-5 w-5" /></Dialog.Close></div>
            <form id="blog-editor" onSubmit={submit} className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-5">
              <label className={inputClass}>Title<Input required maxLength={220} value={form.title} onChange={(event) => { const title = event.target.value; setForm({ ...form, title, slug: !form.published_at && (!form.slug || form.slug === blogSlug(form.title)) ? blogSlug(title) : form.slug }); }} /></label>
              <label className={inputClass}>URL slug<Input required maxLength={240} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} disabled={Boolean(form.published_at)} onChange={(event) => setForm({ ...form, slug: event.target.value })} /><span className="text-xs font-normal text-slate-500">{form.published_at ? "Locked after publication to protect existing links." : "Lowercase letters, numbers, and hyphens."}</span></label>
              <label className={inputClass}>Short summary<textarea required maxLength={320} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} className="min-h-24 rounded-lg border border-slate-200 p-3 text-sm font-normal" placeholder="What will a reader learn?" /></label>
              <label className={inputClass}>Article body<textarea required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className="min-h-72 rounded-lg border border-slate-200 p-3 text-sm font-normal" placeholder={"Write useful guidance here.\n\n## A section heading\nAdd details in short paragraphs.\n\n- First practical step\n- Second practical step"} /><span className="text-xs font-normal text-slate-500">Plain text and Markdown basics: separate paragraphs with a blank line, use ## / ### for headings, and start list items with - or 1.</span></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={inputClass}>Author name<Input required maxLength={120} value={form.author_name} onChange={(event) => setForm({ ...form, author_name: event.target.value })} /></label>
                <label className={inputClass}>Related service<select className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm" value={form.related_service ?? ""} disabled={services.isLoading || services.isError} onChange={(event) => setForm({ ...form, related_service: event.target.value || null })}><option value="">None</option>{services.data?.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
              </div>
              <label className={inputClass}>Cover image URL (optional)<Input type="url" value={form.cover_image_url} onChange={(event) => setForm({ ...form, cover_image_url: event.target.value })} placeholder="https://..." /><span className="text-xs font-normal text-slate-500">Use a public HTTPS image URL, ideally a real service photo.</span></label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-semibold"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />Publish article{form.is_published ? " (visible to everyone)" : " (leave off to save a private draft)"}</label>
            </form>
            <div className="shrink-0 border-t border-slate-200 bg-white p-5"><Button form="blog-editor" type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : form.is_published ? "Publish article" : "Save draft"}</Button>{save.isError ? <p role="alert" className="mt-3 text-sm text-red-600">{save.error.message}</p> : null}{services.isError ? <p role="alert" className="mt-3 text-sm text-red-600">Could not load related services. You can still save without one.</p> : null}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root> : null}
    </div>
  );
}
