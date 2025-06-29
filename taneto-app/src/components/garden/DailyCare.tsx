'use client';

import { useState } from 'react';
import { Bed, Dumbbell, Heart, Save, ArrowLeft } from 'lucide-react';
import { DailyLog } from '@/lib/types';
import { storageUtils } from '@/lib/storage/localStorage';
import { format } from 'date-fns';

interface DailyCareProps {
  onBack: () => void;
  onSave: (log: DailyLog) => void;
  existingLog?: DailyLog;
}

export default function DailyCare({ onBack, onSave, existingLog }: DailyCareProps) {
  const [sleepQuality, setSleepQuality] = useState<'good' | 'poor' | 'average'>(existingLog?.sleep || 'average');
  const [didExercise, setDidExercise] = useState<boolean>(existingLog?.exercise || false);
  const [stressLevel, setStressLevel] = useState<1 | 2 | 3>(existingLog?.stressLevel || 2);
  const [isSaving, setIsSaving] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleSave = async () => {
    setIsSaving(true);

    const log: DailyLog = {
      id: existingLog?.id || crypto.randomUUID(),
      date: today,
      sleep: sleepQuality,
      exercise: didExercise,
      stressLevel,
      journalCompleted: existingLog?.journalCompleted || false
    };

    try {
      storageUtils.saveDailyLog(log);
      onSave(log);
    } catch (error) {
      console.error('Failed to save daily log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const sleepOptions = [
    { value: 'good' as const, emoji: '😴', label: '良い', color: 'text-green-400' },
    { value: 'average' as const, emoji: '😐', label: 'ふつう', color: 'text-yellow-400' },
    { value: 'poor' as const, emoji: '😵', label: '悪い', color: 'text-red-400' }
  ];

  const stressLevels = [
    { value: 1 as const, emoji: '😌', label: '穏やか', color: 'text-green-400' },
    { value: 2 as const, emoji: '😐', label: 'ふつう', color: 'text-yellow-400' },
    { value: 3 as const, emoji: '😟', label: '高め', color: 'text-red-400' }
  ];

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
        
        <h1 className="text-lg font-medium text-emerald-400">
          今日の手入れ
        </h1>
        
        <span className="text-slate-400 text-sm">
          {format(new Date(), 'M月d日')}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Sleep Quality */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">睡眠の質</h3>
              <p className="text-sm text-slate-400">昨夜の睡眠はいかがでしたか？</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {sleepOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSleepQuality(option.value)}
                className={`p-4 rounded-lg border transition-colors duration-200 ${
                  sleepQuality === option.value
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">{option.emoji}</div>
                  <span className={`block text-sm font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exercise */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">運動</h3>
              <p className="text-sm text-slate-400">今日は体を動かしましたか？</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDidExercise(true)}
              className={`p-4 rounded-lg border transition-colors duration-200 ${
                didExercise
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">💪</div>
                <span className="block text-sm font-medium">運動した</span>
              </div>
            </button>
            
            <button
              onClick={() => setDidExercise(false)}
              className={`p-4 rounded-lg border transition-colors duration-200 ${
                !didExercise
                  ? 'bg-slate-600 border-slate-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">🛋️</div>
                <span className="block text-sm font-medium">休息した</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stress Level */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">ストレスレベル</h3>
              <p className="text-sm text-slate-400">今の心の状態はいかがですか？</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {stressLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setStressLevel(level.value)}
                className={`p-4 rounded-lg border transition-colors duration-200 ${
                  stressLevel === level.value
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">{level.emoji}</div>
                  <span className={`block text-sm font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
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
                <span>保存する</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}