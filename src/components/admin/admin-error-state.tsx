import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" />
        <div>
          <h3 className="text-sm font-bold text-red-950">Could not load this admin view</h3>
          <p className="mt-1 text-sm text-red-800">{message}</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" className="mt-3" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
