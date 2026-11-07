"use client";

import { useEffect } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __bbInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export const INSTALL_AVAILABLE_EVENT = "bb-install-available";

/**
 * Registers the service worker and captures the `beforeinstallprompt` event
 * early (it can fire before the profile page mounts) so any component can
 * trigger the install dialog later.
 */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
        console.error("[pwa] service worker registration failed:", err);
      });
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      window.__bbInstallPrompt = event as BeforeInstallPromptEvent;
      window.dispatchEvent(new Event(INSTALL_AVAILABLE_EVENT));
    };
    const onInstalled = () => {
      window.__bbInstallPrompt = null;
      window.dispatchEvent(new Event(INSTALL_AVAILABLE_EVENT));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
