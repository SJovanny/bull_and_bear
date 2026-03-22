"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/lib/i18n/context";
import { supabaseClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_WINDOW_MS = 60 * 1000;
const ACTIVITY_SYNC_THROTTLE_MS = 5 * 1000;
const HEARTBEAT_MS = 15 * 1000;
const LAST_ACTIVITY_STORAGE_KEY = "bb:last-activity-at";
const LOGOUT_STORAGE_KEY = "bb:idle-logout-at";

function readStoredTimestamp(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function IdleSessionGuard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [remainingMs, setRemainingMs] = useState(IDLE_TIMEOUT_MS);
  const logoutStartedRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const lastBroadcastRef = useRef(0);

  const signOutForInactivity = useCallback(async (broadcastLogout: boolean) => {
    if (logoutStartedRef.current) {
      return;
    }

    logoutStartedRef.current = true;

    if (broadcastLogout) {
      window.localStorage.setItem(LOGOUT_STORAGE_KEY, String(Date.now()));
    }

    window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);

    try {
      await supabaseClient.auth.signOut();
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  }, [router]);

  const syncActivity = useCallback((force: boolean = false) => {
    const now = Date.now();

    if (!force && now - lastBroadcastRef.current < ACTIVITY_SYNC_THROTTLE_MS) {
      return;
    }

    lastActivityRef.current = now;
    lastBroadcastRef.current = now;
    setRemainingMs(IDLE_TIMEOUT_MS);
    window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
  }, []);

  useEffect(() => {
    const storedLastActivity = readStoredTimestamp(LAST_ACTIVITY_STORAGE_KEY);
    const initialLastActivity = storedLastActivity ?? Date.now();

    lastActivityRef.current = initialLastActivity;
    lastBroadcastRef.current = initialLastActivity;
    setRemainingMs(IDLE_TIMEOUT_MS - (Date.now() - initialLastActivity));

    if (!storedLastActivity) {
      window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(initialLastActivity));
    }

    const handleActivity = () => {
      syncActivity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncActivity(true);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_STORAGE_KEY && event.newValue) {
        const nextLastActivity = Number(event.newValue);
        if (Number.isFinite(nextLastActivity)) {
          lastActivityRef.current = nextLastActivity;
          setRemainingMs(IDLE_TIMEOUT_MS - (Date.now() - nextLastActivity));
        }
      }

      if (event.key === LOGOUT_STORAGE_KEY && event.newValue) {
        void signOutForInactivity(false);
      }
    };

    const intervalId = window.setInterval(() => {
      const nextRemainingMs = IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current);

      if (nextRemainingMs <= 0) {
        void signOutForInactivity(true);
        return;
      }

      setRemainingMs(nextRemainingMs);
    }, HEARTBEAT_MS);

    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("focus", handleActivity);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("focus", handleActivity);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [signOutForInactivity, syncActivity]);

  const isWarningVisible = remainingMs > 0 && remainingMs <= WARNING_WINDOW_MS;
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  if (!isWarningVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[70] max-w-sm lg:bottom-6">
      <aside className="pointer-events-auto rounded-2xl border border-amber-400/30 bg-slate-950/92 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-sm font-semibold text-amber-200">{t("session.idleWarning")}</p>
        <p className="mt-2 text-sm text-slate-200">
          {t("session.idlePrompt")} {remainingSeconds}s
        </p>
        <button
          type="button"
          onClick={() => syncActivity(true)}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
        >
          {t("session.stayConnected")}
        </button>
      </aside>
    </div>
  );
}
