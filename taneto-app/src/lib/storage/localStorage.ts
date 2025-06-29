import { JournalEntry, DailyLog, UserProgress } from '@/lib/types';

const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'taneto_journal_entries',
  DAILY_LOGS: 'taneto_daily_logs',
  USER_PROGRESS: 'taneto_user_progress',
  ONBOARDING_COMPLETED: 'taneto_onboarding_completed'
} as const;

// Simple encryption for local storage (base64 encoding for MVP)
const encrypt = (data: string): string => {
  return btoa(unescape(encodeURIComponent(data)));
};

const decrypt = (data: string): string => {
  return decodeURIComponent(escape(atob(data)));
};

export const storageUtils = {
  // Journal entries
  getJournalEntries(): JournalEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      if (!encrypted) return [];
      
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error reading journal entries:', error);
      return [];
    }
  },

  saveJournalEntry(entry: JournalEntry): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entries = this.getJournalEntries();
      entries.push(entry);
      
      const encrypted = encrypt(JSON.stringify(entries));
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, encrypted);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  },

  // Daily logs
  getDailyLogs(): DailyLog[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (!encrypted) return [];
      
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error reading daily logs:', error);
      return [];
    }
  },

  saveDailyLog(log: DailyLog): void {
    if (typeof window === 'undefined') return;
    
    try {
      const logs = this.getDailyLogs();
      const existingIndex = logs.findIndex(l => l.date === log.date);
      
      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }
      
      const encrypted = encrypt(JSON.stringify(logs));
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, encrypted);
    } catch (error) {
      console.error('Error saving daily log:', error);
    }
  },

  // User progress
  getUserProgress(): UserProgress {
    if (typeof window === 'undefined') {
      return {
        onboardingCompleted: false,
        totalJournalEntries: 0,
        currentStreak: 0,
        gardenState: {
          flowerCount: 0,
          skyBrightness: 'normal',
          hasButterfly: false
        }
      };
    }
    
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (!encrypted) {
        return {
          onboardingCompleted: false,
          totalJournalEntries: 0,
          currentStreak: 0,
          gardenState: {
            flowerCount: 0,
            skyBrightness: 'normal',
            hasButterfly: false
          }
        };
      }
      
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error reading user progress:', error);
      return {
        onboardingCompleted: false,
        totalJournalEntries: 0,
        currentStreak: 0,
        gardenState: {
          flowerCount: 0,
          skyBrightness: 'normal',
          hasButterfly: false
        }
      };
    }
  },

  saveUserProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    
    try {
      const encrypted = encrypt(JSON.stringify(progress));
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, encrypted);
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  },

  // Onboarding status
  isOnboardingCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  },

  setOnboardingCompleted(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  }
};