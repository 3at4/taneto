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
  saveDailyLog,
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

import { submitJournal, JournalApiResponse } from '@/lib/api/journalApi';

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
  const [isSaving, setIsSaving] = useState(false);
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
          hasButterfly: fetchedLogs.length > 0 && fetchedLogs[0].exercise === true,
        };
        setGardenState(newGardenState);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSignUp = (email: string, pass: string) => signUp(email, pass).catch(e => setAuthError(e.message));
  const handleLogin = (email: string, pass:string) => signIn(email, pass).catch(e => setAuthError(e.message));
  const handleOnboardingStoryComplete = () => setAppState('onboarding-setup');

  const handleOnboardingSetupComplete = async (name: string) => {
    if (user) {
      await setOnboardingCompleted(user.uid);
      setUserName(name);
      setAppState('home');
    }
  };

  const handleJournalClick = (question: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = journals.find((entry) => entry.date === today);
    setCurrentQuestion(question);
    setCurrentEntry(todayEntry);
    setAppState('journal-editor');
  };

  const handleJournalSave = async (content: string) => {
    setIsSaving(true);
    try {
      const response = await submitJournal(currentQuestion, content);
      setAiReply(response.aiResponseText);
      setActiveGardenEffect(response.gardenEffect);
      setTimeout(() => setActiveGardenEffect(null), 3000); // Effect duration
    } catch (error) {
      console.error('Error submitting journal:', error);
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました。';
      setAiReply(`エラー: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleJournalBack = () => {
    setAiReply(null);
    setAppState('home');
  };

  const handleHistoryClick = () => setAppState('journal-history');
  const handleHistoryBack = () => setAppState('home');
  const handleCareClick = () => setAppState('daily-care');
  const handleCareBack = () => setAppState('home');

  const handleCareSave = async (log: Omit<DailyLog, 'id'>) => {
    if (user) {
      await saveDailyLog(log, user.uid);
      setAppState('home');
    }
  };

  const handleHistoryEntrySelect = (entry: JournalEntry) => {
    setCurrentQuestion(entry.question);
    setCurrentEntry(entry);
    setAppState('journal-editor');
  };

  const hasAnsweredToday = useMemo(() => journals.some(j => j.date === format(new Date(), 'yyyy-MM-dd')), [journals]);
  const hasCaredToday = useMemo(() => dailyLogs.some(l => l.date === format(new Date(), 'yyyy-MM-dd')), [dailyLogs]);

  const showTwoPaneLayout = user && !['auth', 'onboarding-story', 'onboarding-setup', 'loading'].includes(appState);

  const renderContent = () => {
    switch (appState) {
      case 'auth':
        return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} error={authError} />;
      case 'onboarding-story':
        return <OnboardingStory onComplete={handleOnboardingStoryComplete} />;
      case 'onboarding-setup':
        return <InitialSetup onComplete={handleOnboardingSetupComplete} />;
      case 'home':
        return <HomePage 
            onJournalClick={handleJournalClick}
            onCareClick={handleCareClick}
            onHistoryClick={handleHistoryClick}
            onSignOut={logOut}
            userName={userName}
            hasAnsweredToday={hasAnsweredToday}
            hasCaredToday={hasCaredToday}
        />;
      case 'journal-editor':
        return <JournalEditor
            question={currentQuestion}
            existingEntry={currentEntry}
            onBack={handleJournalBack}
            onSave={handleJournalSave}
            isSaving={isSaving}
            aiResponse={aiReply}
        />;
      case 'journal-history':
        return <JournalHistory
            entries={journals}
            onBack={handleHistoryBack}
            onEntrySelect={handleHistoryEntrySelect}
        />;
      case 'daily-care':
        return <DailyCare
            onBack={handleCareBack}
            onSave={handleCareSave}
            existingLog={dailyLogs.find(log => log.date === format(new Date(), 'yyyy-MM-dd'))}
        />;
      case 'loading':
      default:
        return (
          <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400">読み込み中...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${showTwoPaneLayout ? 'flex' : ''}`}>
      <div className={`${showTwoPaneLayout ? 'w-full md:w-1/2' : 'w-full'} flex flex-col`}>
        <div className="flex-grow">
          {renderContent()}
        </div>
        <Toast message={aiReply} onDismiss={() => setAiReply(null)} />
      </div>
      {showTwoPaneLayout && (
        <div className="hidden md:block w-1/2 bg-slate-900 overflow-y-auto">
          <GardenView state={gardenState} userName={userName} activeEffect={activeGardenEffect} />
        </div>
      )}
    </div>
  );
}
