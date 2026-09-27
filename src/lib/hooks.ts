"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Account, Portfolio } from "@/lib/types";

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<Account>("/me"),
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => apiFetch<Portfolio>("/portfolio"),
    refetchOnWindowFocus: true,
  });
}


export interface BillingInfo {
  plan: string;
  is_pro: boolean;
  features: { key: string; label: string; desc: string; pro: boolean; has: boolean }[];
}

export function useFeatures() {
  const q = useQuery({
    queryKey: ["billing-info"],
    queryFn: () => apiFetch<BillingInfo>("/billing/info"),
    staleTime: 15000,
    refetchOnWindowFocus: true,
  });
  const has = (key: string) => !!q.data?.features?.find((f) => f.key === key)?.has;
  return { has, plan: q.data?.plan ?? "free", isLoading: q.isLoading, data: q.data };
}
