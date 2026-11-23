import {
  Award,
  ClipboardList,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useKaryaProofStore } from '../../hooks/useKaryaProofStore';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const PRIMARY_NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/evidence-review', label: 'Evidence Review', icon: Video },
  { to: '/evidence-graph', label: 'Evidence Graph', icon: GitBranch },
  { to: '/credentials', label: 'Credentials', icon: Award },
  { to: '/verification', label: 'Verification', icon: ShieldCheck },
];

const SECONDARY_NAV = [
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { settings } = useKaryaProofStore();

  const initials = settings.profile.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between border-r border-zinc-200 bg-white">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-sm font-bold tracking-tight text-zinc-900">
                KARYAPROOF
              </div>
              <div className="text-[11px] font-medium text-zinc-500">Skills. Proven.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav aria-label="Primary navigation" className="space-y-1 px-3 py-4">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-700'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-zinc-200/80 px-3 py-3">
        <nav aria-label="Support and settings" className="space-y-1 pb-3">
          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-700'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 rounded-lg border border-zinc-200/80 bg-[#F8F8F6] px-2.5 py-2 transition-colors hover:border-zinc-300"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-white">
            {initials || 'AR'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-900">
              {settings.profile.fullName}
            </p>
            <p className="truncate text-[11px] text-zinc-500">{settings.profile.role}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/35 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 max-w-[82vw]">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
