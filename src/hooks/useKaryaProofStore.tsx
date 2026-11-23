import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  INITIAL_ACTIVITIES,
  INITIAL_ASSESSMENTS,
  INITIAL_CREDENTIALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  PRESET_COMPETENCIES,
} from '../data/mockData';
import { storageService } from '../services/storageService';
import {
  ActivityItem,
  Assessment,
  AssessmentStatus,
  AssessorObservationAction,
  CredentialRecord,
  FinalCompetencyDecision,
  NotificationItem,
  RubricCriterion,
  UserSettings,
  VideoMetadata,
} from '../types';
import { generateCredentialId, generateReferenceCode } from '../utils/formatters';

export interface CreateAssessmentInput {
  candidateName: string;
  candidateEmail: string;
  competency: string;
  taskTitle: string;
  taskDescription: string;
  rubricCriteria: Omit<RubricCriterion, 'id'>[];
  isNewCompetency?: boolean;
}

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning';
}

interface KaryaProofContextValue {
  assessments: Assessment[];
  credentials: CredentialRecord[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  competencies: string[];
  settings: UserSettings;
  toasts: ToastMessage[];
  sessionVideoUrls: Record<string, string>;
  pushToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  dismissToast: (id: string) => void;
  createAssessment: (input: CreateAssessmentInput) => Assessment;
  attachSessionVideo: (assessmentId: string, objectUrl: string, meta: VideoMetadata) => void;
  updateObservationAction: (
    assessmentId: string,
    observationId: string,
    action: AssessorObservationAction,
    note?: string
  ) => void;
  submitFinalDecision: (
    assessmentId: string,
    decision: FinalCompetencyDecision,
    comments: string
  ) => CredentialRecord | null;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (next: UserSettings) => void;
  resetDemoData: () => void;
}

const KaryaProofContext = createContext<KaryaProofContextValue | null>(null);

export function KaryaProofProvider({ children }: { children: React.ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>(() => storageService.getAssessments());
  const [credentials, setCredentials] = useState<CredentialRecord[]>(() => storageService.getCredentials());
  const [activities, setActivities] = useState<ActivityItem[]>(() => storageService.getActivities());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storageService.getNotifications());
  const [competencies, setCompetencies] = useState<string[]>(() => storageService.getCompetencies());
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sessionVideoUrls, setSessionVideoUrls] = useState<Record<string, string>>({});

  const pushToast = useCallback(
    (title: string, description?: string, variant: ToastMessage['variant'] = 'default') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const createAssessment = useCallback(
    (input: CreateAssessmentInput): Assessment => {
      const id = `asm-${Date.now()}`;
      const referenceCode = generateReferenceCode(assessments.length);
      const today = new Date().toISOString().slice(0, 10);

      const criteriaWithIds: RubricCriterion[] = input.rubricCriteria.map((c, idx) => ({
        id: `crit-${Date.now()}-${idx}`,
        title: c.title.trim(),
        description: c.description.trim(),
        required: c.required,
      }));

      const newAssessment: Assessment = {
        id,
        referenceCode,
        candidateName: input.candidateName.trim(),
        candidateEmail: input.candidateEmail.trim(),
        competency: input.competency.trim(),
        taskTitle: input.taskTitle.trim() || `${input.competency.trim()} Practical Task`,
        taskDescription: input.taskDescription.trim(),
        submissionDate: today,
        status: 'Submitted',
        reviewer: settings.assessmentPreferences.defaultReviewer || 'Ashwini Rao',
        rubricCriteria: criteriaWithIds,
        videoMeta: {
          filename: 'No local video selected yet',
          durationSeconds: null,
          fileSizeLabel: '—',
          uploadStatus: 'Awaiting Upload',
          uploadedAt: new Date().toISOString(),
        },
        observations: criteriaWithIds.slice(0, 3).map((crit, index) => {
          const secs = (index + 1) * 18;
          const mins = Math.floor(secs / 60);
          const rem = secs % 60;
          return {
            id: `obs-${Date.now()}-${index}`,
            timestampSeconds: secs,
            timestampLabel: `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`,
            criterionId: crit.id,
            criterionTitle: crit.title,
            description: `Demo AI observation placeholder for "${crit.title}" — upload a video or run demo clip to inspect.`,
            confidence: index === 2 ? 'Low' : 'Medium',
            evidenceFlag: index === 2 ? 'Unclear' : 'Clear',
            assessorAction: 'Pending',
          };
        }),
      };

      const nextAssessments = [newAssessment, ...assessments];
      setAssessments(nextAssessments);
      storageService.saveAssessments(nextAssessments);

      if (input.isNewCompetency && !competencies.includes(input.competency.trim())) {
        const nextComps = [...competencies, input.competency.trim()];
        setCompetencies(nextComps);
        storageService.saveCompetencies(nextComps);
      }

      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'evidence_submitted',
        title: 'Assessment created',
        description: `${newAssessment.candidateName} enrolled for ${newAssessment.competency} (${referenceCode}).`,
        timestamp: 'Just now',
        assessmentId: id,
      };
      const nextActivities = [newAct, ...activities];
      setActivities(nextActivities);
      storageService.saveActivities(nextActivities);

      pushToast('Assessment created', `${referenceCode} added for ${newAssessment.candidateName}.`, 'success');
      return newAssessment;
    },
    [assessments, competencies, activities, settings.assessmentPreferences.defaultReviewer, pushToast]
  );

