export const serviceCities = ["Chennai", "Bangalore", "Coimbatore"] as const;

export const designTokens = {
  containers: {
    page: "max-w-7xl",
    narrow: "max-w-4xl",
  },
  touchTarget: "min-h-11 min-w-11",
  focusRing: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  motion: {
    fast: "duration-150",
    base: "duration-200",
  },
  shadows: {
    card: "shadow-[var(--shadow-card)]",
    soft: "shadow-[var(--shadow-soft)]",
    float: "shadow-[var(--shadow-float)]",
  },
} as const;

export const trustPromises = [
  {
    title: "Verified professionals",
    description: "Purple Squad checks every technician before assigning home visits.",
  },
  {
    title: "Clear service packages",
    description: "See what is included, expected duration, advance, and balance before booking.",
  },
  {
    title: "Support after booking",
    description: "Get help with service selection, rescheduling, payment links, and follow-up.",
  },
] as const;
