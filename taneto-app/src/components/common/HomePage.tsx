'use client';

import { History, Droplets, LogOut } from 'lucide-react'; // アイコンを変更: Book, Wrench -> History, Droplets
import DailyQuestion from '@/components/journal/DailyQuestion';

interface HomePageProps {
  onJournalClick: (question: string) => void;
  onCareClick: () => void;
  onHistoryClick: () => void;
  onSignOut: () => void;
  userName: string;
  hasAnsweredToday: boolean;
  hasCaredToday: boolean;
}

const ActionButton = ({ icon: Icon, title, subtitle, onClick, hasCompleted, colorClass }) => (
  <button
    onClick={onClick}
    className="bg-slate-800/50 hover:bg-slate-800 rounded-lg p-4 group border-2 border-slate-700 hover:border-emerald-700/50 transition-all duration-300 flex items-center space-x-4 transform hover:scale-[1.02]"
  >
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <div className="text-left">
      <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{subtitle}</p>
    </div>
    {hasCompleted && (
      <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full self-start mt-1"></div>
    )}
  </button>
);

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
              おはようございます、{userName}さん
            </h1>
            <p className="text-slate-400">
              {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            aria-label="ログアウト"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-2 space-y-8">
        {/* Daily Question */}
        <DailyQuestion
          onQuestionClick={onJournalClick}
          hasAnsweredToday={hasAnsweredToday}
        />

        {/* Quick Actions */}
        <div className="space-y-4">
          <ActionButton
            icon={Droplets}
            title="手入れをする"
            subtitle={hasCaredToday ? '今日の記録は完了しました' : '睡眠・運動・ストレスの記録'}
            onClick={onCareClick}
            hasCompleted={hasCaredToday}
            colorClass="text-blue-400"
          />
          <ActionButton
            icon={History}
            title="記録を見る"
            subtitle="過去のジャーナルを振り返る"
            onClick={onHistoryClick}
            hasCompleted={false} // History button doesn't have a 'completed' state in this context
            colorClass="text-purple-400"
          />
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-12"></div>
      </main>
    </div>
  );
}
