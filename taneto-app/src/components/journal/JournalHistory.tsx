'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, MessageSquare, Search } from 'lucide-react';
import { JournalEntry } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onBack: () => void;
  onEntrySelect: (entry: JournalEntry) => void;
}

export default function JournalHistory({ entries, onBack, onEntrySelect }: JournalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = entries.filter(entry =>
    (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.question && entry.question.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 p-6 border-b border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
          
          <div className="flex items-center space-x-2 text-emerald-400">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">記録の振り返り</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="記録を検索..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {entries.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">まだ記録がありません</p>
            <p className="text-sm text-slate-500">
              日々の問いかけに答えて、心の庭を育ててみましょう
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">検索結果が見つかりません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date} className="space-y-3">
                {/* Date header */}
                <div className="flex items-center space-x-2 text-slate-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {(() => {
                      try {
                        const dateObj = parseISO(date);
                        const month = dateObj.getMonth() + 1;
                        const day = dateObj.getDate();
                        const weekDay = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
                        return `${month}月${day}日 (${weekDay})`;
                      } catch {
                        return '日付不明';
                      }
                    })()}
                  </span>
                </div>

                {/* Entries for this date */}
                <div className="space-y-2">
                  {dateEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => onEntrySelect(entry)}
                      className="w-full text-left bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200 group"
                    >
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 line-clamp-2">
                          {entry.question || '日々の記録'}
                        </p>
                        <p className="text-slate-200 group-hover:text-white line-clamp-3">
                          {entry.content}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-slate-500">
                            {entry.createdAt && isValid(new Date(entry.createdAt)) ? format(new Date(entry.createdAt), 'HH:mm') : ''}
                          </span>
                          <div className="text-xs text-slate-500">
                            {entry.content?.length || 0}文字
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