  const attachSessionVideo = useCallback(
    (assessmentId: string, objectUrl: string, meta: VideoMetadata) => {
      if (objectUrl) {
        setSessionVideoUrls((prev) => ({ ...prev, [assessmentId]: objectUrl }));
      }
      setAssessments((prev) => {
        const next = prev.map((a) =>
          a.id === assessmentId
            ? {
                ...a,
                videoMeta: meta,
                status: a.status === 'Submitted' ? ('Under Review' as const) : a.status,
              }
            : a
        );
        storageService.saveAssessments(next);
        return next;
      });
    },
    []
  );

  const updateObservationAction = useCallback(
    (
      assessmentId: string,
      observationId: string,
      action: AssessorObservationAction,
      note?: string
    ) => {
      setAssessments((prev) => {
        const next = prev.map((asm) => {
          if (asm.id !== assessmentId) return asm;
          return {
            ...asm,
            status: asm.status === 'Submitted' ? ('Under Review' as const) : asm.status,
            observations: asm.observations.map((obs) =>
              obs.id === observationId
                ? {
                    ...obs,
                    assessorAction: action,
                    assessorNote: note !== undefined ? note : obs.assessorNote,
                  }
                : obs
            ),
          };
        });
        storageService.saveAssessments(next);
        return next;
      });
    },
    []
  );

  const submitFinalDecision = useCallback(
    (
      assessmentId: string,
      decision: FinalCompetencyDecision,
      comments: string
    ): CredentialRecord | null => {
      const target = assessments.find((a) => a.id === assessmentId);
      if (!target) return null;

      const nextStatus: AssessmentStatus =
        decision === 'Competent'
          ? 'Verified'
          : decision === 'Needs Further Evidence'
            ? 'Needs Evidence'
            : 'Needs Evidence';

      let issuedCredential: CredentialRecord | null = null;
      let credentialIdToSet = target.credentialId;

      if (decision === 'Competent') {
        const existingCred = credentials.find((c) => c.assessmentId === assessmentId);
        if (existingCred) {
          issuedCredential = existingCred;
          credentialIdToSet = existingCred.id;
        } else {
          const newCredId = generateCredentialId(credentials.length);
          const confirmedCount = target.observations.filter(
            (o) => o.assessorAction === 'Confirmed'
          ).length;
          issuedCredential = {
            id: newCredId,
            assessmentId: target.id,
            assessmentReference: target.referenceCode,
            candidateName: target.candidateName,
            competency: target.competency,
            issuedDate: new Date().toISOString().slice(0, 10),
            issuer: settings.organization.defaultIssuerLabel,
            humanAssessor: settings.profile.fullName,
            evidenceSummary: `Human-verified practical video evidence (${target.videoMeta.filename}) with ${confirmedCount}/${target.observations.length} observations confirmed against ${target.rubricCriteria.length} rubric criteria.`,
            status: 'Active',
            verificationUrl: `/verify/${newCredId}`,
          };
          credentialIdToSet = newCredId;
          const nextCredentials = [issuedCredential, ...credentials];
          setCredentials(nextCredentials);
          storageService.saveCredentials(nextCredentials);
        }
      }

      const nextAssessments = assessments.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              status: nextStatus,
              finalDecision: decision,
              assessorComments: comments.trim(),
              reviewedAt: new Date().toISOString(),
              reviewer: settings.profile.fullName,
              credentialId: credentialIdToSet,
            }
          : a
      );
      setAssessments(nextAssessments);
      storageService.saveAssessments(nextAssessments);

