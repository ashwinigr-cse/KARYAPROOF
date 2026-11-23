import { Bell, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKaryaProofStore } from '../../hooks/useKaryaProofStore';

export function NotificationsPopover() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useKaryaProofStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-indigo-600 px-1 text-[10px] font-semibold text-white tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="absolute right-0 z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-zinc-900">Notifications</h3>
              <span className="text-xs text-zinc-500 tabular-nums">
                {unreadCount} unread
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-zinc-100 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 px-4 py-3 transition-colors ${
                  item.read ? 'bg-white' : 'bg-indigo-50/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    markNotificationRead(item.id);
                    setOpen(false);
                    navigate(item.targetRoute);
                  }}
                  className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900">{item.title}</span>
                    {!item.read && (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">{item.message}</p>
                  <p className="mt-1 text-[11px] text-zinc-400 tabular-nums">{item.timestamp}</p>
                </button>

                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(item.id)}
                    title="Mark as read"
                    aria-label={`Mark ${item.title} as read`}
                    className="mt-0.5 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
