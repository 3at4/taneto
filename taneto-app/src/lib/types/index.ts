// Core types for Taneto app
export interface JournalEntry {
  id: string;
  date: string;
  question: string;
  content: string;
  createdAt: Date;
}

// Updated GardenState interface to match requirements
export interface GardenState {
  flowerCount: number;
  skyBrightness: 'normal' | 'bright';
  hasButterfly: boolean;
}

export interface DailyLog {
  id: string;
  date: string;
  sleep: 'good' | 'poor' | 'average'; // Changed to match sleep quality
  exercise?: boolean; // Made optional as mentioned in requirements
  stressLevel: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  journalCompleted: boolean;
}

// Keep TendingLog as alias for backward compatibility
export type TendingLog = DailyLog;

export interface UserProgress {
  onboardingCompleted: boolean;
  totalJournalEntries: number;
  currentStreak: number;
  gardenState: GardenState;
}