import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';
import { UserSettings } from '../types';

export function SettingsPage() {
  const { settings, updateSettings, resetDemoData } = useKaryaProofStore();
  const [draft, setDraft] = useState<UserSettings>(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(draft);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-900">
            Workspace Settings
          </h2>
          <p className="text-xs text-zinc-500">
            Configure assessor profile, issuing organization, review rules, and privacy defaults. Saved locally.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetDemoData();
            window.setTimeout(() => window.location.reload(), 150);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset demo data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-zinc-900">Assessor Profile</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-name" className="block text-xs font-medium text-zinc-700">
                Full name
              </label>
              <input
                id="set-name"
                type="text"
                value={draft.profile.fullName}
                onChange={(e) =>
                  setDraft({ ...draft, profile: { ...draft.profile, fullName: e.target.value } })
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="set-role" className="block text-xs font-medium text-zinc-700">
                Role
              </label>
              <input
                id="set-role"
                type="text"
                value={draft.profile.role}
                onChange={(e) =>
                  setDraft({ ...draft, profile: { ...draft.profile, role: e.target.value } })
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="set-email" className="block text-xs font-medium text-zinc-700">
                Email address
              </label>
              <input
                id="set-email"
                type="email"
                value={draft.profile.email}
                onChange={(e) =>
                  setDraft({ ...draft, profile: { ...draft.profile, email: e.target.value } })
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Organization */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-zinc-900">Organization</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-org" className="block text-xs font-medium text-zinc-700">
                Organization name
              </label>
              <input
                id="set-org"
                type="text"
                value={draft.organization.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    organization: {
                      ...draft.organization,
                      name: e.target.value,
                      defaultIssuerLabel: e.target.value,
                    },
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="set-accred" className="block text-xs font-medium text-zinc-700">
                Accreditation reference
              </label>
              <input
                id="set-accred"
                type="text"
                value={draft.organization.accreditationCode}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    organization: { ...draft.organization, accreditationCode: e.target.value },
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-200 font-mono text-xs px-3 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Assessment Preferences */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
          <h3 className="font-display text-sm font-semibold text-zinc-900">
            Assessment Preferences
          </h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.assessmentPreferences.requireAllCriteriaConfirmed}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  assessmentPreferences: {
                    ...draft.assessmentPreferences,
                    requireAllCriteriaConfirmed: e.target.checked,
                  },
                })
              }
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <div>
              <p className="text-xs font-medium text-zinc-900">
                Require all observations resolved before marking Competent
              </p>
              <p className="text-[11px] text-zinc-500">
                Prevents submitting a Competent final decision while observations remain Pending.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.assessmentPreferences.showLowConfidenceWarnings}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  assessmentPreferences: {
                    ...draft.assessmentPreferences,
                    showLowConfidenceWarnings: e.target.checked,
                  },
                })
              }
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <div>
              <p className="text-xs font-medium text-zinc-900">
                Highlight low-confidence AI observations
              </p>
              <p className="text-[11px] text-zinc-500">
                Calls out uncertain or occluded video segments so assessors inspect them manually.
              </p>
            </div>
          </label>
        </section>

        {/* Privacy */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
          <h3 className="font-display text-sm font-semibold text-zinc-900">
            Privacy by Design
          </h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.privacy.retainVideoLocallyOnly}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  privacy: { ...draft.privacy, retainVideoLocallyOnly: e.target.checked },
                })
              }
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <div>
              <p className="text-xs font-medium text-zinc-900">
                Keep uploaded video previews strictly local to browser session
              </p>
              <p className="text-[11px] text-zinc-500">
                Raw practical videos are never exposed on public verification links.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.privacy.maskCandidateEmailOnVerify}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  privacy: { ...draft.privacy, maskCandidateEmailOnVerify: e.target.checked },
                })
              }
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <div>
              <p className="text-xs font-medium text-zinc-900">
                Hide candidate email and internal notes from public verification pages
              </p>
              <p className="text-[11px] text-zinc-500">
                Employers see only the verified competency, issuer, issue date, and summary.
              </p>
            </div>
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-700"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
