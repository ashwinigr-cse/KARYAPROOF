import { Award, GitBranch, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Assessment } from '../../types';
import { formatDisplayDate } from '../../utils/formatters';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/StatusBadge';

interface AssessmentDetailModalProps {
  assessment: Assessment | null;
  onClose: () => void;
}

export function AssessmentDetailModal({ assessment, onClose }: AssessmentDetailModalProps) {
  const navigate = useNavigate();

  if (!assessment) return null;

  return (
    <Modal
      open={Boolean(assessment)}
      onClose={onClose}
      title={assessment.candidateName}
      subtitle={`${assessment.referenceCode} · ${assessment.competency}`}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
            <span>{assessment.candidateEmail}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Submitted {formatDisplayDate(assessment.submissionDate)}</span>
            <span aria-hidden="true">·</span>
            <span>Reviewer: {assessment.reviewer}</span>
          </div>
          <StatusBadge status={assessment.status} />
        </div>

        <div>
          <h3 className="text-xs font-semibold text-zinc-900">Practical Task Brief</h3>
          <p className="mt-1 text-sm font-medium text-zinc-800">{assessment.taskTitle}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
            {assessment.taskDescription}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-zinc-900">
            Assessment Rubric ({assessment.rubricCriteria.length} Criteria)
          </h3>
          <div className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {assessment.rubricCriteria.map((crit, idx) => (
              <div key={crit.id} className="flex items-start gap-3 px-3.5 py-2.5">
                <span className="mt-0.5 font-mono text-[11px] font-medium text-zinc-400 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-900">{crit.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{crit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-[#F8F8F6] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-zinc-800">Submitted Evidence Reference</span>
            <span className="font-mono text-zinc-500">{assessment.videoMeta.filename}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Privacy by design: raw video streams remain private to authorized assessors and are never exposed publicly.
          </p>
        </div>

        {assessment.finalDecision && (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold text-zinc-900">
              Human Assessor Decision: {assessment.finalDecision}
            </p>
            {assessment.assessorComments && (
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                {assessment.assessorComments}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/evidence-graph?assessment=${assessment.id}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Evidence graph</span>
          </button>

          {assessment.credentialId && (
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/verify/${assessment.credentialId}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Verify credential</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/evidence-review/${assessment.id}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Open in Evidence Review</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
