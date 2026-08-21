import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFriendlyApiMessage } from "@/lib/api/errors";

type ErrorStateProps = {
  title?: string;
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ title = "We could not load this section", error, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex gap-4">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-secondary">{getFriendlyApiMessage(error)}</p>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
