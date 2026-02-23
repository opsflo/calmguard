'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Network,
  Shield,
  GitBranch,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Architecture', href: '/dashboard/architecture', icon: Network },
  { label: 'Compliance', href: '/dashboard/compliance', icon: Shield },
  { label: 'Pipeline', href: '/dashboard/pipeline', icon: GitBranch },
  { label: 'Findings', href: '/dashboard/findings', icon: AlertTriangle },
];

interface AgentStatus {
  name: string;
  status: 'idle' | 'running' | 'complete' | 'error';
}

const agents: AgentStatus[] = [
  { name: 'Architecture Analyzer', status: 'idle' },
  { name: 'Compliance Mapper', status: 'idle' },
  { name: 'Pipeline Generator', status: 'idle' },
  { name: 'Risk Scorer', status: 'idle' },
];

const statusColors = {
  idle: 'bg-slate-600',
  running: 'bg-blue-500 animate-pulse',
  complete: 'bg-emerald-500',
  error: 'bg-red-500',
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-slate-800">
        <Shield className="h-6 w-6 text-emerald-500 mr-2" />
        <h1 className="text-lg font-bold text-slate-50">CALMGuard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-slate-800" />

        {/* Agent Status */}
        <div className="pt-2">
          <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Agent Status
          </h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-2 px-3 py-1.5 text-sm"
              >
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    statusColors[agent.status]
                  )}
                />
                <span className="text-slate-400 text-xs">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-600 text-center">
          DTCC/FINOS Hackathon 2026
        </p>
      </div>
    </aside>
  );
}
