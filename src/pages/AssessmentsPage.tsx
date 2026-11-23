import { ArrowUpDown, Eye, Plus, Search, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentDetailModal } from '../components/assessments/AssessmentDetailModal';
import { CreateAssessmentModal } from '../components/assessments/CreateAssessmentModal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { Assessment, AssessmentStatus } from '../types';
import { formatDisplayDate } from '../utils/formatters';

type SortField = 'candidateName' | 'competency' | 'submissionDate' | 'status';

const STATUS_FILTERS: ('All' | AssessmentStatus)[] = [
  'All',
  'Submitted',
  'Under Review',
  'Verified',
  'Needs Evidence',
];

export function AssessmentsPage() {
  const { assessments, competencies } = useKaryaProofStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AssessmentStatus>('All');
  const [competencyFilter, setCompetencyFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('submissionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [createOpen, setCreateOpen] = useState(false);
  const [detailAssessment, setDetailAssessment] = useState<Assessment | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assessments
      .filter((a) => {
        if (statusFilter !== 'All' && a.status !== statusFilter) return false;
        if (competencyFilter !== 'All' && a.competency !== competencyFilter) return false;
        if (!q) return true;
        return (
          a.candidateName.toLowerCase().includes(q) ||
          a.candidateEmail.toLowerCase().includes(q) ||
          a.competency.toLowerCase().includes(q) ||
          a.referenceCode.toLowerCase().includes(q) ||
          a.taskTitle.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        const cmp = String(valA).localeCompare(String(valB));
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [assessments, search, statusFilter, competencyFilter, sortField, sortDir]);

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-900">
            Practical Assessments
          </h2>
          <p className="text-xs text-zinc-500">
            Manage practical competency tasks, inspect rubric criteria, and launch evidence reviews.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Create assessment</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F8F8F6] p-1">
          {STATUS_FILTERS.map((st) => {
            const active = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, ref, task..."
              aria-label="Filter assessments"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none sm:w-56"
            />
          </div>

          <select
            value={competencyFilter}
            onChange={(e) => setCompetencyFilter(e.target.value)}
            aria-label="Filter by competency"
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All competencies</option>
            {competencies.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-sm font-semibold text-zinc-900">
              No matching assessments
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Adjust your search or filters, or create a new practical assessment.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setCompetencyFilter('All');
              }}
              className="mt-4 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-[#F8F8F6] text-[11px] font-semibold text-zinc-500">
                  <th className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('candidateName')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900"
                    >
                      <span>Candidate</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('competency')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900"
                    >
                      <span>Competency & Task</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">Rubric</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('submissionDate')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900"
                    >
                      <span>Submitted</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-zinc-900">{item.candidateName}</p>
                      <p className="text-[11px] text-zinc-500">{item.candidateEmail}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-900">{item.competency}</p>
                      <p className="max-w-[260px] truncate text-[11px] text-zinc-500">
                        {item.referenceCode} · {item.taskTitle}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 tabular-nums whitespace-nowrap">
                      {item.rubricCriteria.length} criteria
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 tabular-nums whitespace-nowrap">
                      {formatDisplayDate(item.submissionDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} compact />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailAssessment(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/evidence-review/${item.id}`)}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700"
                        >
                          <Video className="h-3 w-3" />
                          <span>Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateAssessmentModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <AssessmentDetailModal
        assessment={detailAssessment}
        onClose={() => setDetailAssessment(null)}
      />
    </div>
  );
}
