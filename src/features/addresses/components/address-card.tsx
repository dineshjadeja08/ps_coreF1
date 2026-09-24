import { CheckCircle2, Home, MapPin, Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Address } from "@/features/addresses/types";

type AddressCardProps = {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault?: (id: string) => void;
  deleting?: boolean;
  settingDefault?: boolean;
};

export function AddressCard({ address, onEdit, onDelete, onSetDefault, deleting, settingDefault }: AddressCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary sm:h-10 sm:w-10">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{address.label}</h3>
              {address.is_default ? (
                <span className="inline-flex items-center gap-1 rounded-sm bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Default
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">{address.recipient_name}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              {address.address_line_1}
              {address.address_line_2 ? `, ${address.address_line_2}` : ""}
              {address.locality ? `, ${address.locality}` : ""}
              {address.landmark ? `, near ${address.landmark}` : ""}
              {`, ${address.city}, ${address.state} ${address.postal_code}`}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-secondary">
              <MapPin className="h-4 w-4 text-primary" />
              {address.phone}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onEdit(address)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        {!address.is_default && onSetDefault ? (
          <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => onSetDefault(address.id)} disabled={settingDefault}>
            <Star className="h-4 w-4" />
            Set default
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => onDelete(address.id)} disabled={deleting}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </article>
  );
}
