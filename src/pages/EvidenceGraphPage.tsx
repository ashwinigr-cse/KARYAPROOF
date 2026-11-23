import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EvidenceGraphView } from '../components/graph/EvidenceGraphView';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';

export function EvidenceGraphPage() {
  const { assessments, credentials } = useKaryaProofStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('assessment') || 'asm-ananya';

  const activeAssessment = useMemo(() => {
    return (
      assessments.find((a) => a.id === selectedId) ||
      assessments.find((a) => a.id === 'asm-ananya') ||
      assessments[0]
    );
  }, [assessments, selectedId]);

  const linkedCredential = useMemo(() => {
    if (!activeAssessment) return undefined;
    return credentials.find(
      (c) => c.assessmentId === activeAssessment.id || c.id === activeAssessment.credentialId
    );
  }, [credentials, activeAssessment]);

  if (!activeAssessment) return null;

  return (
    <div className="space-y-5">
      {/* Header & Candidate Switcher */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-900">
            Evidence Traceability Graph
          </h2>
          <p className="mt-0.5 text-xs text-zinc-600">
            Follow what is claimed, what video evidence supports it, what demo AI observed, what a human confirmed, and what credential was issued.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={activeAssessment.status} />
          <label htmlFor="graph-candidate-select" className="sr-only">
            Select candidate evidence graph
          </label>
          <select
            id="graph-candidate-select"
            value={activeAssessment.id}
            onChange={(e) => setSearchParams({ assessment: e.target.value })}
            className="h-9 rounded-lg border border-zinc-200 bg-[#F8F8F6] px-3 text-xs font-medium text-zinc-800 focus:border-indigo-500 focus:outline-none"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.candidateName} — {a.competency} ({a.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <EvidenceGraphView assessment={activeAssessment} credential={linkedCredential} />
    </div>
  );
}
