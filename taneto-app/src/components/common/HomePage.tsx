'use client';

import { useState, useEffect } from 'react';
import { Book, Wrench } from 'lucide-react';
import GardenView from '@/components/garden/GardenView';
import DailyQuestion from '@/components/journal/DailyQuestion';
import { storageUtils } from '@/lib/storage/localStorage';
import { GardenState } from '@/lib/types';
import { format } from 'date-fns';

interface HomePageProps {
  onJournalClick: (question: string) => void;
  onCareClick: () => void;
  onHistoryClick: () => void;
  gardenState: GardenState;
}

export default function HomePage({ onJournalClick, onCareClick, onHistoryClick, gardenState }: HomePageProps) {
  const [userName, setUserName] = useState('');
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [hasCaredToday, setHasCaredToday] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Load user name
    const savedName = localStorage.getItem('taneto_user_name') || 'あなた';
    setUserName(savedName);

    // Load journal entries and daily logs
    const entries = storageUtils.getJournalEntries();
    const logs = storageUtils.getDailyLogs();
    
    // Check if user has answered today
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = entries.find(entry => entry.date === today);
    setHasAnsweredToday(!!todayEntry);

    // Check if user has cared today
    const todayLog = logs.find(log => log.date === today);
    setHasCaredToday(!!todayLog);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="p-6 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-emerald-400">
              おはようございます
            </h1>
            <p className="text-slate-400">
              {userName}さん
            </p>
          </div>
          <div className="text-slate-400 text-sm">
            {(() => {
              const now = new Date();
              const month = now.getMonth() + 1;
              const day = now.getDate();
              const weekDay = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
              return `${month}月${day}日 (${weekDay})`;
            })()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 space-y-6">
        {/* Garden */}
        <GardenView state={gardenState} userName={userName} />

        {/* Daily Question */}
        <DailyQuestion 
          onQuestionClick={onJournalClick} 
          hasAnsweredToday={hasAnsweredToday}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCareClick}
            className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Wrench className="w-6 h-6 text-emerald-400" />
              {hasCaredToday && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              )}
            </div>
            <div className="text-left space-y-1">
              <h3 className="font-medium text-slate-200">手入れをする</h3>
              <p className="text-xs text-slate-400">
                {hasCaredToday ? '今日の記録を見る' : '睡眠・運動・ストレス'}
              </p>
            </div>
          </button>

          <button
            onClick={onHistoryClick}
            className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Book className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="font-medium text-slate-200">記録を見る</h3>
              <p className="text-xs text-slate-400">
                過去の振り返り
              </p>
            </div>
          </button>
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}