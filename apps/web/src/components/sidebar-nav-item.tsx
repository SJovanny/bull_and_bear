"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarNavItemProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  isCollapsed: boolean;
};

export function SidebarNavItem({ href, label, icon: Icon, isCollapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#1c1c1c]/10 text-white"
          : "text-slate-400 hover:bg-[#1c1c1c]/5 hover:text-slate-200"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
      )}
      
      <Icon className={`h-5 w-5 shrink-0 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
      
      {!isCollapsed && <span>{label}</span>}
      
      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
