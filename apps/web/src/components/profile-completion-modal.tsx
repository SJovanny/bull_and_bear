"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { COUNTRIES } from "@/lib/countries";

const inputClassName =
  "h-11 w-full rounded-xl border border-border bg-surface-1 px-3 text-sm text-primary outline-none ring-brand-500/50 transition focus:border-brand-500/50 focus:ring-2 placeholder:text-secondary/50";

export function ProfileCompletionModal({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          country,
          language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setSaving(false);
        return;
      }

      onComplete();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-primary font-sans">
          {t("profileCompletion.title")}
        </h2>
        <p className="mt-2 text-sm text-secondary font-sans">
          {t("profileCompletion.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* First name & Last name */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary font-sans">
                {t("auth.signup.firstName")}
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClassName}
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary font-sans">
                {t("auth.signup.lastName")}
              </span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClassName}
                required
              />
            </label>
          </div>

          {/* Country */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-primary font-sans">
              {t("auth.signup.country")}
            </span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`${inputClassName} appearance-none`}
              required
            >
              <option value="" disabled>
                {t("auth.signup.selectCountry")}
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* Language */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-primary font-sans">
              {t("auth.signup.language")}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                  language === "fr"
                    ? "border-brand-500 bg-brand-500/10 text-primary"
                    : "border-border text-secondary hover:border-secondary"
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                  language === "en"
                    ? "border-brand-500 bg-brand-500/10 text-primary"
                    : "border-border text-secondary hover:border-secondary"
                }`}
              >
                English
              </button>
            </div>
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "..." : t("profileCompletion.cta")}
          </button>
        </form>
      </div>
    </div>
  );
}
