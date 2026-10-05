"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { CartProvider } from "@/features/cart/use-cart";
import { AuthProvider } from "@/features/auth/provider";
import { PushNotifications } from "@/features/notifications/push-notifications";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      });
      client.setQueryDefaults(["admin"], {
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
      });
      return client;
    },
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider><PushNotifications /><CartProvider>{children}</CartProvider></AuthProvider>
    </QueryClientProvider>
  );
}
