# KARYAPROOF

**Skills. Proven.**  
An AI-assisted practical skills verification platform where real-world video evidence, structured assessment rubrics, human assessor authority, and traceable evidence graphs turn practical ability into verifiable competency credentials.

---

## Core Principles

- **Practical Evidence Over Claims:** Competencies are backed by real task video submissions mapped to explicit rubric criteria.
- **AI Assistance, Human Authority:** Assistive AI surfaces timestamped observations, confidence indicators, and uncertainty flags—never final decisions. Human assessors retain sole authority to confirm, reject, request additional evidence, and determine outcomes.
- **End-to-End Traceability (Evidence Graph):** Every claim links transparently through:
  `Competency Claim → Assessment Task → Rubric Criteria → Submitted Video → AI Observations → Human Assessor Findings → Competency Credential → Verification Record`
- **Privacy by Design:** Raw candidate video recordings stay private (local browser preview only in this frontend build) and are never exposed on public employer verification links.
- **Explicit Uncertainty:** Unclear angles, missing steps, and low-confidence segments are surfaced clearly so assessors never overlook incomplete evidence.

---

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Routing:** React Router (`react-router-dom`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons:** Lucide React (`lucide-react`)
- **Persistence (Demo Layer):** Browser `localStorage` via an isolated service module (`src/services/storageService.ts`), structured for drop-in replacement with a FastAPI backend.

---

## Full Project Structure

```text
/
├── .env.example                                  # Environment variable template
├── .gitignore                                    # Git ignore rules
├── bun.lock                                      # Lockfile
├── index.html                                    # HTML entry point, metadata, and typography links
├── metadata.json                                 # Application manifest metadata
├── package.json                                  # Dependencies and npm scripts
├── README.md                                     # Project documentation and architecture overview
├── tsconfig.json                                 # TypeScript configuration
├── vite.config.ts                                # Vite configuration and Tailwind plugin
└── src/
    ├── App.tsx                                   # Root router (Workspace shell + standalone /verify/:credentialId)
    ├── index.css                                 # Global Tailwind v4 import and theme typography tokens
    ├── main.tsx                                  # React root mount
    ├── components/
    │   ├── assessments/
    │   │   ├── AssessmentDetailModal.tsx         # Detailed modal for task brief, rubric, and quick navigation
    │   │   └── CreateAssessmentModal.tsx         # Validated modal to enroll candidates and build rubric criteria
    │   ├── credentials/
    │   │   ├── CredentialCertificatePreview.tsx  # Printable/downloadable SVG certificate preview & link actions
    │   │   └── QrCodeSvg.tsx                     # Deterministic SVG QR verification code preview
    │   ├── evidence/
    │   │   ├── HumanDecisionPanel.tsx            # Explicit human-only competency determination form
    │   │   ├── ObservationsPanel.tsx             # Assistive demo AI observations with clickable timestamps
    │   │   └── VideoEvidencePlayer.tsx           # Local HTML5 video player + interactive demo timeline player
    │   ├── graph/
    │   │   └── EvidenceGraphView.tsx             # Interactive 8-node SVG/HTML Evidence Graph & inspector
    │   ├── layout/
    │   │   ├── AppShell.tsx                      # Main dashboard layout wrapper (Sidebar + Topbar + Outlet)
    │   │   ├── NotificationsPopover.tsx          # Interactive notification popover with mark-as-read state
    │   │   ├── Sidebar.tsx                       # Responsive desktop sidebar & mobile navigation drawer
    │   │   └── Topbar.tsx                        # Breadcrumbs, global search dropdown, notifications, profile menu
    │   └── ui/
    │       ├── Modal.tsx                         # Accessible Escape-closable dialog primitive
    │       ├── StatusBadge.tsx                   # Icon + text accessible status badge component
    │       └── Toast.tsx                         # Non-blocking toast notification container
    ├── data/
    │   └── mockData.ts                           # Seed demo candidates, assessments, credentials, and notifications
    ├── hooks/
    │   └── useKaryaProofStore.tsx                # Central React Context store synced with localStorage
    ├── pages/
    │   ├── AssessmentsPage.tsx                   # Searchable, filterable, sortable assessment directory
    │   ├── CredentialsPage.tsx                   # Issued credential registry & interactive certificate preview
    │   ├── EvidenceGraphPage.tsx                 # Candidate selector & Evidence Traceability Graph view
    │   ├── EvidenceReviewPage.tsx                # Core assessor workspace: video + rubric + AI + human decision
    │   ├── HelpSupportPage.tsx                   # Platform workflow guide, privacy principles, and demo support form
    │   ├── OverviewPage.tsx                      # Dashboard overview: KPIs, recent assessments, stats, activity feed
    │   ├── PublicVerificationPage.tsx            # Standalone employer credential verification page (/verify/:id)
    │   ├── SettingsPage.tsx                      # Profile, organization, review rules, privacy, and demo reset
    │   └── VerificationPortalPage.tsx            # Internal gateway to test and launch public verification links
    ├── services/
    │   └── storageService.ts                     # Isolated localStorage persistence layer (API-ready)
    ├── types/
    │   └── index.ts                              # Shared TypeScript interfaces and domain types
    └── utils/
        └── formatters.ts                         # Timestamp, date, file size, and ID formatting helpers
```

---

## Application Routes

### Internal Assessor Workspace (with `AppShell`)
| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | `OverviewPage` | Executive summary, KPIs, recent assessments, verification distribution, and activity feed |
| `/assessments` | `AssessmentsPage` | Search, status/competency filtering, sorting, detail modal, and new assessment creation |
| `/evidence-review` | `EvidenceReviewPage` | Active evidence review workspace (defaults to sample pending review) |
| `/evidence-review/:assessmentId` | `EvidenceReviewPage` | Targeted evidence review for a specific assessment |
| `/evidence-graph` | `EvidenceGraphPage` | Interactive 8-stage Evidence Graph linking claim, rubric, video, AI, human review, and credential |
| `/credentials` | `CredentialsPage` | Registry of issued competency credentials with SVG certificate download and link copy |
| `/verification` | `VerificationPortalPage` | Lookup portal and demo QR links for employer verification |
| `/settings` | `SettingsPage` | Assessor profile, organization, review rules, privacy settings, and demo data reset |
| `/help` | `HelpSupportPage` | Operational guide, privacy principles, and demo support inquiry form |

### Standalone Public Route (No Dashboard Shell)
| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/verify/:credentialId` | `PublicVerificationPage` | Employer-facing authenticity check (e.g., `/verify/KP-2026-0001`). Displays verified/invalid status and high-level summary without exposing raw videos or private assessor notes. |

---

## Local Development & Verification

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build
```

---

## Demo Scope & Backend Readiness

- **Demo AI Observations:** Timestamped AI findings, confidence scores, and evidence flags are clearly labeled **DEMO AI** until connected to the backend video analysis pipeline.
- **Local Video Playback:** Selected videos play strictly inside the browser via `URL.createObjectURL` and are never uploaded to a server.
- **Credential Signing:** Certificates display a preview banner noting that cryptographic digital signatures and registry anchoring will be handled by the backend service upon production issuance.
- **State Persistence:** All created assessments, observation validations, human decisions, issued credentials, notifications, and settings persist locally in `localStorage` and can be restored anytime from **Settings → Reset demo data**.
