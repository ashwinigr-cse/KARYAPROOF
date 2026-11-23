import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QrCodeSvg } from '../components/credentials/QrCodeSvg';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { formatDisplayDate } from '../utils/formatters';

export function PublicVerificationPage() {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const { credentials } = useKaryaProofStore();
  const [lookupInput, setLookupInput] = useState(credentialId || '');

  const normalizedId = (credentialId || '').trim().toUpperCase();

  const matchedCredential = useMemo(
    () => credentials.find((c) => c.id.toUpperCase() === normalizedId),
    [credentials, normalizedId]
  );

  const verificationTimestamp = useMemo(
    () =>
      new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [normalizedId]
  );

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = lookupInput.trim();
    if (!trimmed) return;
    navigate(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-zinc-900">
      {/* Standalone Public Top Header — No Dashboard Sidebar */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display text-sm font-bold tracking-tight text-zinc-900">
                KARYAPROOF
              </span>
              <span className="ml-2 text-xs text-zinc-500">Public Credential Verifier</span>
            </div>
          </div>

          <Link
            to="/credentials"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to workspace</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {/* Quick Lookup Bar */}
        <form
          onSubmit={handleLookup}
          className="flex flex-col gap-2.5 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Check another credential ID (e.g. KP-2026-0001)"
              aria-label="Lookup credential ID"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-[#F8F8F6] pl-9 pr-3 font-mono text-xs text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 whitespace-nowrap"
          >
            Check authenticity
          </button>
        </form>

        {/* Verification Result Card */}
        {matchedCredential ? (
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
            {/* Prominent Verified Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 bg-emerald-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-emerald-950">
                    Credential Verified (Demo Record)
                  </p>
                  <p className="text-xs text-emerald-800">
                    This competency claim was confirmed by a human assessor against practical rubric evidence.
                  </p>
                </div>
              </div>
              <span className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 font-mono text-xs font-semibold text-emerald-900 tabular-nums">
                {matchedCredential.id}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Recipient</p>
                      <p className="mt-1 font-display text-xl font-bold text-zinc-900">
                        {matchedCredential.candidateName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Verified Competency</p>
                      <p className="mt-1 font-display text-xl font-bold text-indigo-700">
                        {matchedCredential.competency}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-t border-zinc-200 pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500">Issuing Authority</p>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-900">
                        {matchedCredential.issuer}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500">Issue Date</p>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-900 tabular-nums">
                        {formatDisplayDate(matchedCredential.issuedDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-zinc-500">Verification Timestamp</p>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-900 tabular-nums">
                        {verificationTimestamp}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 bg-[#F8F8F6] p-4">
                    <p className="text-xs font-semibold text-zinc-900">Assessment Summary</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700">
                      {matchedCredential.evidenceSummary}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                      <span>Assessment Reference: {matchedCredential.assessmentReference}</span>
                      <span aria-hidden="true">·</span>
                      <span>Human Assessor: {matchedCredential.humanAssessor}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <QrCodeSvg
                    value={`${window.location.origin}${matchedCredential.verificationUrl}`}
                    size={120}
                  />
                </div>
              </div>

              {/* Privacy by Design Guarantee */}
              <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-zinc-900">
                    Privacy by Design — Private Evidence Protected
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    In accordance with KARYAPROOF privacy principles, raw candidate video recordings, personal identity documents, email addresses, and internal review deliberations are never exposed on public verification pages. Cryptographic registry signing will be enforced by the backend upon production deployment.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-xl border border-red-200 bg-white">
            <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-red-950">
                  Credential Not Found or Invalid
                </p>
                <p className="text-xs text-red-800">
                  No verified KARYAPROOF record matches identifier "{credentialId}".
                </p>
              </div>
            </div>
            <div className="p-6 text-xs text-zinc-600 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <p>
                  Verify that the credential ID was typed accurately, or ask the candidate to share their updated verification link.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-zinc-500">Try a demo credential:</span>
                {credentials.map((c) => (
                  <Link
                    key={c.id}
                    to={c.verificationUrl}
                    className="rounded-md border border-zinc-200 bg-[#F8F8F6] px-2.5 py-1 font-mono text-[11px] font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    {c.id}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
