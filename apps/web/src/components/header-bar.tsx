"use client";

import { ReactNode } from "react";
import { AccountSwitcher } from "./account-switcher";

type HeaderBarProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function HeaderBar({ title, subtitle, actions }: HeaderBarProps) {
  const shellTitle = subtitle ? `${title} · ${subtitle}` : title;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface-1">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-primary sm:text-2xl">
            {shellTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          <div>
            <AccountSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}