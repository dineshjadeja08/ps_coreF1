"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/features/addresses/components/address-card";
import { AddressForm } from "@/features/addresses/components/address-form";
import type { Address } from "@/features/addresses/types";
import { AddressFormValues } from "@/features/addresses/schema";
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/features/addresses/queries";
import { getFriendlyApiMessage } from "@/lib/api/errors";

export function AddressManager({ compact = false }: { compact?: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [message, setMessage] = useState("");
  const addresses = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const items = [...(addresses.data?.results ?? [])].sort((first, second) => Number(second.is_default) - Number(first.is_default));
  const defaultAddress = items.find((address) => address.is_default);

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setMessage("");
  }

  async function handleSubmit(values: AddressFormValues) {
    setMessage("");
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing.id, body: values });
      } else {
        await createAddress.mutateAsync(values);
      }
      closeForm();
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    }
  }

  async function handleDelete(id: string) {
    setMessage("");
    try {
      await deleteAddress.mutateAsync(id);
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    }
  }

  async function handleSetDefault(id: string) {
    setMessage("");
    try {
      await updateAddress.mutateAsync({ id, body: { is_default: true } });
    } catch (error) {
      setMessage(getFriendlyApiMessage(error));
    }
  }

  return (
    <section className={compact ? "space-y-4" : "space-y-5"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Saved addresses</h2>
          <p className="mt-1 text-sm text-secondary">
            {items.length
              ? `${items.length} saved ${items.length === 1 ? "address" : "addresses"}${defaultAddress ? `, default is ${defaultAddress.label}` : ""}.`
              : "Add and manage service addresses for future bookings."}
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </div>

      {message ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{message}</p> : null}

      {showForm || editing ? (
        <AddressForm
          initialAddress={editing}
          submitting={createAddress.isPending || updateAddress.isPending}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      ) : null}

      {addresses.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-lg border border-border bg-surface" />
          ))}
        </div>
      ) : null}

      {addresses.isError ? <ErrorState title="We could not load your addresses" error={addresses.error} onRetry={() => addresses.refetch()} /> : null}

      {items.length ? (
        <div className="grid gap-3">
          {items.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={(item) => {
                setEditing(item);
                setShowForm(false);
                setMessage("");
              }}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              deleting={deleteAddress.isPending}
              settingDefault={updateAddress.isPending}
            />
          ))}
        </div>
      ) : null}

      {addresses.data && items.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">No saved addresses</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            Add a serviceable address now so the next booking phase can move faster.
          </p>
          <Button type="button" variant="secondary" className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add address
          </Button>
        </div>
      ) : null}
    </section>
  );
}
