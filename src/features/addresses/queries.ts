"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addressesApi } from "@/features/addresses/api";
import type { AddressRequest } from "@/features/addresses/types";
import { queryKeys } from "@/lib/api/query-keys";

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: addressesApi.list,
  });
}

export function useAddressServiceability(postalCode: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.addressServiceability(postalCode),
    queryFn: () => addressesApi.checkServiceability(postalCode),
    enabled,
    retry: 0,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddressRequest) => addressesApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AddressRequest> }) => addressesApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}
