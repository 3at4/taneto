'use client';

import { useState, useEffect } from 'react';
import OnboardingStory from '@/components/onboarding/OnboardingStory';
import InitialSetup from '@/components/onboarding/InitialSetup';
import HomePage from '@/components/common/HomePage';
import JournalEditor from '@/components/journal/JournalEditor';
import JournalHistory from '@/components/journal/JournalHistory';
import DailyCare from '@/components/garden/DailyCare';
import Toast from '@/components/ui/Toast';
import { storageUtils } from '@/lib/storage/localStorage';
import { subscribeToUserData, saveData } from '@/lib/firestore';
import { JournalEntry, DailyLog, GardenState } from '@/lib/types';
import { format } from 'date-fns';

type AppState = 
  | 'onboarding-story'
  | 'onboarding-setup'
  | 'home'
  | 'journal-editor'
  | 'journal-history'
  | 'daily-care';

export default function TanetoApp() {
  const [appState, setAppState] = useState<AppState>('onboarding-story');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for garden visualization
  const [gardenState, setGardenState] = useState<GardenState>({
    flowerCount: 0,
    skyBrightness: 'normal',
    hasButterfly: false,
  });
  
  // New state for AI feedback
  const [aiReply, setAiReply] = useState<string | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Real-time data subscription
  useEffect(() => {
    if (appState === 'home' || appState === 'journal-editor' || appState === 'daily-care') {
      const unsubscribe = subscribeToUserData('default-user', (journals, tendingLogs) => {
        // Calculate new garden state based on fetched data
        const newGardenState: GardenState = {
          flowerCount: journals.length,
          skyBrightness: tendingLogs.length > 0 && tendingLogs[0].sleep === 'good' ? 'bright' : 'normal',
          hasButterfly: tendingLogs.length > 0 && tendingLogs[0].exercise === true
        };
        
        setGardenState(newGardenState);
      });

      // Cleanup function to unsubscribe when component unmounts or state changes
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [appState]);

  const checkOnboardingStatus = () => {
    if (typeof window !== 'undefined') {
      const isCompleted = storageUtils.isOnboardingCompleted();
      if (isCompleted) {
        setAppState('home');
      }
    }
    setIsLoading(false);
  };

  const handleOnboardingStoryComplete = () => {
    setAppState('onboarding-setup');
  };

  const handleOnboardingSetupComplete = () => {
    storageUtils.setOnboardingCompleted();
    setAppState('home');
  };

  const handleJournalClick = (question: string) => {
    // Check if there's already an entry for today
    const today = format(new Date(), 'yyyy-MM-dd');
    const entries = storageUtils.getJournalEntries();
    const todayEntry = entries.find(entry => entry.date === today);
    
    setCurrentQuestion(question);
    setCurrentEntry(todayEntry);
    setAppState('journal-editor');
  };

  const handleJournalSave = async (entry: JournalEntry) => {
    try {
      // Save data and get AI response
      const aiMessage = await saveData(entry.content);
      
      // Set AI reply and clear it after 5 seconds
      setAiReply(aiMessage);
      setTimeout(() => {
        setAiReply(null);
      }, 5000);
      
      // Also save to local storage for backward compatibility
      storageUtils.saveJournalEntry(entry);
      
      setAppState('home');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // Fallback to local storage only
      storageUtils.saveJournalEntry(entry);
      setAppState('home');
    }
  };

  const handleJournalBack = () => {
    setAppState('home');
  };

  const handleHistoryClick = () => {
    setAppState('journal-history');
  };

  const handleHistoryBack = () => {
    setAppState('home');
  };

  const handleHistoryEntrySelect = (entry: JournalEntry) => {
    setCurrentQuestion(entry.question);
    setCurrentEntry(entry);
    setAppState('journal-editor');
  };

  const handleCareClick = () => {
    setAppState('daily-care');
  };

  const handleCareBack = () => {
    setAppState('home');
  };

  const handleCareSave = (log: DailyLog) => {
    // Save to local storage for backward compatibility
    storageUtils.saveDailyLog(log);
    setAppState('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {appState === 'onboarding-story' && (
        <OnboardingStory onComplete={handleOnboardingStoryComplete} />
      )}
      
      {appState === 'onboarding-setup' && (
        <InitialSetup onComplete={handleOnboardingSetupComplete} />
      )}
      
      {appState === 'home' && (
        <HomePage 
          onJournalClick={handleJournalClick}
          onCareClick={handleCareClick}
          onHistoryClick={handleHistoryClick}
          gardenState={gardenState}
        />
      )}
      
      {appState === 'journal-editor' && (
        <JournalEditor
          question={currentQuestion}
          existingEntry={currentEntry}
          onBack={handleJournalBack}
          onSave={handleJournalSave}
        />
      )}
      
      {appState === 'journal-history' && (
        <JournalHistory
          onBack={handleHistoryBack}
          onEntrySelect={handleHistoryEntrySelect}
        />
      )}
      
      {appState === 'daily-care' && (
        <DailyCare
          onBack={handleCareBack}
          onSave={handleCareSave}
          existingLog={(() => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const logs = storageUtils.getDailyLogs();
            return logs.find(log => log.date === today);
          })()}
        />
      )}
      
      {/* AI Feedback Toast */}
      <Toast message={aiReply} />
    </div>
  );
}
