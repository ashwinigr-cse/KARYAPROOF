import { Award, CheckCircle2, Copy, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CredentialCertificatePreview } from '../components/credentials/CredentialCertificatePreview';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { formatDisplayDate } from '../utils/formatters';

export function CredentialsPage() {
  const { credentials, pushToast } = useKaryaProofStore();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(credentials[0]?.id || '');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credentials;
    return credentials.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.candidateName.toLowerCase().includes(q) ||
        c.competency.toLowerCase().includes(q)
    );
  }, [credentials, search]);

  const activeCredential =
    credentials.find((c) => c.id === selectedId) || filtered[0] || credentials[0];

  const handleCopy = async (verificationUrl: string) => {
    const url = `${window.location.origin}${verificationUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      pushToast('Verification link copied', url, 'success');
    } catch {
      pushToast('Verification URL', url, 'default');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-900">
            Issued Competency Credentials
          </h2>
          <p className="text-xs text-zinc-500">
            Credentials are issued only after human assessor confirmation. Cryptographic signing will be connected in the backend.
          </p>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ID or candidate..."
            aria-label="Filter issued credentials"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Credentials Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-[#F8F8F6] text-[11px] font-semibold text-zinc-500">
                <th className="px-5 py-3">Credential ID</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Competency</th>
                <th className="px-4 py-3">Issued Date</th>
                <th className="px-4 py-3">Issuer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((cred) => {
                const isSelected = activeCredential?.id === cred.id;
                return (
                  <tr
                    key={cred.id}
                    onClick={() => setSelectedId(cred.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/45' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-zinc-900 tabular-nums whitespace-nowrap">
                      {cred.id}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900 whitespace-nowrap">
                      {cred.candidateName}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700 whitespace-nowrap">
                      {cred.competency}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 tabular-nums whitespace-nowrap">
                      {formatDisplayDate(cred.issuedDate)}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3.5 text-zinc-600">
                      {cred.issuer}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>Demo Active</span>
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(cred.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          <Award className="h-3 w-3" />
                          <span>View credential</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(cred.verificationUrl)}
                          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy link</span>
                        </button>
                        <Link
                          to={cred.verificationUrl}
                          className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zinc-800"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Verify</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Credential Certificate Preview */}
      {activeCredential && (
        <section aria-label="Selected credential certificate preview" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-zinc-900">
              Certificate Preview — {activeCredential.candidateName} ({activeCredential.id})
            </h3>
          </div>
          <CredentialCertificatePreview credential={activeCredential} />
        </section>
      )}
    </div>
  );
}
