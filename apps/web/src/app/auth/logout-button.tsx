"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabaseClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";

type LogoutButtonProps = {
  isSidebarContext?: boolean;
  isCollapsed?: boolean;
  label?: string;
};

export function LogoutButton({ isSidebarContext = false, isCollapsed = false, label }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleLogout() {
    setLoading(true);
    await supabaseClient.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50";
  
  const contextStyles = isSidebarContext
    ? "group relative w-full px-3 py-2.5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
    : "h-10 border border-border bg-surface-1 px-3 text-primary hover:bg-surface-2";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`${baseStyles} ${contextStyles}`}
    >
      {isSidebarContext ? (
        <>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-5 w-5 shrink-0 ${isCollapsed ? "mx-auto" : "mr-3"}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          
          {!isCollapsed && <span>{loading ? `${t("logout.button")}...` : t("logout.button")}</span>}
          
          {isCollapsed && (
            <div className="absolute left-full ml-4 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50">
               {t("logout.tooltip")}
            </div>
          )}
        </>
      ) : (
        loading ? `${t("logout.button")}...` : (label ?? t("logout.button"))
      )}
    </button>
  );
}
