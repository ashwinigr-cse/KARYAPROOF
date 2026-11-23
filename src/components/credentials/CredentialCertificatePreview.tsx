import { Check, Copy, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useKaryaProofStore } from '../../hooks/useKaryaProofStore';
import { CredentialRecord } from '../../types';
import { formatDisplayDate } from '../../utils/formatters';
import { QrCodeSvg } from './QrCodeSvg';

interface CredentialCertificatePreviewProps {
  credential: CredentialRecord;
}

export function CredentialCertificatePreview({ credential }: CredentialCertificatePreviewProps) {
  const { pushToast } = useKaryaProofStore();
  const [copied, setCopied] = useState(false);

  const fullVerifyUrl = `${window.location.origin}${credential.verificationUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullVerifyUrl);
      setCopied(true);
      pushToast('Verification link copied', fullVerifyUrl, 'success');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      pushToast('Copy verification URL', fullVerifyUrl, 'default');
    }
  };

  const handleDownloadCertificate = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
  <rect width="1200" height="820" fill="#F8F8F6" />
  <rect x="44" y="44" width="1112" height="732" rx="16" fill="#FFFFFF" stroke="#E4E4E7" stroke-width="2" />
  <rect x="64" y="64" width="1072" height="692" rx="12" fill="none" stroke="#E4E4E7" stroke-width="1" />
  <text x="104" y="132" font-family="sans-serif" font-size="18" font-weight="700" fill="#4F46E5" letter-spacing="2">KARYAPROOF</text>
  <text x="104" y="158" font-family="sans-serif" font-size="13" fill="#71717A">PRACTICAL COMPETENCY RECORD (DEMO PREVIEW — UNSIGNED)</text>
  <text x="1096" y="132" text-anchor="end" font-family="monospace" font-size="16" font-weight="600" fill="#18181B">${credential.id}</text>
  <line x1="104" y1="188" x2="1096" y2="188" stroke="#E4E4E7" stroke-width="1" />
  <text x="104" y="254" font-family="sans-serif" font-size="15" fill="#71717A">This verifies that</text>
  <text x="104" y="314" font-family="sans-serif" font-size="44" font-weight="700" fill="#18181B">${credential.candidateName}</text>
  <text x="104" y="372" font-family="sans-serif" font-size="16" fill="#52525B">has demonstrated practical competency in</text>
  <text x="104" y="424" font-family="sans-serif" font-size="30" font-weight="700" fill="#4F46E5">${credential.competency}</text>
  <text x="104" y="492" font-family="sans-serif" font-size="14" fill="#52525B">Assessment Reference: ${credential.assessmentReference}</text>
  <text x="104" y="520" font-family="sans-serif" font-size="14" fill="#52525B">Verified by Human Assessor: ${credential.humanAssessor}</text>
  <text x="104" y="548" font-family="sans-serif" font-size="14" fill="#52525B">Issuing Organization: ${credential.issuer}</text>
  <line x1="104" y1="628" x2="1096" y2="628" stroke="#E4E4E7" stroke-width="1" />
  <text x="104" y="676" font-family="sans-serif" font-size="13" fill="#71717A">Issued on ${formatDisplayDate(credential.issuedDate)}</text>
  <text x="104" y="704" font-family="monospace" font-size="12" fill="#71717A">Verification Route: ${credential.verificationUrl}</text>
  <text x="1096" y="704" text-anchor="end" font-family="sans-serif" font-size="12" fill="#71717A">Cryptographic signature pending backend issuance</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${credential.id}-${credential.candidateName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast('Certificate downloaded', `Saved ${credential.id} preview file.`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Executive Certificate Surface */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
        <div className="border-b border-zinc-200 bg-[#F8F8F6] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-xs font-bold tracking-wide text-zinc-900">
                  KARYAPROOF
                </p>
                <p className="text-[11px] text-zinc-500">Practical Competency Credential</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs font-semibold text-zinc-900 tabular-nums">
                {credential.id}
              </p>
              <p className="text-[11px] text-zinc-500">
                Issued {formatDisplayDate(credential.issuedDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="min-w-0 flex-1 space-y-5">
              <div>
                <p className="text-xs font-medium text-zinc-500">Awarded to</p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-900">
                  {credential.candidateName}
                </h2>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-500">Verified Competency</p>
                <p className="mt-1 font-display text-lg font-semibold text-indigo-700">
                  {credential.competency}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-500">Evidence Summary</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-700">
                  {credential.evidenceSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] text-zinc-500">Assessment Reference</p>
                  <p className="mt-0.5 font-mono text-xs font-medium text-zinc-900">
                    {credential.assessmentReference}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Human Assessor</p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-900">
                    {credential.humanAssessor}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">Issuing Authority</p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-900">{credential.issuer}</p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start md:items-end">
              <QrCodeSvg value={fullVerifyUrl} size={116} />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-[#F8F8F6] px-3.5 py-2.5 text-[11px] text-zinc-600">
            Demo preview record — cryptographic digital signature and tamper-evident registry anchoring will be applied by the backend signing service upon production issuance.
          </div>
        </div>
      </div>

      {/* Credential Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-zinc-500">Public Verification Link</p>
          <p className="truncate font-mono text-xs text-zinc-800">{fullVerifyUrl}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy verification link'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCertificate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download certificate</span>
          </button>

          <Link
            to={credential.verificationUrl}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open public verifier</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
