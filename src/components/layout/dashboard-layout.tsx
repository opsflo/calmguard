'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content — flex row to accommodate right-column feed panel */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          {/* Right column for agent feed — rendered by dashboard pages (Plan 03-05) */}
        </main>
      </div>
    </div>
  );
}
