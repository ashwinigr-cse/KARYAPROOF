import {
  INITIAL_ACTIVITIES,
  INITIAL_ASSESSMENTS,
  INITIAL_CREDENTIALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  PRESET_COMPETENCIES,
} from '../data/mockData';
import {
  ActivityItem,
  Assessment,
  CredentialRecord,
  NotificationItem,
  UserSettings,
} from '../types';

const KEYS = {
  ASSESSMENTS: 'karyaproof_v1_assessments',
  CREDENTIALS: 'karyaproof_v1_credentials',
  ACTIVITIES: 'karyaproof_v1_activities',
  NOTIFICATIONS: 'karyaproof_v1_notifications',
  COMPETENCIES: 'karyaproof_v1_competencies',
  SETTINGS: 'karyaproof_v1_settings',
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

export const storageService = {
  getAssessments(): Assessment[] {
    return readJson<Assessment[]>(KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
  },
  saveAssessments(items: Assessment[]): void {
    writeJson(KEYS.ASSESSMENTS, items);
  },

  getCredentials(): CredentialRecord[] {
    return readJson<CredentialRecord[]>(KEYS.CREDENTIALS, INITIAL_CREDENTIALS);
  },
  saveCredentials(items: CredentialRecord[]): void {
    writeJson(KEYS.CREDENTIALS, items);
  },

  getActivities(): ActivityItem[] {
    return readJson<ActivityItem[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },
  saveActivities(items: ActivityItem[]): void {
    writeJson(KEYS.ACTIVITIES, items);
  },

  getNotifications(): NotificationItem[] {
    return readJson<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  saveNotifications(items: NotificationItem[]): void {
    writeJson(KEYS.NOTIFICATIONS, items);
  },

  getCompetencies(): string[] {
    return readJson<string[]>(KEYS.COMPETENCIES, PRESET_COMPETENCIES);
  },
  saveCompetencies(items: string[]): void {
    writeJson(KEYS.COMPETENCIES, items);
  },

  getSettings(): UserSettings {
    return readJson<UserSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: UserSettings): void {
    writeJson(KEYS.SETTINGS, settings);
  },

  resetAll(): void {
    Object.values(KEYS).forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
  },
};
