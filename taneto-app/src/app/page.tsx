'use client';

import { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
  signIn, 
  signUp, 
  logOut,
  checkOnboardingCompleted,
  setOnboardingCompleted,
  subscribeToUserData,
  saveData,
  saveDailyLog
} from '@/lib/firebase';
import { JournalEntry, DailyLog, GardenState } from '@/lib/types';
import { format } from 'date-fns';

import AuthPage from '@/components/auth/AuthPage';
import OnboardingStory from '@/components/onboarding/OnboardingStory';
import InitialSetup from '@/components/onboarding/InitialSetup';
import HomePage from '@/components/common/HomePage';
import JournalEditor from '@/components/journal/JournalEditor';
import JournalHistory from '@/components/journal/JournalHistory';
import DailyCare from '@/components/garden/DailyCare';
import Toast from '@/components/ui/Toast';
import GardenView from '@/components/garden/GardenView';

// JournalApiResponse をインポートして型定義に利用
import { JournalApiResponse } from '@/lib/api/journalApi';

type AppState = 
  | 'loading'
  | 'auth'
  | 'onboarding-story'
  | 'onboarding-setup'
  | 'home'
  | 'journal-editor'
  | 'journal-history'
  | 'daily-care';

export default function TanetoApp() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState('あなた');

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | undefined>();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  
  const [gardenState, setGardenState] = useState<GardenState>({
    flowerCount: 0,
    skyBrightness: 'normal',
    hasButterfly: false,
  });

  // 新しいstate: activeGardenEffect を追加
  const [activeGardenEffect, setActiveGardenEffect] = useState<JournalApiResponse['gardenEffect'] | null>(null);
  
  const [aiReply, setAiReply] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserName(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'あなた');
        const isOnboardingDone = await checkOnboardingCompleted(firebaseUser.uid);
        setAppState(isOnboardingDone ? 'home' : 'onboarding-story');
      } else {
        setUser(null);
        setAppState('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserData(user.uid, (fetchedJournals, fetchedLogs) => {
        setJournals(fetchedJournals);
        setDailyLogs(fetchedLogs);

        const newGardenState: GardenState = {
          flowerCount: fetchedJournals.length,
          skyBrightness: fetchedLogs.length > 0 && fetchedLogs[0].sleep === 'good' ? 'bright' : 'normal',
          hasButterfly: fetchedLogs.length > 0 && fetchedLogs[0].exercise === true
        };
        setGardenState(newGardenState);
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  const handleSignUp = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      await signUp(email, pass);
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('An unknown error occurred.');
      }
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      await signIn(email, pass);
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('An unknown error occurred.');
      }
    }
  };
  
  const handleOnboardingStoryComplete = () => setAppState('onboarding-setup');

  const handleOnboardingSetupComplete = async (name: string) => {
    if (user) {
      setUserName(name);
      await setOnboardingCompleted(user.uid);
      setAppState('home');
    }
  };

  const handleJournalClick = (question: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = journals.find(entry => entry.date === today);
    
    setCurrentQuestion(question);
    setCurrentEntry(todayEntry);
    setAppState('journal-editor');
  };

  // handleJournalSave のシグネチャとロジックを更新
  const handleJournalSave = async (entry: JournalEntry, receivedGardenEffect: JournalApiResponse['gardenEffect']) => {
    if (!user) return;
    try {
      const aiMessage = await saveData(entry.content, user.uid);
      setAiReply(aiMessage);
      setTimeout(() => setAiReply(null), 5000);

      // receivedGardenEffect を activeGardenEffect にセット
      setActiveGardenEffect(receivedGardenEffect);
      // 一定時間後に activeGardenEffect をリセット
      setTimeout(() => setActiveGardenEffect(null), 2000); // 例: 2秒後にリセット

      setAppState('home');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setAppState('home');
    }
  };

  const handleJournalBack = () => setAppState('home');
  const handleHistoryClick = () => setAppState('journal-history');
  const handleHistoryBack = () => setAppState('home');
  const handleCareClick = () => setAppState('daily-care');
  const handleCareBack = () => setAppState('home');

  const handleHistoryEntrySelect = (entry: JournalEntry) => {
    setCurrentQuestion(entry.question);
    setCurrentEntry(entry);
    setAppState('journal-editor');
  };

  const handleCareSave = async (log: DailyLog) => {
    if(user) {
      await saveDailyLog(log, user.uid);
      setAppState('home');
    }
  };

  const hasAnsweredToday = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return journals.some(entry => entry.date === today);
  }, [journals]);

  const hasCaredToday = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dailyLogs.some(log => log.date === today);
  }, [dailyLogs]);

  const showTwoPaneLayout = user && !['auth', 'onboarding-story', 'onboarding-setup'].includes(appState);

  if (appState === 'loading') {
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
    <div className={`min-h-screen ${showTwoPaneLayout ? 'flex' : ''}`}>
      {/* Left Pane (Conditional rendering of main app states) */}
      <div className={`${showTwoPaneLayout ? 'w-full md:w-1/2' : 'w-full'}`}>
        {appState === 'auth' && (
          <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} error={authError} />
        )}
        {appState === 'onboarding-story' && (
          <OnboardingStory onComplete={handleOnboardingStoryComplete} />
        )}
        {appState === 'onboarding-setup' && (
          <InitialSetup onComplete={handleOnboardingSetupComplete} />
        )}
        {appState === 'home' && user && (
          <HomePage 
            onJournalClick={handleJournalClick}
            onCareClick={handleCareClick}
            onHistoryClick={handleHistoryClick}
            onSignOut={logOut}
            userName={userName}
            hasAnsweredToday={hasAnsweredToday}
            hasCaredToday={hasCaredToday}
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
            entries={journals}
            onBack={handleHistoryBack}
            onEntrySelect={handleHistoryEntrySelect}
          />
        )}
        {appState === 'daily-care' && (
          <DailyCare
            onBack={handleCareBack}
            onSave={handleCareSave}
            existingLog={dailyLogs.find(log => log.date === format(new Date(), 'yyyy-MM-dd'))}
          />
        )}
        <Toast message={aiReply} />
      </div>

      {/* Right Pane (Always shows GardenView when user is logged in) */}
      {showTwoPaneLayout && user && (
        <div className="hidden md:block w-1/2 bg-slate-900 overflow-y-auto">
          <GardenView 
            state={gardenState} 
            userName={userName} 
            activeEffect={activeGardenEffect} // activeGardenEffect を GardenView に渡す
          />
        </div>
      )}
    </div>
  );
}
