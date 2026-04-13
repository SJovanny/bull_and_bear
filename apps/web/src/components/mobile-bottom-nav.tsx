"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  IconDashboard, 
  IconJournal, 
  IconCalendar, 
  IconStats, 
  IconAccounts,
  IconProfile,
} from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { LogoutButton } from "@/app/auth/logout-button";
import { useTranslation } from "@/lib/i18n/context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: IconDashboard },
    { href: "/journal", label: t("nav.journal"), icon: IconJournal },
    { href: "/calendar", label: t("nav.calendar"), icon: IconCalendar },
    { href: "/stats", label: t("nav.stats"), icon: IconStats },
  ];

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowMore(false)}>
          <div 
            className="absolute bottom-20 left-4 right-4 overflow-hidden rounded-xl border border-[#2e2e2e] bg-surface-1 shadow-lg animate-in slide-in-from-bottom-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-2">
              <Link
                href="/profil"
                onClick={() => setShowMore(false)}
                className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-primary hover:bg-surface-2"
              >
                <IconProfile className="mr-3 h-5 w-5 text-secondary" />
                {t("nav.profile")}
              </Link>
              <Link
                href="/comptes"
                onClick={() => setShowMore(false)}
                className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-primary hover:bg-surface-2"
              >
                <IconAccounts className="mr-3 h-5 w-5 text-secondary" />
                {t("nav.accounts")}
              </Link>
            </div>
            
            <div className="border-t border-[#2e2e2e]"></div>
            
            <div className="p-2">
               <LanguageSwitcher />
               <ThemeToggle />
               <div className="mt-2 text-center">
                 <LogoutButton />
               </div>
            </div>

          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[#2e2e2e] bg-surface-1/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                isActive ? "text-brand-500" : "text-secondary hover:text-primary"
              }`}
            >
              <item.icon className={`mb-1 h-6 w-6 ${isActive ? "text-brand-500" : "text-secondary"}`} />
              {item.label}
            </Link>
          );
        })}
        
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
            showMore ? "text-brand-500" : "text-secondary hover:text-primary"
          }`}
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-1 h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          {t("nav.more")}
        </button>
      </nav>
    </>
  );
}

