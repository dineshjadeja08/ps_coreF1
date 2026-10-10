import { ChevronDown } from "lucide-react";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group p-4 open:bg-violet-50/40">
      <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-50 text-primary"><ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></span>
      </summary>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-secondary">{answer}</p>
    </details>
  );
}
