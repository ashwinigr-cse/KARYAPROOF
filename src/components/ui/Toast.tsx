import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useKaryaProofStore } from '../../hooks/useKaryaProofStore';

export function ToastContainer() {
  const { toasts, dismissToast } = useKaryaProofStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.variant === 'success'
            ? CheckCircle2
            : toast.variant === 'warning'
              ? AlertTriangle
              : Info;
        const iconColor =
          toast.variant === 'success'
            ? 'text-emerald-600'
            : toast.variant === 'warning'
              ? 'text-amber-600'
              : 'text-indigo-600';

        return (
          <div
            key={toast.id}
            role="status"
            className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3.5 shadow-lg transition-all"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-zinc-600">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
