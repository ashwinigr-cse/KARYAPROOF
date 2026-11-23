import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, FileWarning, UserCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Assessment, FinalCompetencyDecision } from '../../types';

interface HumanDecisionPanelProps {
  assessment: Assessment;
  requireAllCriteriaConfirmed: boolean;
  onSubmitDecision: (decision: FinalCompetencyDecision, comments: string) => void;
}

const DECISIONS: {
  value: FinalCompetencyDecision;
  label: string;
  description: string;
  Icon: typeof CheckCircle2;
  activeClass: string;
}[] = [
  {
    value: 'Competent',
    label: 'Competent',
    description: 'Practical evidence satisfies all rubric criteria. Issues competency credential.',
    Icon: CheckCircle2,
    activeClass: 'border-emerald-600 bg-emerald-50/70 text-emerald-950',
  },
  {
    value: 'Needs Further Evidence',
    label: 'Needs Further Evidence',
    description: 'Submission is unclear or missing required camera angle/step.',
    Icon: FileWarning,
    activeClass: 'border-amber-600 bg-amber-50/70 text-amber-950',
  },
  {
    value: 'Not Yet Competent',
    label: 'Not Yet Competent',
    description: 'Observed execution does not yet meet safety or technical standard.',
    Icon: XCircle,
    activeClass: 'border-red-600 bg-red-50/70 text-red-950',
  },
];

export function HumanDecisionPanel({
  assessment,
  requireAllCriteriaConfirmed,
  onSubmitDecision,
}: HumanDecisionPanelProps) {
  const [selectedDecision, setSelectedDecision] = useState<FinalCompetencyDecision | ''>(
    assessment.finalDecision || ''
  );
  const [comments, setComments] = useState(assessment.assessorComments || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedDecision(assessment.finalDecision || '');
    setComments(assessment.assessorComments || '');
    setError('');
  }, [assessment.id, assessment.finalDecision, assessment.assessorComments]);

  const unconfirmedCount = assessment.observations.filter(
    (o) => o.assessorAction === 'Pending'
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDecision) {
      setError('Select an explicit human competency decision before submitting.');
      return;
    }
    if (
      requireAllCriteriaConfirmed &&
      selectedDecision === 'Competent' &&
      unconfirmedCount > 0
    ) {
      setError(
        `Confirm or resolve all ${unconfirmedCount} pending observation(s) before marking Competent.`
      );
      return;
    }
    setError('');
    onSubmitDecision(selectedDecision, comments);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-zinc-800" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold text-zinc-900">
              Final Human Assessor Decision
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            AI never assigns outcomes. Your explicit determination updates the evidence graph and credential status.
          </p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Select final competency decision</legend>
        {DECISIONS.map((option) => {
          const Icon = option.Icon;
          const isSelected = selectedDecision === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                isSelected
                  ? option.activeClass
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/70'
              }`}
            >
              <input
                type="radio"
                name={`final-decision-${assessment.id}`}
                value={option.value}
                checked={isSelected}
                onChange={() => {
                  setSelectedDecision(option.value);
                  setError('');
                }}
                className="mt-0.5 h-4 w-4 accent-indigo-600"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold">{option.label}</span>
                </div>
                <p className="mt-0.5 text-[11px] opacity-80">{option.description}</p>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div>
        <label
          htmlFor={`assessor-comments-${assessment.id}`}
          className="block text-xs font-medium text-zinc-700"
        >
          Assessor comments (optional)
        </label>
        <textarea
          id={`assessor-comments-${assessment.id}`}
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Document rationale, safety notes, or follow-up camera angle requirements..."
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3">
        {assessment.credentialId ? (
          <Link
            to={`/verify/${assessment.credentialId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Award className="h-3.5 w-3.5" />
            <span>View issued credential ({assessment.credentialId})</span>
          </Link>
        ) : (
          <span className="text-[11px] text-zinc-500">
            Persists locally in browser storage
          </span>
        )}

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          {assessment.finalDecision ? 'Update review decision' : 'Submit review'}
        </button>
      </div>
    </form>
  );
}
