"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useRef, useState } from "react";

import { Input } from "@/components/ui/input";

type Option = { value: string; label: string };

export function AdminSearchSelect({ value, options, placeholder, onChange, onSearch, loading = false }: {
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  return (
    <div ref={container} className="relative">
      <button type="button" role="combobox" aria-expanded={open} onClick={() => setOpen((current) => !current)} onBlur={(event) => { if (!container.current?.contains(event.relatedTarget)) setOpen(false); }} className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm">
        <span className={value ? "font-medium text-slate-800" : "text-slate-500"}>{selected?.label || selectedLabel || placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 text-slate-400" />
      </button>
      {open ? <div className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="relative border-b p-2"><Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input autoFocus value={search} onChange={(event) => { setSearch(event.target.value); onSearch(event.target.value); }} className="h-9 pl-9" placeholder="Type to search" /></div>
        <div className="max-h-60 overflow-y-auto p-1">
          <button type="button" className="flex min-h-10 w-full items-center rounded px-3 text-left text-sm hover:bg-violet-50" onClick={() => { onChange(""); setSelectedLabel(""); setOpen(false); setSearch(""); onSearch(""); }}>{placeholder}</button>
          {options.map((option) => <button key={option.value} type="button" className="flex min-h-10 w-full items-center justify-between rounded px-3 text-left text-sm hover:bg-violet-50" onClick={() => { onChange(option.value); setSelectedLabel(option.label); setOpen(false); setSearch(""); onSearch(""); }}><span>{option.label}</span>{option.value === value ? <Check className="h-4 w-4 text-violet-700" /> : null}</button>)}
          {loading ? <p className="p-3 text-center text-sm text-slate-500">Searching…</p> : null}
          {!loading && !options.length ? <p className="p-3 text-center text-sm text-slate-500">No matches</p> : null}
        </div>
      </div> : null}
    </div>
  );
}
