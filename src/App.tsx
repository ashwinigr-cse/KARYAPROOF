import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ToastContainer } from './components/ui/Toast';
import { KaryaProofProvider } from './hooks/useKaryaProofStore';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { EvidenceGraphPage } from './pages/EvidenceGraphPage';
import { EvidenceReviewPage } from './pages/EvidenceReviewPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { OverviewPage } from './pages/OverviewPage';
import { PublicVerificationPage } from './pages/PublicVerificationPage';
import { SettingsPage } from './pages/SettingsPage';
import { VerificationPortalPage } from './pages/VerificationPortalPage';

export default function App() {
  return (
    <KaryaProofProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Public Verification Route (No internal sidebar/shell) */}
          <Route path="/verify/:credentialId" element={<PublicVerificationPage />} />
          <Route path="/verify" element={<Navigate to="/verify/KP-2026-0001" replace />} />

          {/* Internal Assessor Workspace */}
          <Route element={<AppShell />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/evidence-review" element={<EvidenceReviewPage />} />
            <Route path="/evidence-review/:assessmentId" element={<EvidenceReviewPage />} />
            <Route path="/evidence-graph" element={<EvidenceGraphPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/verification" element={<VerificationPortalPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </KaryaProofProvider>
  );
}
