'use client';

import { Book, Wrench, LogOut } from 'lucide-react';
import DailyQuestion from '@/components/journal/DailyQuestion';
// import { GardenState } from '@/lib/types'; // この行を削除

interface HomePageProps {
  onJournalClick: (question: string) => void;
  onCareClick: () => void;
  onHistoryClick: () => void;
  onSignOut: () => void;
  userName: string;
  hasAnsweredToday: boolean;
  hasCaredToday: boolean;
}

export default function HomePage({
  onJournalClick,
  onCareClick,
  onHistoryClick,
  onSignOut,
  userName,
  hasAnsweredToday,
  hasCaredToday
}: HomePageProps) {

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-light text-emerald-400">
              おはようございます
            </h1>
            <p className="text-slate-400">
              {userName}さん
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-slate-400 text-sm text-right">
              {(() => {
                const now = new Date();
                const month = now.getMonth() + 1;
                const day = now.getDate();
                const weekDay = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
                return `${month}月${day}日 (${weekDay})`;
              })()}
            </div>
            <button
              onClick={onSignOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
              aria-label="ログアウト"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 space-y-6">
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
      </main>
    </div>
  );
}