      const activityEntry: ActivityItem =
        decision === 'Competent'
          ? {
              id: `act-${Date.now()}`,
              type: 'credential_issued',
              title: 'Review completed & credential issued',
              description: `${settings.profile.fullName} verified ${target.candidateName} (${target.competency}) — ${credentialIdToSet}.`,
              timestamp: 'Just now',
              assessmentId: target.id,
            }
          : {
              id: `act-${Date.now()}`,
              type: 'evidence_requested',
              title:
                decision === 'Needs Further Evidence'
                  ? 'Additional evidence requested'
                  : 'Review recorded — Not Yet Competent',
              description: `${settings.profile.fullName} recorded "${decision}" for ${target.candidateName}.`,
              timestamp: 'Just now',
              assessmentId: target.id,
            };

      const nextActivities = [activityEntry, ...activities];
      setActivities(nextActivities);
      storageService.saveActivities(nextActivities);

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title:
          decision === 'Competent'
            ? 'Credential successfully issued'
            : 'Assessor review recorded',
        message:
          decision === 'Competent'
            ? `${target.candidateName} verified for ${target.competency} (${credentialIdToSet}).`
            : `${target.candidateName} marked as ${decision}.`,
        timestamp: 'Just now',
        read: false,
        targetRoute: decision === 'Competent' ? '/credentials' : `/evidence-review/${target.id}`,
      };
      const nextNotifs = [newNotif, ...notifications];
      setNotifications(nextNotifs);
      storageService.saveNotifications(nextNotifs);

      pushToast(
        decision === 'Competent' ? 'Competency Verified' : 'Decision Recorded',
        decision === 'Competent'
          ? `Credential ${credentialIdToSet} issued locally for ${target.candidateName}.`
          : `Saved "${decision}" for ${target.candidateName} locally.`,
        decision === 'Competent' ? 'success' : 'warning'
      );

      return issuedCredential;
    },
    [assessments, credentials, activities, notifications, settings, pushToast]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      setNotifications(next);
      storageService.saveNotifications(next);
    },
    [notifications]
  );

  const markAllNotificationsRead = useCallback(() => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(next);
    storageService.saveNotifications(next);
  }, [notifications]);

  const updateSettings = useCallback(
    (next: UserSettings) => {
      setSettings(next);
      storageService.saveSettings(next);
      pushToast('Settings saved', 'Your local workspace preferences have been updated.', 'success');
    },
    [pushToast]
  );

  const resetDemoData = useCallback(() => {
    storageService.resetAll();
    setAssessments(INITIAL_ASSESSMENTS);
    setCredentials(INITIAL_CREDENTIALS);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCompetencies(PRESET_COMPETENCIES);
    setSettings(INITIAL_SETTINGS);
    setSessionVideoUrls({});
    pushToast('Demo data restored', 'All local changes reset to initial KARYAPROOF sample records.', 'default');
  }, [pushToast]);

  return (
    <KaryaProofContext.Provider
      value={{
        assessments,
        credentials,
        activities,
        notifications,
        competencies,
        settings,
        toasts,
        sessionVideoUrls,
        pushToast,
        dismissToast,
        createAssessment,
        attachSessionVideo,
        updateObservationAction,
        submitFinalDecision,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </KaryaProofContext.Provider>
  );
}

export function useKaryaProofStore() {
  const ctx = useContext(KaryaProofContext);
  if (!ctx) {
    throw new Error('useKaryaProofStore must be used inside KaryaProofProvider');
  }
  return ctx;
}
