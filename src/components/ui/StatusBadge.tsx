import { AlertTriangle, CheckCircle2, Clock, FileUp } from 'lucide-react';
import { AssessmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AssessmentStatus;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  AssessmentStatus,
  {
    bg: string;
    border: string;
    text: string;
    Icon: typeof CheckCircle2;
  }
> = {
  Verified: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    Icon: CheckCircle2,
  },
  'Under Review': {
    bg: 'bg-indigo-50/90',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    Icon: Clock,
  },
  Submitted: {
    bg: 'bg-zinc-100',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    Icon: FileUp,
  },
  'Needs Evidence': {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200',
    text: 'text-amber-800',
    Icon: AlertTriangle,
  },
};

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text} ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
