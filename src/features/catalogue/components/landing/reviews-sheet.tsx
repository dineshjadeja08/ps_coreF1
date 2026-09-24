"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { ReviewCard } from "@/features/catalogue/components/review-card";
import type { Review } from "@/features/catalogue/types";

export function ReviewsSheet({ open, reviews, onOpenChange }: { open: boolean; reviews: Review[]; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55" />
        <Dialog.Content asChild>
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl focus:outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(680px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><Dialog.Title className="text-2xl font-extrabold">Customer reviews</Dialog.Title><Dialog.Description className="mt-1 text-sm text-secondary">Verified feedback submitted after completed bookings.</Dialog.Description></div>
              <Dialog.Close className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border" aria-label="Close reviews"><X className="h-5 w-5" /></Dialog.Close>
            </div>
            <div className="mt-5 grid gap-4">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
