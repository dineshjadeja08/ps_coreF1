"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { routes } from "@/constants/routes";
import { ServiceIcon } from "@/features/catalogue/components/service-icon";

const OPEN_APPLIANCE_SELECTOR_EVENT = "purple-squad:open-appliance-selector";

const applianceServices = [
  { name: "AC Repair & Services", slug: "ac-services" },
  { name: "Washing Machine Repair", slug: "washing-machine-repair-service" },
  { name: "Refrigerator Repair & Services", slug: "refrigerator-repair-services" },
  { name: "TV Repair & Services", slug: "tv-repair-services" },
  { name: "Geyser Repair & Services", slug: "geyser-repair-services" },
  { name: "Water Purifier & Services", slug: "water-purifier-repair-services" },
  { name: "CCTV Repair & Installation", slug: "cctv-cameras-repair-installation" },
  { name: "Microwave Oven Repair", slug: "microwave-oven-repair-services" },
  { name: "Dishwasher Repair", slug: "dishwasher-repair-service" },
] as const;

export function openApplianceSelector() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_APPLIANCE_SELECTOR_EVENT));
  }
}

export function ApplianceSelectorDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_APPLIANCE_SELECTOR_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_APPLIANCE_SELECTOR_EVENT, handleOpen);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[100] max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-7 pt-3 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[85vh] sm:w-[min(92vw,680px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-300 sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground sm:text-2xl">Choose an appliance service</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-5 text-secondary">
                Select the appliance you need help with.
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 text-secondary transition hover:bg-zinc-100 hover:text-foreground" aria-label="Close appliance selector">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4">
            {applianceServices.map((item) => {
              const content = (
                <>
                  <ServiceIcon
                    label={item.name}
                    className="h-14 w-14 bg-zinc-50 sm:h-20 sm:w-20"
                    imageClassName="p-1.5 sm:p-2"
                  />
                  <span className="text-[11px] font-semibold leading-4 text-foreground sm:text-sm">{item.name}</span>
                </>
              );

              return (
                <Dialog.Close asChild key={item.name}>
                  <Link href={routes.serviceCategory(item.slug)} className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 text-center transition hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-40 sm:p-3">
                    {content}
                  </Link>
                </Dialog.Close>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
