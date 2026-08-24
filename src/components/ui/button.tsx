import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(108,59,255,0.18)] hover:bg-primary-hover hover:shadow-[0_12px_24px_rgba(108,59,255,0.22)]",
        secondary: "bg-primary-soft text-primary hover:bg-primary-soft/80",
        outline: "border border-border bg-surface text-foreground hover:border-primary/30 hover:bg-primary-subtle",
        ghost: "text-foreground hover:bg-muted",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-5",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
