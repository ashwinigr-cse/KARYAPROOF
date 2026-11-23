import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FileVideo,
  Globe,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Assessment, CredentialRecord, EvidenceGraphNode, GraphNodeCategory } from '../../types';
import { formatDisplayDate, formatSecondsToTimestamp } from '../../utils/formatters';

interface EvidenceGraphViewProps {
  assessment: Assessment;
  credential?: CredentialRecord;
}

interface PositionedNode extends EvidenceGraphNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GraphEdgeDef {
  id: string;
  from: string;
  to: string;
  label: string;
  active: boolean;
  dashed?: boolean;
}

const NODE_STYLES: Record<
  GraphNodeCategory,
  {
    badgeLabel: string;
    border: string;
    bg: string;
    headerBg: string;
    accentText: string;
    dotColor: string;
  }
> = {
  claim: {
    badgeLabel: 'Claim & Standard',
    border: 'border-zinc-300',
    bg: 'bg-white',
    headerBg: 'bg-zinc-100/80',
    accentText: 'text-zinc-700',
    dotColor: '#52525B',
  },
  evidence: {
    badgeLabel: 'Private Evidence',
    border: 'border-amber-300',
    bg: 'bg-amber-50/40',
    headerBg: 'bg-amber-100/60',
    accentText: 'text-amber-800',
    dotColor: '#D97706',
  },
  ai: {
    badgeLabel: 'Assistive AI (Demo)',
    border: 'border-indigo-300 border-dashed',
    bg: 'bg-indigo-50/45',
    headerBg: 'bg-indigo-100/60',
    accentText: 'text-indigo-700',
    dotColor: '#4F46E5',
  },
  human: {
    badgeLabel: 'Human Authority',
    border: 'border-emerald-400',
    bg: 'bg-emerald-50/45',
    headerBg: 'bg-emerald-100/70',
    accentText: 'text-emerald-800',
    dotColor: '#059669',
  },
  credential: {
    badgeLabel: 'Verifiable Proof',
    border: 'border-violet-300',
    bg: 'bg-violet-50/40',
    headerBg: 'bg-violet-100/65',
    accentText: 'text-violet-800',
    dotColor: '#7C3AED',
  },
};

const NODE_ICONS: Record<string, typeof ShieldCheck> = {
  competency: ShieldCheck,
  task: FileText,
  rubric: ClipboardCheck,
  video: FileVideo,
  ai: Sparkles,
  human: UserCheck,
  credential: Award,
  verification: Globe,
};

