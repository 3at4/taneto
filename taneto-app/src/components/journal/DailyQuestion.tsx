'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Edit3, Calendar } from 'lucide-react';
import { DAILY_QUESTIONS } from '@/lib/constants/questions';
import { format } from 'date-fns';

interface DailyQuestionProps {
  onQuestionClick: (question: string) => void;
  hasAnsweredToday: boolean;
}

export default function DailyQuestion({ onQuestionClick, hasAnsweredToday }: DailyQuestionProps) {
  const [todaysQuestion, setTodaysQuestion] = useState('');

  useEffect(() => {
    // Generate today's question based on date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const questionIndex = dayOfYear % DAILY_QUESTIONS.length;
    setTodaysQuestion(DAILY_QUESTIONS[questionIndex]);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 space-y-4 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">今日の問いかけ</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(), 'M月d日')}</span>
        </div>
      </div>

      {/* Question */}
      <div 
        onClick={() => onQuestionClick(todaysQuestion)}
        className="cursor-pointer group"
      >
        <p className="text-slate-200 leading-relaxed group-hover:text-white transition-colors duration-200">
          {todaysQuestion}
        </p>
        
        {/* Action hint */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-slate-400 group-hover:text-emerald-400 transition-colors duration-200">
            <Edit3 className="w-4 h-4" />
            <span className="text-sm">
              {hasAnsweredToday ? '今日の記録を見る' : 'タップして答える'}
            </span>
          </div>
          
          {hasAnsweredToday && (
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}