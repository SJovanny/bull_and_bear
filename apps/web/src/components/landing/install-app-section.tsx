"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";

import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/landing/scroll-reveal";
import { useTranslation } from "@/lib/i18n/context";

const platforms = [
  { id: "ios", icon: Tablet },
  { id: "android", icon: Smartphone },
  { id: "desktop", icon: Monitor },
] as const;

export function InstallAppSection() {
  const { t } = useTranslation();

  return (
    <section id="install" className="relative z-10 border-t border-slate-200 px-4 py-32 sm:px-6 lg:px-10 lg:py-40">
      <div className="mx-auto max-w-[1400px]">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t("landing.install.title")}
          </h2>
          <p className="mt-8 text-lg text-slate-600">{t("landing.install.subtitle")}</p>
        </ScrollReveal>

        <StaggerContainer className="mt-20 grid gap-8 lg:grid-cols-3" staggerDelay={0.1}>
          {platforms.map(({ id, icon: Icon }) => (
            <StaggerItem key={id}>
              <div className="h-full rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8">
                <Icon className="h-10 w-10 text-blue-600" />
                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                  {t(`landing.install.${id}.title`)}
                </h3>
                <ol className="mt-5 space-y-4">
                  {([1, 2, 3] as const).map((n) => (
                    <li key={n} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {n}
                      </span>
                      <span>{t(`landing.install.${id}.step${n}`)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
            {t("landing.install.notifs")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
