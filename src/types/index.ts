export type AssessmentStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Needs Evidence';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type EvidenceFlag =
  | 'Clear'
  | 'Unclear'
  | 'Missing evidence'
  | 'Needs additional angle'
  | 'Unable to determine';

export type AssessorObservationAction =
  | 'Pending'
  | 'Confirmed'
  | 'Unclear'
  | 'Rejected'
  | 'Requested Evidence';

export type FinalCompetencyDecision =
  | 'Competent'
  | 'Needs Further Evidence'
  | 'Not Yet Competent';

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface AiObservation {
  id: string;
  timestampSeconds: number;
  timestampLabel: string;
  criterionId: string;
  criterionTitle: string;
  description: string;
  confidence: ConfidenceLevel;
  evidenceFlag: EvidenceFlag;
  assessorAction: AssessorObservationAction;
  assessorNote?: string;
}

export interface VideoMetadata {
  filename: string;
  durationSeconds: number | null;
  fileSizeLabel: string;
  uploadStatus: 'Attached (Local)' | 'Demo Simulation' | 'Awaiting Upload';
  uploadedAt: string;
}

export interface Assessment {
  id: string;
  referenceCode: string;
  candidateName: string;
  candidateEmail: string;
  competency: string;
  taskTitle: string;
  taskDescription: string;
  submissionDate: string;
  status: AssessmentStatus;
  reviewer: string;
  rubricCriteria: RubricCriterion[];
  videoMeta: VideoMetadata;
  observations: AiObservation[];
  finalDecision?: FinalCompetencyDecision;
  assessorComments?: string;
  reviewedAt?: string;
  credentialId?: string;
}

export interface CredentialRecord {
  id: string;
  assessmentId: string;
  assessmentReference: string;
  candidateName: string;
  competency: string;
  issuedDate: string;
  issuer: string;
  humanAssessor: string;
  evidenceSummary: string;
  status: 'Active' | 'Pending Signature';
  verificationUrl: string;
}

export interface ActivityItem {
  id: string;
  type: 'evidence_submitted' | 'review_completed' | 'credential_issued' | 'evidence_requested';
  title: string;
  description: string;
  timestamp: string;
  assessmentId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoute: string;
}

export interface UserSettings {
  profile: {
    fullName: string;
    role: string;
    email: string;
  };
  organization: {
    name: string;
    accreditationCode: string;
    defaultIssuerLabel: string;
  };
  assessmentPreferences: {
    requireAllCriteriaConfirmed: boolean;
    showLowConfidenceWarnings: boolean;
    defaultReviewer: string;
  };
  privacy: {
    retainVideoLocallyOnly: boolean;
    maskCandidateEmailOnVerify: boolean;
    includeAssessorNameOnCredential: boolean;
  };
}

export type GraphNodeCategory = 'claim' | 'evidence' | 'ai' | 'human' | 'credential';

export interface EvidenceGraphNode {
  id: string;
  stage: number;
  title: string;
  subtitle: string;
  category: GraphNodeCategory;
  statusText: string;
  details: {
    summary: string;
    metadata: { label: string; value: string }[];
    privacyNote?: string;
  };
}

export interface EvidenceGraphEdge {
  from: string;
  to: string;
  label: string;
  active: boolean;
}
