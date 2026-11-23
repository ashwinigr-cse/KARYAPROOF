import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Copy, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCodeSvg } from '../components/credentials/QrCodeSvg';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { formatDisplayDate } from '../utils/formatters';

export function VerificationPortalPage() {
  const { credentials, pushToast } = useKaryaProofStore();
  const [lookupId, setLookupId] = useState('KP-2026-0001');
  const navigate = useNavigate();

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = lookupId.trim();
    if (!cleaned) return;
    navigate(`/verify/${encodeURIComponent(cleaned)}`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Employer Verification Gateway</span>
          </div>
          <h2 className="mt-1.5 font-display text-xl font-bold text-zinc-900">
            Verify a Competency Credential
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            Enter a KARYAPROOF credential identifier to launch the standalone public verification page. Public verification confirms competency authenticity without exposing raw candidate videos or internal assessor notes.
          </p>

          <form onSubmit={handleVerifySubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter credential ID (e.g. KP-2026-0001)"
                aria-label="Credential identifier"
                className="h-10 w-full rounded-lg border border-zinc-200 bg-[#F8F8F6] pl-9 pr-3 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-xs font-medium text-white hover:bg-indigo-700 whitespace-nowrap"
            >
              <span>Open public verification</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-zinc-900">
          Available Demo Verifiable Credentials
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {credentials.map((cred) => {
            const fullUrl = `${window.location.origin}${cred.verificationUrl}`;
            return (
              <div
                key={cred.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900">
                      {cred.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Verifiable
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-zinc-900">
                      {cred.candidateName}
                    </p>
                    <p className="text-xs font-medium text-indigo-700">{cred.competency}</p>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Issued {formatDisplayDate(cred.issuedDate)} · Assessor: {cred.humanAssessor}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Link
                      to={cred.verificationUrl}
                      className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Open /verify/{cred.id}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(fullUrl).catch(() => {});
                        pushToast('Verification URL copied', fullUrl, 'success');
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy link</span>
                    </button>
                  </div>
                </div>

                <div className="hidden shrink-0 sm:block">
                  <QrCodeSvg value={fullUrl} size={84} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
