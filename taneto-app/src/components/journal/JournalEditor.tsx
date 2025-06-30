'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { JournalEntry } from '@/lib/types';

interface JournalEditorProps {
  question: string;
  existingEntry?: JournalEntry;
  onBack: () => void;
  // onSaveは、ジャーナルの content 文字列のみを渡すように変更
  onSave: (content: string) => void;
  isSaving: boolean;
  aiResponse: string | null;
}

export default function JournalEditor({
  question,
  existingEntry,
  onBack,
  onSave,
  isSaving,
  aiResponse,
}: JournalEditorProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(existingEntry?.content || '');
  }, [existingEntry]);

  const handleSaveClick = () => {
    if (!content.trim() || isSaving) return;
    onSave(content.trim());
  };

  // AI応答が表示されたら、完了画面を表示
  if (aiResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-emerald-400">記録されました</h2>
            <p className="text-slate-300 leading-relaxed">{aiResponse}</p>
          </div>
          <div className="pt-4">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </button>
        <span className="text-slate-400 text-sm">{format(new Date(), 'M月d日')}</span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Question */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-300 leading-relaxed">{question}</p>
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="思ったこと、感じたことを自由に書いてください..."
            className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            maxLength={2000}
          />
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>{content.length}/2000文字</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4">
          <button
            onClick={handleSaveClick}
            disabled={!content.trim() || isSaving}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors duration-200 text-white font-medium"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>記録する</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
