"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type AccountChangeDetail = {
  accountId?: string;
};

export function useSelectedAccountId() {
  const pathname = usePathname();
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    setSelectedAccountId(new URLSearchParams(window.location.search).get("accountId") ?? "");
  }, [pathname]);

  useEffect(() => {
    const handleAccountChange = (event: Event) => {
      const customEvent = event as CustomEvent<AccountChangeDetail>;
      const nextAccountId = customEvent.detail?.accountId;

      if (typeof nextAccountId === "string") {
        setSelectedAccountId(nextAccountId);
        return;
      }

      setSelectedAccountId(new URLSearchParams(window.location.search).get("accountId") ?? "");
    };

    const handlePopState = () => {
      setSelectedAccountId(new URLSearchParams(window.location.search).get("accountId") ?? "");
    };

    window.addEventListener("bb-account-change", handleAccountChange as EventListener);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("bb-account-change", handleAccountChange as EventListener);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return selectedAccountId;
}
