import { CheckCircle2, ClipboardCheck, GitBranch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HumanDecisionPanel } from '../components/evidence/HumanDecisionPanel';
import { ObservationsPanel } from '../components/evidence/ObservationsPanel';
import { VideoEvidencePlayer } from '../components/evidence/VideoEvidencePlayer';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { formatDisplayDate } from '../utils/formatters';

export function EvidenceReviewPage() {
  const { assessmentId } = useParams<{ assessmentId?: string }>();
  const navigate = useNavigate();
  const {
    assessments,
    settings,
    sessionVideoUrls,
    attachSessionVideo,
    updateObservationAction,
    submitFinalDecision,
  } = useKaryaProofStore();

  // Default to Rahul Verma (Under Review) if no ID specified, otherwise first assessment
  const activeAssessment =
    assessments.find((a) => a.id === assessmentId) ||
    assessments.find((a) => a.id === 'asm-rahul') ||
    assessments[0];

  const [seekRequest, setSeekRequest] = useState<{ seconds: number; nonce: number } | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);

  useEffect(() => {
    setSeekRequest(null);
    setActiveSeconds(0);
  }, [activeAssessment?.id]);

  if (!activeAssessment) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-zinc-900">No assessments available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Candidate & Assessment Context Bar */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-lg font-bold text-zinc-900">
                {activeAssessment.candidateName}
              </h2>
              <StatusBadge status={activeAssessment.status} />
              <span className="font-mono text-xs text-zinc-500">
                {activeAssessment.referenceCode}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
              <span className="font-medium text-zinc-800">{activeAssessment.competency}</span>
              <span aria-hidden="true">·</span>
              <span>{activeAssessment.taskTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Submitted {formatDisplayDate(activeAssessment.submissionDate)}
              </span>
              <span aria-hidden="true">·</span>
              <span>Reviewer: {activeAssessment.reviewer}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="assessment-switcher" className="sr-only">
              Select assessment to review
            </label>
            <select
              id="assessment-switcher"
              value={activeAssessment.id}
              onChange={(e) => navigate(`/evidence-review/${e.target.value}`)}
              className="h-9 rounded-lg border border-zinc-200 bg-[#F8F8F6] px-3 text-xs font-medium text-zinc-800 focus:border-indigo-500 focus:outline-none"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidateName} — {a.competency} ({a.status})
                </option>
              ))}
            </select>

            <Link
              to={`/evidence-graph?assessment=${activeAssessment.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Evidence graph</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Split Workspace: Video + Rubric (Left) | AI Observations + Human Decision (Right) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 space-y-5">
          <VideoEvidencePlayer
            assessmentId={activeAssessment.id}
            competency={activeAssessment.competency}
            candidateName={activeAssessment.candidateName}
            videoMeta={activeAssessment.videoMeta}
            localVideoUrl={sessionVideoUrls[activeAssessment.id]}
            observations={activeAssessment.observations}
            seekRequest={seekRequest}
            onAttachVideo={(url, meta) => attachSessionVideo(activeAssessment.id, url, meta)}
            onTimeUpdate={setActiveSeconds}
          />

          {/* Assessment Rubric Panel */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-zinc-700" aria-hidden="true" />
                <h3 className="font-display text-sm font-semibold text-zinc-900">
                  Assessment Rubric Criteria
                </h3>
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {activeAssessment.rubricCriteria.length} criteria
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-zinc-600">
              {activeAssessment.taskDescription}
            </p>

            <div className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-[#F8F8F6]">
              {activeAssessment.rubricCriteria.map((criterion, idx) => {
                const linkedObs = activeAssessment.observations.filter(
                  (o) => o.criterionId === criterion.id
                );
                const allConfirmed =
                  linkedObs.length > 0 &&
                  linkedObs.every((o) => o.assessorAction === 'Confirmed');

                return (
                  <div key={criterion.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 font-mono text-[11px] font-semibold text-zinc-400 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-900">{criterion.title}</p>
                        {allConfirmed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmed
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-600">{criterion.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="xl:col-span-5 space-y-5">
          <ObservationsPanel
            observations={activeAssessment.observations}
            activeSeconds={activeSeconds}
            showLowConfidenceWarnings={settings.assessmentPreferences.showLowConfidenceWarnings}
            onSeekTimestamp={(seconds) =>
              setSeekRequest({ seconds, nonce: Date.now() })
            }
            onUpdateAction={(obsId, action, note) =>
              updateObservationAction(activeAssessment.id, obsId, action, note)
            }
          />

          <HumanDecisionPanel
            assessment={activeAssessment}
            requireAllCriteriaConfirmed={
              settings.assessmentPreferences.requireAllCriteriaConfirmed
            }
            onSubmitDecision={(decision, comments) =>
              submitFinalDecision(activeAssessment.id, decision, comments)
            }
          />
        </div>
      </div>
    </div>
  );
}
