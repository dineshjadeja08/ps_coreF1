"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { AdminService } from "@/types/api";

type Props = {
  services: AdminService[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  loading?: boolean;
};

export function LeadServiceCombobox({ services, value, onChange, error, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeServices = useMemo(
    () => services.filter((service) => service.is_active && service.name.toLowerCase().includes(search.trim().toLowerCase())),
    [search, services],
  );
  const groups = useMemo(() => {
    const grouped = new Map<string, AdminService[]>();
    for (const service of activeServices) {
      const category = service.category_detail?.name || "Services";
      grouped.set(category, [...(grouped.get(category) ?? []), service]);
    }
    return [...grouped.entries()];
  }, [activeServices]);
  const selected = services.find((service) => service.id === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        id="lead-service"
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="lead-service-listbox"
        aria-haspopup="listbox"
        aria-invalid={Boolean(error)}
        onClick={() => setOpen((current) => !current)}
        onBlur={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget)) setOpen(false);
        }}
        className="flex h-[50px] w-full items-center justify-between rounded-md border border-border bg-white px-4 text-left text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
      >
        <span className={selected ? "font-medium text-foreground" : "text-muted-foreground"}>
          {loading ? "Loading services..." : selected?.name || "Select service"}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-secondary" />
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-xl">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services" className="h-10 pl-9" />
          </div>
          <div id="lead-service-listbox" role="listbox" className="max-h-72 overflow-y-auto p-2">
            {groups.map(([category, items]) => (
              <div key={category} className="pb-2 last:pb-0">
                <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-secondary">{category}</p>
                {items.map((service) => (
                  <button
                    key={service.id}
                    id={`lead-service-option-${service.id}`}
                    type="button"
                    role="option"
                    aria-selected={service.id === value}
                    onClick={() => {
                      onChange(service.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-primary-subtle focus:bg-primary-subtle focus:outline-none"
                  >
                    <span>{service.name}</span>
                    {service.id === value ? <Check className="h-4 w-4 text-primary" /> : null}
                  </button>
                ))}
              </div>
            ))}
            {!groups.length ? <p className="p-4 text-center text-sm text-secondary">No services found.</p> : null}
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
