import { ChevronDown, ChevronRight, LogOut, Menu, Search, Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useKaryaProofStore } from '../../hooks/useKaryaProofStore';
import { NotificationsPopover } from './NotificationsPopover';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

const ROUTE_META: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Overview', breadcrumb: ['Workspace', 'Overview'] },
  '/assessments': { title: 'Assessments', breadcrumb: ['Workspace', 'Assessments'] },
  '/evidence-review': { title: 'Evidence Review', breadcrumb: ['Workspace', 'Evidence Review'] },
  '/evidence-graph': { title: 'Evidence Graph', breadcrumb: ['Workspace', 'Evidence Graph'] },
  '/credentials': { title: 'Credentials', breadcrumb: ['Workspace', 'Credentials'] },
  '/verification': { title: 'Verification', breadcrumb: ['Workspace', 'Verification'] },
  '/settings': { title: 'Settings', breadcrumb: ['Workspace', 'Settings'] },
  '/help': { title: 'Help & Support', breadcrumb: ['Workspace', 'Help & Support'] },
};

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessments, credentials, settings } = useKaryaProofStore();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const meta = useMemo(() => {
    if (location.pathname.startsWith('/evidence-review/')) {
      const id = location.pathname.replace('/evidence-review/', '');
      const asm = assessments.find((a) => a.id === id);
      return {
        title: 'Evidence Review',
        breadcrumb: ['Workspace', 'Evidence Review', asm ? asm.candidateName : 'Session'],
      };
    }
    return ROUTE_META[location.pathname] || { title: 'KARYAPROOF', breadcrumb: ['Workspace'] };
  }, [location.pathname, assessments]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matchedAssessments = assessments
      .filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.competency.toLowerCase().includes(q) ||
          a.referenceCode.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        label: a.candidateName,
        sub: `${a.competency} · ${a.referenceCode}`,
        route: `/evidence-review/${a.id}`,
      }));

    const matchedCreds = credentials
      .filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.candidateName.toLowerCase().includes(q) ||
          c.competency.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        label: `Credential ${c.id}`,
        sub: `${c.candidateName} · ${c.competency}`,
        route: `/verify/${c.id}`,
      }));

    return [...matchedAssessments, ...matchedCreds];
  }, [query, assessments, credentials]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const initials = settings.profile.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      {/* Left: Mobile Trigger + Breadcrumbs & Page Title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="hidden items-center gap-1 text-[11px] font-medium text-zinc-500 sm:flex">
            {meta.breadcrumb.map((crumb, idx) => (
              <span key={`${crumb}-${idx}`} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-400" aria-hidden="true" />}
                <span className={idx === meta.breadcrumb.length - 1 ? 'text-zinc-700' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
          <h1 className="truncate font-display text-base font-semibold text-zinc-900 sm:text-lg">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates, competencies, IDs..."
              aria-label="Global search"
              className="h-9 w-64 rounded-lg border border-zinc-200 bg-[#F8F8F6] pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none lg:w-72"
            />
          </div>

          {searchFocused && query.trim().length > 0 && (
            <div className="absolute right-0 z-50 mt-1.5 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
              <div className="border-b border-zinc-100 px-3 py-2 text-[11px] font-medium text-zinc-500">
                Quick results
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-4 text-xs text-zinc-500">
                  No matching assessments or credentials found.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setSearchFocused(false);
                        navigate(res.route);
                      }}
                      className="flex w-full flex-col px-3 py-2.5 text-left hover:bg-zinc-50"
                    >
                      <span className="text-xs font-medium text-zinc-900">{res.label}</span>
                      <span className="text-[11px] text-zinc-500">{res.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <NotificationsPopover />

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-label="User profile menu"
            className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-semibold text-white">
              {initials || 'AR'}
            </span>
            <span className="hidden text-xs font-medium text-zinc-800 sm:inline">
              {settings.profile.fullName.split(' ')[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
              <div className="border-b border-zinc-100 px-3.5 py-3">
                <p className="text-xs font-semibold text-zinc-900">{settings.profile.fullName}</p>
                <p className="text-[11px] text-zinc-500">{settings.profile.email}</p>
                <p className="mt-1 text-[11px] font-medium text-indigo-600">
                  {settings.profile.role}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Workspace settings</span>
                </Link>
                <Link
                  to="/verify/KP-2026-0001"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Preview public verifier</span>
                </Link>
                <Link
                  to="/help"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  <LogOut className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Demo workspace guide</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
