import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileUp,
  GitBranch,
  Plus,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreateAssessmentModal } from '../components/assessments/CreateAssessmentModal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { formatDisplayDate } from '../utils/formatters';

export function OverviewPage() {
  const { assessments, credentials, activities } = useKaryaProofStore();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const totalAssessments = assessments.length;
  const pendingReviews = assessments.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review'
  ).length;
  const verifiedCount = assessments.filter((a) => a.status === 'Verified').length;
  const needsEvidenceCount = assessments.filter((a) => a.status === 'Needs Evidence').length;
  const evidenceSubmittedCount = assessments.filter(
    (a) => a.videoMeta.uploadStatus !== 'Awaiting Upload'
  ).length;

  const verifiedPct = totalAssessments ? Math.round((verifiedCount / totalAssessments) * 100) : 0;
  const pendingPct = totalAssessments ? Math.round((pendingReviews / totalAssessments) * 100) : 0;
  const needsPct = totalAssessments ? Math.max(0, 100 - verifiedPct - pendingPct) : 0;

  const kpis = [
    {
      label: 'Active Assessments',
      value: totalAssessments,
      sub: 'Across 5+ practical trades',
      icon: ClipboardList,
    },
    {
      label: 'Pending Reviews',
      value: pendingReviews,
      sub: 'Awaiting human determination',
      icon: Clock,
    },
    {
      label: 'Verified Credentials',
      value: credentials.length,
      sub: 'Publicly verifiable records',
      icon: Award,
    },
    {
      label: 'Evidence Submitted',
      value: evidenceSubmittedCount,
      sub: 'Private local video files',
      icon: Video,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>Assessor Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Demo data active (persisted locally)</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-900">
            Good evening, Ashwini
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Turn practical skills into trusted proof.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/evidence-graph"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 whitespace-nowrap"
          >
            <GitBranch className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <span>Explore evidence graph</span>
          </Link>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Create assessment</span>
          </button>
        </div>
      </section>

      {/* KPI Row */}
      <section aria-label="Workspace metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">{kpi.label}</span>
                <Icon className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-900 tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{kpi.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Main Content Split: Recent Assessments Table + Stats/Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Recent Assessments Table */}
        <section className="xl:col-span-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <h3 className="font-display text-sm font-semibold text-zinc-900">
                Recent assessments
              </h3>
              <p className="text-xs text-zinc-500">
                Sample practical submissions ready for inspection or verified.
              </p>
            </div>
            <Link
              to="/assessments"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-[#F8F8F6] text-[11px] font-semibold text-zinc-500">
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-4 py-3">Assessment</th>
                  <th className="px-4 py-3">Competency</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {assessments.slice(0, 6).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/evidence-review/${item.id}`)}
                    className="cursor-pointer transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-zinc-900">{item.candidateName}</p>
                      <p className="font-mono text-[11px] text-zinc-400">{item.referenceCode}</p>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3.5 text-zinc-700">
                      {item.taskTitle}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-800 whitespace-nowrap">
                      {item.competency}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 tabular-nums whitespace-nowrap">
                      {formatDisplayDate(item.submissionDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} compact />
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 whitespace-nowrap">
                      {item.reviewer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Verification Distribution + Recent Activity */}
        <div className="xl:col-span-4 space-y-6">
          {/* Verification Statistics */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-zinc-900">
                Verification distribution
              </h3>
              <span className="text-[11px] font-medium text-zinc-400">Demo data</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Current state across {totalAssessments} practical assessments.
            </p>

            {/* Clean Segmented Progress Bar */}
            <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                style={{ width: `${verifiedPct}%` }}
                className="bg-emerald-600 transition-all"
                title={`Verified: ${verifiedCount}`}
              />
              <div
                style={{ width: `${pendingPct}%` }}
                className="bg-indigo-600 transition-all"
                title={`Pending Review: ${pendingReviews}`}
              />
              <div
                style={{ width: `${needsPct}%` }}
                className="bg-amber-500 transition-all"
                title={`Evidence Requested: ${needsEvidenceCount}`}
              />
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-700">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" aria-hidden="true" />
                  <span>Verified credentials</span>
                </span>
                <span className="font-mono font-medium text-zinc-900 tabular-nums">
                  {verifiedCount} ({verifiedPct}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-700">
                  <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600" aria-hidden="true" />
                  <span>Pending human review</span>
                </span>
                <span className="font-mono font-medium text-zinc-900 tabular-nums">
                  {pendingReviews} ({pendingPct}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-700">
                  <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" aria-hidden="true" />
                  <span>Additional evidence requested</span>
                </span>
                <span className="font-mono font-medium text-zinc-900 tabular-nums">
                  {needsEvidenceCount} ({needsPct}%)
                </span>
              </div>
            </div>
          </section>

          {/* Recent Activity Timeline */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-zinc-900">
                Recent activity
              </h3>
              <span className="text-[11px] font-medium text-zinc-400">Demo log</span>
            </div>

            <div className="mt-4 space-y-4">
              {activities.slice(0, 4).map((act) => {
                const Icon =
                  act.type === 'credential_issued'
                    ? Award
                    : act.type === 'review_completed'
                      ? CheckCircle2
                      : act.type === 'evidence_submitted'
                        ? FileUp
                        : Clock;

                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-[#F8F8F6] text-zinc-600">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-900">{act.title}</p>
                        <span className="text-[11px] text-zinc-400 tabular-nums whitespace-nowrap">
                          {act.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">
                        {act.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <CreateAssessmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/evidence-review/${id}`)}
      />
    </div>
  );
}