export function EvidenceGraphView({ assessment, credential }: EvidenceGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('human');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const confirmedObs = assessment.observations.filter(
    (o) => o.assessorAction === 'Confirmed'
  ).length;
  const flaggedObs = assessment.observations.filter(
    (o) => o.evidenceFlag !== 'Clear'
  ).length;
  const hasHumanReview = Boolean(assessment.finalDecision);
  const hasCredential = Boolean(credential && assessment.status === 'Verified');

  const nodes: PositionedNode[] = useMemo(() => {
    const w = 216;
    const h = 112;
    const row1Y = 26;
    const row2Y = 248;

    return [
      {
        id: 'competency',
        stage: 1,
        title: 'Competency Claim',
        subtitle: assessment.competency,
        category: 'claim',
        statusText: `${assessment.candidateName}`,
        x: 20,
        y: row1Y,
        w,
        h,
        details: {
          summary: `${assessment.candidateName} claims practical proficiency in ${assessment.competency}.`,
          metadata: [
            { label: 'Candidate', value: assessment.candidateName },
            { label: 'Assessment Ref', value: assessment.referenceCode },
            { label: 'Competency', value: assessment.competency },
          ],
        },
      },
      {
        id: 'task',
        stage: 2,
        title: 'Assessment Task',
        subtitle: assessment.taskTitle,
        category: 'claim',
        statusText: `Submitted ${formatDisplayDate(assessment.submissionDate)}`,
        x: 274,
        y: row1Y,
        w,
        h,
        details: {
          summary: assessment.taskDescription,
          metadata: [
            { label: 'Task Title', value: assessment.taskTitle },
            { label: 'Submission Date', value: formatDisplayDate(assessment.submissionDate) },
            { label: 'Assigned Reviewer', value: assessment.reviewer },
          ],
        },
      },
      {
        id: 'rubric',
        stage: 3,
        title: 'Rubric Criteria',
        subtitle: `${assessment.rubricCriteria.length} observable criteria`,
        category: 'claim',
        statusText: `${assessment.rubricCriteria.filter((c) => c.required).length} required checks`,
        x: 528,
        y: row1Y,
        w,
        h,
        details: {
          summary:
            'Predefined practical standards against which both assistive AI observations and human judgments are mapped.',
          metadata: assessment.rubricCriteria.map((c, idx) => ({
            label: `Criterion ${idx + 1}`,
            value: c.title,
          })),
        },
      },
      {
        id: 'video',
        stage: 4,
        title: 'Submitted Video',
        subtitle: assessment.videoMeta.filename,
        category: 'evidence',
        statusText:
          assessment.videoMeta.durationSeconds !== null
            ? `${formatSecondsToTimestamp(assessment.videoMeta.durationSeconds)} · Private`
            : `${assessment.videoMeta.uploadStatus}`,
        x: 782,
        y: row1Y,
        w,
        h,
        details: {
          summary:
            'Primary practical demonstration recording submitted by the candidate. Stored privately and never exposed on public verification links.',
          metadata: [
            { label: 'Filename', value: assessment.videoMeta.filename },
            {
              label: 'Duration',
              value:
                assessment.videoMeta.durationSeconds !== null
                  ? formatSecondsToTimestamp(assessment.videoMeta.durationSeconds)
                  : 'Pending local inspection',
            },
            { label: 'Storage Policy', value: 'Private / Non-public' },
          ],
          privacyNote: 'Raw video is strictly restricted to authorized assessors.',
        },
      },
      {
        id: 'ai',
        stage: 5,
        title: 'AI Observations',
        subtitle: `${assessment.observations.length} timestamped markers`,
        category: 'ai',
        statusText:
          flaggedObs > 0 ? `${flaggedObs} flagged unclear (Demo)` : 'Demo assistive notes',
        x: 20,
        y: row2Y,
        w,
        h,
        details: {
          summary:
            'Assistive-only demo observations indexed to video timestamps and rubric criteria. AI highlights potential moments and uncertainty flags for human inspection.',
          metadata: assessment.observations.map((o) => ({
            label: `${o.timestampLabel} (${o.confidence})`,
            value: `${o.criterionTitle} — ${o.evidenceFlag}`,
          })),
        },
      },
      {
        id: 'human',
        stage: 6,
        title: 'Human Assessor Findings',
        subtitle: assessment.finalDecision
          ? `Decision: ${assessment.finalDecision}`
          : 'Awaiting human determination',
        category: 'human',
        statusText: `${confirmedObs}/${assessment.observations.length} findings confirmed`,
        x: 274,
        y: row2Y,
        w,
        h,
        details: {
          summary:
            assessment.assessorComments ||
            'Human assessor retains sole authority to confirm, mark unclear, reject AI observations, and issue the final competency decision.',
          metadata: [
            { label: 'Assessor', value: assessment.reviewer },
            {
              label: 'Confirmed Findings',
              value: `${confirmedObs} of ${assessment.observations.length}`,
            },
            {
              label: 'Final Outcome',
              value: assessment.finalDecision || 'Pending review submission',
            },
          ],
        },
      },
      {
        id: 'credential',
        stage: 7,
        title: 'Competency Credential',
        subtitle: credential ? credential.id : 'Issued upon Competent decision',
        category: 'credential',
        statusText: hasCredential ? 'Issued (Demo preview)' : 'Not yet issued',
        x: 528,
        y: row2Y,
        w,
        h,
        details: {
          summary: credential
            ? credential.evidenceSummary
            : 'A competency credential is only generated after a human assessor explicitly determines the candidate is Competent.',
          metadata: credential
            ? [
                { label: 'Credential ID', value: credential.id },
                { label: 'Issuer', value: credential.issuer },
                { label: 'Issued Date', value: formatDisplayDate(credential.issuedDate) },
              ]
            : [{ label: 'Status', value: 'Blocked until human approval' }],
        },
      },
      {
        id: 'verification',
        stage: 8,
        title: 'Verification Record',
        subtitle: credential ? credential.verificationUrl : 'Public employer check',
        category: 'credential',
        statusText: hasCredential ? 'Publicly verifiable' : 'Inactive',
        x: 782,
        y: row2Y,
        w,
        h,
        details: {
          summary:
            'Allows employers to verify competency authenticity via unique link or QR code without exposing private video evidence or sensitive candidate records.',
          metadata: credential
            ? [
                { label: 'Public Route', value: credential.verificationUrl },
                { label: 'Video Exposure', value: 'Blocked (Privacy by design)' },
                { label: 'Signer Status', value: 'Demo preview (Backend signing pending)' },
              ]
            : [{ label: 'Availability', value: 'Activated upon credential issuance' }],
        },
      },
    ];
  }, [assessment, credential, confirmedObs, flaggedObs, hasCredential]);

  const edges: GraphEdgeDef[] = useMemo(
    () => [
      {
        id: 'e-comp-task',
        from: 'competency',
        to: 'task',
        label: 'scoped by',
        active: true,
      },
      {
        id: 'e-task-rubric',
        from: 'task',
        to: 'rubric',
        label: 'evaluated via',
        active: true,
      },
      {
        id: 'e-rubric-video',
        from: 'rubric',
        to: 'video',
        label: 'captured in',
        active: true,
      },
      {
        id: 'e-video-ai',
        from: 'video',
        to: 'ai',
        label: 'indexed into',
        active: true,
      },
      {
        id: 'e-rubric-ai',
        from: 'rubric',
        to: 'ai',
        label: 'guides',
        active: true,
        dashed: true,
      },
      {
        id: 'e-ai-human',
        from: 'ai',
        to: 'human',
        label: 'assists',
        active: true,
        dashed: true,
      },
      {
        id: 'e-rubric-human',
        from: 'rubric',
        to: 'human',
        label: 'judged against',
        active: hasHumanReview,
      },
      {
        id: 'e-human-cred',
        from: 'human',
        to: 'credential',
        label: 'authorizes',
        active: hasCredential,
      },
      {
        id: 'e-cred-verify',
        from: 'credential',
        to: 'verification',
        label: 'publishes',
        active: hasCredential,
      },
    ],
    [hasHumanReview, hasCredential]
  );

  const connectedNodeIds = useMemo(() => {
    const focus = hoveredNodeId || selectedNodeId;
    if (!focus) return new Set<string>();
    const set = new Set<string>([focus]);
    edges.forEach((e) => {
      if (e.from === focus) set.add(e.to);
      if (e.to === focus) set.add(e.from);
    });
    return set;
  }, [hoveredNodeId, selectedNodeId, edges]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[5];

  const getNodeById = (id: string) => nodes.find((n) => n.id === id)!;

  const buildPath = (edge: GraphEdgeDef) => {
    const src = getNodeById(edge.from);
    const dst = getNodeById(edge.to);

    // Same row horizontal connection
    if (src.y === dst.y) {
      const x1 = src.x + src.w;
      const y1 = src.y + src.h / 2;
      const x2 = dst.x;
      const y2 = dst.y + dst.h / 2;
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
    }

    // Cross-row connection (e.g. Video -> AI, Rubric -> AI, Rubric -> Human)
    const x1 = src.x + src.w / 2;
    const y1 = src.y + src.h;
    const x2 = dst.x + dst.w / 2;
    const y2 = dst.y;
    const ctrlY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${ctrlY}, ${x2} ${ctrlY}, ${x2} ${y2}`;
  };

  return (
    <div className="space-y-5">
      {/* Legend & Traceability Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-zinc-800">Node Legend:</span>
          {(Object.keys(NODE_STYLES) as GraphNodeCategory[]).map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1.5 text-zinc-600">
              <span
                className="h-2.5 w-2.5 rounded-xs"
                style={{ backgroundColor: NODE_STYLES[cat].dotColor }}
                aria-hidden="true"
              />
              <span>{NODE_STYLES[cat].badgeLabel}</span>
            </span>
          ))}
        </div>
        <span className="text-[11px] text-zinc-500">
          Hover a node to highlight connections · Click any node to inspect evidence traceability
        </span>
      </div>

      {/* Main Split: Graph Canvas + Inspector Panel */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Interactive DAG Canvas */}
        <div className="xl:col-span-8 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
            <div>
              <h2 className="font-display text-sm font-semibold text-zinc-900">
                Verification Chain: {assessment.candidateName}
              </h2>
              <p className="text-xs text-zinc-500">
                {assessment.competency} · {assessment.referenceCode}
              </p>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              Claim → Rubric → Evidence → AI → Human → Credential
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="relative min-w-[1020px]" style={{ height: '390px' }}>
              {/* SVG Edges Layer */}
              <svg
                viewBox="0 0 1020 390"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="arrow-active"
                    markerWidth="7"
                    markerHeight="7"
                    refX="6"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="#4F46E5" />
                  </marker>
                  <marker
                    id="arrow-muted"
                    markerWidth="7"
                    markerHeight="7"
                    refX="6"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="#CBD5E1" />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const focus = hoveredNodeId || selectedNodeId;
                  const isHighlighted =
                    !focus || edge.from === focus || edge.to === focus;
                  const strokeColor = !edge.active
                    ? '#E4E4E7'
                    : isHighlighted
                      ? '#4F46E5'
                      : '#CBD5E1';

                  return (
                    <path
                      key={edge.id}
                      d={buildPath(edge)}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHighlighted && edge.active ? 2 : 1.5}
                      strokeDasharray={edge.dashed || !edge.active ? '5 4' : undefined}
                      markerEnd={
                        edge.active && isHighlighted
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-muted)'
                      }
                      className="transition-colors duration-150"
                    />
                  );
                })}
              </svg>

              {/* Interactive HTML Nodes Layer */}
              {nodes.map((node) => {
                const style = NODE_STYLES[node.category];
                const Icon = NODE_ICONS[node.id] || CheckCircle2;
                const isSelected = selectedNodeId === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const dimmed = hoveredNodeId !== null && !isConnected;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${node.w}px`,
                      height: `${node.h}px`,
                    }}
                    className={`absolute flex flex-col justify-between rounded-xl border text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                      style.border
                    } ${style.bg} ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 ring-offset-2 shadow-sm'
                        : 'hover:shadow-sm'
                    } ${dimmed ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <div
                      className={`flex items-center justify-between rounded-t-[10px] px-3 py-1.5 ${style.headerBg}`}
                    >
                      <span className={`text-[10px] font-semibold ${style.accentText}`}>
                        0{node.stage}. {style.badgeLabel}
                      </span>
                      <Icon className={`h-3.5 w-3.5 ${style.accentText}`} aria-hidden="true" />
                    </div>

                    <div className="px-3 py-2">
                      <p className="truncate font-display text-xs font-semibold text-zinc-900">
                        {node.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                        {node.subtitle}
                      </p>
                    </div>

                    <div className="border-t border-zinc-200/70 px-3 py-1.5">
                      <p className="truncate font-mono text-[10px] font-medium text-zinc-500">
                        {node.statusText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Path Breadcrumb Strip */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3 text-[11px] text-zinc-600">
            <span className="font-semibold text-zinc-800">Active path:</span>
            {nodes.map((n, idx) => (
              <span key={n.id} className="inline-flex items-center gap-1.5">
                {idx > 0 && <span aria-hidden="true" className="text-zinc-400">→</span>}
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    selectedNodeId === n.id
                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                      : 'hover:bg-zinc-100'
                  }`}
                >
                  {n.title}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Node Inspector Panel */}
        <aside className="xl:col-span-4 rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <p className="text-[11px] font-semibold text-indigo-600">
                  Node 0{selectedNode.stage} · {NODE_STYLES[selectedNode.category].badgeLabel}
                </p>
                <h3 className="mt-0.5 font-display text-base font-semibold text-zinc-900">
                  {selectedNode.title}
                </h3>
              </div>
              <span className="rounded-md border border-zinc-200 bg-[#F8F8F6] px-2 py-1 font-mono text-[11px] text-zinc-600">
                {selectedNode.statusText}
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-zinc-700">
              {selectedNode.details.summary}
            </p>

            <div className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-[#F8F8F6]">
              {selectedNode.details.metadata.map((item, idx) => (
                <div key={idx} className="px-3.5 py-2.5">
                  <p className="text-[11px] font-medium text-zinc-500">{item.label}</p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-900">{item.value}</p>
                </div>
              ))}
            </div>

            {selectedNode.details.privacyNote && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-[11px] text-amber-900">
                {selectedNode.details.privacyNote}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
            <Link
              to={`/evidence-review/${assessment.id}`}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Inspect in Evidence Review
            </Link>
            {credential && (
              <Link
                to={credential.verificationUrl}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
              >
                Open Public Verification
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
