"use client";

import { useSearchParams } from "next/navigation";

export function useSelectedAccountId() {
  const searchParams = useSearchParams();

  return searchParams.get("accountId") ?? "";
}
