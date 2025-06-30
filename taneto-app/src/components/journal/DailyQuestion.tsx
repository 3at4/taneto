'use client';

import { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react'; // CalendarとMessageCircleは削除
import { DAILY_QUESTIONS } from '@/lib/constants/questions';

interface DailyQuestionProps {
  onQuestionClick: (question: string) => void;
  hasAnsweredToday: boolean;
}

export default function DailyQuestion({ onQuestionClick, hasAnsweredToday }: DailyQuestionProps) {
  const [todaysQuestion, setTodaysQuestion] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const questionIndex = dayOfYear % DAILY_QUESTIONS.length;
    setTodaysQuestion(DAILY_QUESTIONS[questionIndex]);
  }, []);

  return (
    <div 
      onClick={() => onQuestionClick(todaysQuestion)}
      // 石板風のデザインに変更
      className="bg-slate-800/50 rounded-lg p-6 group cursor-pointer border-2 border-slate-700 hover:border-emerald-700/50 transition-all duration-300 transform hover:scale-[1.02]"
    >
      <div className="flex flex-col h-full">
        {/* "今日の問いかけ"のタイトルをより控えめに */}
        <div className="text-xs text-slate-500 group-hover:text-emerald-600 transition-colors duration-300 mb-4">
          今日の問いかけ
        </div>

        {/* 問いかけのテキスト */}
        <p className="flex-grow text-slate-300 leading-relaxed text-lg group-hover:text-white transition-colors duration-300">
          {todaysQuestion}
        </p>
        
        {/* アクションのヒント */}
        <div className="flex items-center justify-end mt-4 text-slate-500 group-hover:text-emerald-500 transition-colors duration-300">
          {hasAnsweredToday && (
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
          )}
          <span className="text-sm">
            {hasAnsweredToday ? '記録済み' : 'タップして記録する'}
          </span>
          <Edit3 className="w-4 h-4 ml-2" />
        </div>
      </div>
    </div>
  );
}
