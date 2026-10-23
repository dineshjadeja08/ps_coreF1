"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";

export function AdminDetailPanel({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl focus:outline-none">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 p-5"><div><Dialog.Title className="text-xl font-bold text-slate-950">{title}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-slate-500">View or manage this record.</Dialog.Description></div><Dialog.Close className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close details"><X className="h-5 w-5" /></Dialog.Close></div>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
