"use client";

import Image from "next/image";
import { useState } from "react";
import { SidebarNavItem } from "./sidebar-nav-item";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "@/app/auth/logout-button";
import { useTranslation } from "@/lib/i18n/context";
import {
  IconDashboard,
  IconJournal,
  IconCalendar,
  IconStats,
  IconAccounts,
  IconProfile,
} from "./icons";

export function Sidebar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarLogoSrc = "/BB_logo.png";
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: IconDashboard },
    { href: "/journal", label: t("nav.journal"), icon: IconJournal },
    { href: "/calendar", label: t("nav.calendar"), icon: IconCalendar },
    { href: "/stats", label: t("nav.stats"), icon: IconStats },
    { href: "/profil", label: t("nav.profile"), icon: IconProfile },
    { href: "/comptes", label: t("nav.accounts"), icon: IconAccounts },
  ];

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200 ease-standard lg:flex ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
      >
      <div className="flex flex-col border-b border-slate-800 p-4 min-h-[73px] justify-center relative">
        <div className={`flex flex-col ${isSidebarCollapsed ? "hidden" : "block"}`}>
          <div className="flex justify-center">
            <div className="flex h-24 w-full max-w-[220px] items-center justify-center">
              <Image
                src={sidebarLogoSrc}
                alt="Bull & Bear logo"
                width={200}
                height={88}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
        
        {isSidebarCollapsed && (
           <div className="mx-auto flex h-14 w-14 items-center justify-center">
             <Image
               src={sidebarLogoSrc}
               alt="Bull & Bear logo"
               width={52}
               height={52}
               className="h-full w-full object-contain"
               priority
             />
           </div>
        )}
        
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((v) => !v)}
          className={`absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-transform ${
            isSidebarCollapsed ? "rotate-180" : ""
          }`}
          aria-label="Toggle sidebar"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isCollapsed={isSidebarCollapsed}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-slate-800 p-3">
        <LanguageSwitcher isCollapsed={isSidebarCollapsed} />
        <ThemeToggle isCollapsed={isSidebarCollapsed} />
        <div className={`${isSidebarCollapsed ? "mx-auto" : "w-full"}`}>
          <LogoutButton isSidebarContext isCollapsed={isSidebarCollapsed} />
        </div>
      </div>
    </aside>
  );
}

