import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = ["Service", "Address", "Date & Time", "Review"];

export function BookingStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2 rounded-lg border border-border bg-surface p-2">
      {steps.map((step, index) => {
        const complete = index < currentStep;
        const active = index === currentStep;
        return (
          <li
            key={step}
            className={cn(
              "flex min-h-12 items-center justify-center gap-2 rounded-lg px-2 text-center text-xs font-semibold sm:text-sm",
              active && "bg-primary-soft text-primary",
              complete && "text-success",
              !active && !complete && "text-muted-foreground",
            )}
          >
            {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            <span className="hidden sm:inline">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
