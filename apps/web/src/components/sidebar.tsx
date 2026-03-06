"use client";

import { useState } from "react";
import { SidebarNavItem } from "./sidebar-nav-item";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "@/app/auth/logout-button";
import {
  IconDashboard,
  IconJournal,
  IconCalendar,
  IconStats,
  IconAccounts,
} from "./icons";

const navItems = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/journal", label: "Journal", icon: IconJournal },
  { href: "/calendar", label: "Calendrier", icon: IconCalendar },
  { href: "/stats", label: "Stats", icon: IconStats },
  { href: "/onboarding", label: "Comptes", icon: IconAccounts },
];

export function Sidebar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200 ease-standard lg:flex ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col border-b border-slate-800 p-4 min-h-[73px] justify-center relative">
        <div className={`flex flex-col ${isSidebarCollapsed ? "hidden" : "block"}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
              <span className="font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Bull & Bear</span>
          </div>
          <span className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-brand-500 ml-10">
            TRADING JOURNAL
          </span>
        </div>
        
        {isSidebarCollapsed && (
           <div className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
             <span className="font-bold text-lg">B</span>
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
        <ThemeToggle isCollapsed={isSidebarCollapsed} />
        <div className={`${isSidebarCollapsed ? "mx-auto" : "w-full"}`}>
          <LogoutButton isSidebarContext isCollapsed={isSidebarCollapsed} />
        </div>
      </div>
    </aside>
  );
}