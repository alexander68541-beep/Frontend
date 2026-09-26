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
