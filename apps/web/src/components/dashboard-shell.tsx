"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { HeaderBar } from "./header-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ title, subtitle, actions, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <div className="flex min-h-screen w-full">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <HeaderBar 
            title={title} 
            subtitle={subtitle} 
            actions={actions} 
          />

          <main className="flex-1 p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
}
