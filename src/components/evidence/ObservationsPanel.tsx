import {
  AlertCircle,
  Check,
  HelpCircle,
  MessageSquarePlus,
  Play,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  AiObservation,
  AssessorObservationAction,
  ConfidenceLevel,
  EvidenceFlag,
} from '../../types';

interface ObservationsPanelProps {
  observations: AiObservation[];
  activeSeconds: number;
  showLowConfidenceWarnings: boolean;
  onSeekTimestamp: (seconds: number) => void;
  onUpdateAction: (
    observationId: string,
    action: AssessorObservationAction,
    note?: string
  ) => void;
}

const CONFIDENCE_STYLE: Record<ConfidenceLevel, string> = {
  High: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Medium: 'border-zinc-200 bg-zinc-100 text-zinc-700',
  Low: 'border-amber-200 bg-amber-50 text-amber-800',
};

const FLAG_STYLE: Record<EvidenceFlag, string> = {
  Clear: 'text-emerald-700',
  Unclear: 'text-amber-700',
  'Missing evidence': 'text-red-700',
  'Needs additional angle': 'text-amber-700',
  'Unable to determine': 'text-zinc-600',
};

const ACTION_BADGE: Record<AssessorObservationAction, string> = {
  Pending: 'border-zinc-200 bg-zinc-50 text-zinc-600',
  Confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Unclear: 'border-amber-200 bg-amber-50 text-amber-800',
  Rejected: 'border-red-200 bg-red-50 text-red-800',
  'Requested Evidence': 'border-indigo-200 bg-indigo-50 text-indigo-800',
};

export function ObservationsPanel({
  observations,
  activeSeconds,
  showLowConfidenceWarnings,
  onSeekTimestamp,
  onUpdateAction,
}: ObservationsPanelProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');

  const confirmedCount = observations.filter((o) => o.assessorAction === 'Confirmed').length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      {/* Assistive AI Disclaimer Header */}
      <div className="border-b border-zinc-200 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-semibold text-zinc-900">
              Timestamped Observations
            </h2>
            <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700">
              DEMO AI
            </span>
          </div>
          <span className="text-xs text-zinc-500 tabular-nums">
            {confirmedCount} of {observations.length} confirmed by human
          </span>
        </div>

        <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-zinc-200 bg-[#F8F8F6] px-3 py-2 text-xs text-zinc-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
          <p>
            <strong className="font-semibold text-zinc-900">
              AI observations are assistive only.
            </strong>{' '}
            The assessor is responsible for the final competency decision. Sample observations below represent demo AI output until live video analysis is connected.
          </p>
        </div>
      </div>

      {/* Observations List */}
      <div className="divide-y divide-zinc-200">
        {observations.map((obs) => {
          const isCurrent = Math.abs(activeSeconds - obs.timestampSeconds) <= 3;
          const isEditingNote = editingNoteId === obs.id;

          return (
            <div
              key={obs.id}
              className={`p-4 transition-colors ${isCurrent ? 'bg-indigo-50/35' : 'bg-white'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSeekTimestamp(obs.timestampSeconds)}
                    title={`Seek video to ${obs.timestampLabel}`}
                    className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 font-mono text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 tabular-nums"
                  >
                    <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                    <span>{obs.timestampLabel}</span>
                  </button>
                  <span className="text-xs font-semibold text-zinc-900">
                    {obs.criterionTitle}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                      CONFIDENCE_STYLE[obs.confidence]
                    }`}
                  >
                    {obs.confidence} confidence
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                      ACTION_BADGE[obs.assessorAction]
                    }`}
                  >
                    {obs.assessorAction}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-xs leading-relaxed text-zinc-700">{obs.description}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-zinc-500">Evidence status:</span>
                <span className={`font-medium ${FLAG_STYLE[obs.evidenceFlag]}`}>
                  {obs.evidenceFlag}
                </span>
                {showLowConfidenceWarnings && obs.confidence === 'Low' && (
                  <>
                    <span aria-hidden="true" className="text-zinc-300">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      Requires explicit human verification
                    </span>
                  </>
                )}
              </div>

              {obs.assessorNote && !isEditingNote && (
                <div className="mt-2.5 rounded-md border border-zinc-200 bg-[#F8F8F6] px-3 py-2 text-xs text-zinc-700">
                  <span className="font-medium text-zinc-900">Assessor note: </span>
                  {obs.assessorNote}
                </div>
              )}

              {isEditingNote && (
                <div className="mt-2.5 space-y-2">
                  <textarea
                    rows={2}
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Add human assessor verification note..."
                    className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateAction(obs.id, obs.assessorAction, draftNote.trim());
                        setEditingNoteId(null);
                      }}
                      className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-800"
                    >
                      Save note
                    </button>
                  </div>
                </div>
              )}

              {/* Human Assessor Controls */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3">
                <button
                  type="button"
                  onClick={() => onUpdateAction(obs.id, 'Confirmed')}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    obs.assessorAction === 'Confirmed'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Check className="h-3 w-3" />
                  <span>Confirm finding</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateAction(obs.id, 'Unclear')}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    obs.assessorAction === 'Unclear'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                >
                  <HelpCircle className="h-3 w-3" />
                  <span>Mark unclear</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateAction(obs.id, 'Rejected')}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    obs.assessorAction === 'Rejected'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-red-50 hover:text-red-800'
                  }`}
                >
                  <X className="h-3 w-3" />
                  <span>Reject AI observation</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateAction(obs.id, 'Requested Evidence')}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    obs.assessorAction === 'Requested Evidence'
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-indigo-50 hover:text-indigo-800'
                  }`}
                >
                  <MessageSquarePlus className="h-3 w-3" />
                  <span>Request evidence</span>
                </button>

                {!isEditingNote && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNoteId(obs.id);
                      setDraftNote(obs.assessorNote || '');
                    }}
                    className="ml-auto text-[11px] font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    {obs.assessorNote ? 'Edit note' : '+ Add note'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
