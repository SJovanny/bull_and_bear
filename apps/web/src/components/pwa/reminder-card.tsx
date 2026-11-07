"use client";

import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "@/lib/i18n/context";
import { INSTALL_AVAILABLE_EVENT } from "./pwa-register";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function patchReminder(body: { journalReminderEnabled: boolean }) {
  const res = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("patch failed");
}

export function ReminderCard() {
  const { t } = useTranslation();
  const [deviceSubscribed, setDeviceSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pushSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Environment detection + current subscription state.
  useEffect(() => {
    // Deferred like the rest of the app: avoids sync setState in the effect body.
    const timer = setTimeout(() => {
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone === true,
      );
      setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
      setCanInstall(Boolean(window.__bbInstallPrompt));
      setPermission(pushSupported ? Notification.permission : "unsupported");
    }, 0);

    const onAvailable = () => {
      setCanInstall(Boolean(window.__bbInstallPrompt));
      if (!window.__bbInstallPrompt) setIsStandalone(true);
    };
    window.addEventListener(INSTALL_AVAILABLE_EVENT, onAvailable);

    if (pushSupported) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setDeviceSubscribed(Boolean(sub)))
        .catch(() => {});
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener(INSTALL_AVAILABLE_EVENT, onAvailable);
    };
  }, [pushSupported]);

  const install = useCallback(async () => {
    const promptEvent = window.__bbInstallPrompt;
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      window.__bbInstallPrompt = null;
      setCanInstall(false);
      setIsStandalone(true);
    }
  }, []);

  async function enableOnDevice() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (!VAPID_PUBLIC_KEY) {
        setError(t("pwa.reminderUnconfigured"));
        return;
      }
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error(String(res.status));

      await patchReminder({ journalReminderEnabled: true });
      setDeviceSubscribed(true);
    } catch {
      setError(t("pwa.reminderError"));
    } finally {
      setBusy(false);
    }
  }

  async function disableOnDevice() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setDeviceSubscribed(false);
    } catch {
      setError(t("pwa.reminderError"));
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      setMessage(t("pwa.reminderTestSent"));
    } catch {
      setError(t("pwa.reminderError"));
    } finally {
      setBusy(false);
    }
  }

  const buttonBase =
    "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:opacity-50";

  return (
    <article className="rounded-2xl border border-border bg-surface-1 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary font-sans">{t("pwa.title")}</p>

      {/* Install */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-secondary font-sans">
          {isStandalone ? t("pwa.installed") : t("pwa.installDesc")}
        </p>
        {!isStandalone && canInstall ? (
          <button
            type="button"
            onClick={() => void install()}
            className={`${buttonBase} bg-brand-500 text-white hover:bg-brand-600`}
          >
            {t("pwa.installBtn")}
          </button>
        ) : null}
      </div>
      {!isStandalone && !canInstall ? (
        <p className="mt-2 text-xs text-secondary font-sans">
          {isIos ? t("pwa.iosHint") : t("pwa.installUnavailable")}
        </p>
      ) : null}

      <hr className="my-5 border-border" />

      {/* Daily reminder */}
      <p className="text-sm font-semibold text-primary font-sans">{t("pwa.reminderTitle")}</p>
      <p className="mt-1 text-sm text-secondary font-sans">{t("pwa.reminderDesc")}</p>

      {permission === "unsupported" ? (
        <p className="mt-3 text-sm text-secondary font-sans">
          {isIos && !isStandalone ? t("pwa.iosHint") : t("pwa.reminderUnsupported")}
        </p>
      ) : permission === "denied" ? (
        <p className="mt-3 text-sm text-pnl-negative font-sans">{t("pwa.reminderDenied")}</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {deviceSubscribed ? (
              <>
                <span className="text-sm font-semibold text-pnl-positive font-sans">{t("pwa.reminderActive")}</span>
                <button
                  type="button"
                  onClick={() => void sendTest()}
                  disabled={busy}
                  className={`${buttonBase} border border-border bg-surface-2 text-primary hover:bg-white`}
                >
                  {t("pwa.reminderTest")}
                </button>
                <button
                  type="button"
                  onClick={() => void disableOnDevice()}
                  disabled={busy}
                  className={`${buttonBase} border border-border bg-surface-1 text-primary hover:bg-surface-2`}
                >
                  {t("pwa.reminderDisable")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void enableOnDevice()}
                disabled={busy}
                className={`${buttonBase} bg-brand-500 text-white hover:bg-brand-600`}
              >
                {t("pwa.reminderEnable")}
              </button>
            )}
          </div>
        </div>
      )}

      {message ? <p className="mt-3 text-sm text-pnl-positive font-sans">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-pnl-negative font-sans">{error}</p> : null}
    </article>
  );
}
