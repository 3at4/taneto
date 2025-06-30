'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, Flower, TreePine, Bug, Droplet, Sparkles } from 'lucide-react'; // DropletとSparklesを追加
import { GardenState } from '@/lib/types';
import { JournalApiResponse } from '@/lib/api/journalApi'; // JournalApiResponseをインポート

interface GardenViewProps {
  state: GardenState;
  userName?: string;
  activeEffect?: JournalApiResponse['gardenEffect'] | null; // activeEffectを追加
}

export default function GardenView({ state, userName = 'あなた', activeEffect }: GardenViewProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  // activeEffectに応じた一時的なアニメーション表示用のstate
  const [showBloomEffect, setShowBloomEffect] = useState(false);
  const [showButterflyEffect, setShowButterflyEffect] = useState(false);
  const [showSunshineEffect, setShowSunshineEffect] = useState(false);
  const [showRainEffect, setShowRainEffect] = useState(false);
  const [showCalmEffect, setShowCalmEffect] = useState(false);

  // 既存のstate変化に伴うアニメーション
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [state]);

  // activeEffectプロップの変化を監視し、対応するアニメーションをトリガー
  useEffect(() => {
    if (activeEffect) {
      // すべてのエフェクトを一度リセットし、新しいエフェクトのみを有効にする
      setShowBloomEffect(false);
      setShowButterflyEffect(false);
      setShowSunshineEffect(false);
      setShowRainEffect(false);
      setShowCalmEffect(false);

      switch (activeEffect) {
        case 'bloom':
          setShowBloomEffect(true);
          break;
        case 'butterfly':
          setShowButterflyEffect(true);
          break;
        case 'sunshine':
          setShowSunshineEffect(true);
          break;
        case 'rain':
          setShowRainEffect(true);
          break;
        case 'calm':
          setShowCalmEffect(true);
          break;
        default:
          break;
      }

      // アニメーション終了後にエフェクトを自動的にオフにする
      // page.tsx側でactiveGardenEffectをnullに戻すロジックがあるため、ここではアニメーション表示期間のみを制御
      const effectTimer = setTimeout(() => {
        setShowBloomEffect(false);
        setShowButterflyEffect(false);
        setShowSunshineEffect(false);
        setShowRainEffect(false);
        setShowCalmEffect(false);
      }, 3000); // 最長のアニメーション duration に合わせる (butterfly-flyが3s)

      return () => clearTimeout(effectTimer);
    }
  }, [activeEffect]); // activeEffect が変更されるたびに実行

  const getGardenDescription = (gardenState: GardenState): string => {
    if (gardenState.flowerCount === 0) {
      return '静かな庭で、新しい始まりを待っています';
    } else if (gardenState.flowerCount <= 3) {
      return '小さな花が咲き始めました';
    } else if (gardenState.flowerCount <= 7) {
      return '庭に美しい花が咲いています';
    } else {
      return '豊かな花園が広がっています';
    }
  };

  // Determine background brightness based on skyBrightness
  const skyClass = state.skyBrightness === 'bright' 
    ? 'from-blue-400/30 to-green-400/30' 
    : 'from-blue-900/20 to-green-900/20';

  const WeatherIcon = () => {
    const iconProps = {
      className: `w-12 h-12 transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'}`,
      color: state.skyBrightness === 'bright' ? '#fbbf24' : '#9ca3af'
    };

    return state.skyBrightness === 'bright' ? <Sun {...iconProps} /> : <Cloud {...iconProps} />;
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 space-y-6 border border-slate-700">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-medium text-emerald-400">
          {userName}さんの庭
        </h2>
        <p className="text-sm text-slate-400">
          {getGardenDescription(state)}
        </p>
      </div>

      {/* Garden visualization */}
      <div className={`relative h-48 bg-gradient-to-b ${skyClass} rounded-lg overflow-hidden border border-slate-700`}>
        {/* Sky/Weather */}
        <div className="absolute top-4 right-4 z-10">
          <WeatherIcon />
        </div>

        {/* Dynamic Effects based on activeEffect */}
        {showBloomEffect && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bloom-pulse">
            <Flower className="w-8 h-8 text-emerald-300" />
          </div>
        )}
        {showButterflyEffect && (
          <div className="absolute top-1/2 left-0 z-20 animate-butterfly-fly">
            <Bug className="w-8 h-8 text-purple-300" />
          </div>
        )}
        {showSunshineEffect && (
          <div className="absolute inset-0 flex items-center justify-center z-10 animate-sunshine-glow opacity-0">
            <Sun className="w-24 h-24 text-yellow-300 opacity-50" />
          </div>
        )}
        {showRainEffect && (
          <div className="absolute inset-0 flex items-end justify-center z-10 animate-rain-drop opacity-0">
            {/* Simple representation for rain */} {/* 雨の表現を修正 */} 
            <Droplet className="w-12 h-12 text-blue-300 opacity-70" />
          </div>
        )}
        {showCalmEffect && (
          <div className="absolute inset-0 flex items-center justify-center z-10 animate-calm-ripple opacity-0">
            <Sparkles className="w-24 h-24 text-blue-200 opacity-40" />
          </div>
        )}

        {/* Butterfly (persistent, based on state.hasButterfly) - only show if no active effect */} 
        {state.hasButterfly && !showButterflyEffect && (
          <div className="absolute top-8 left-1/3 z-10 animate-bounce">
            <Bug className="w-6 h-6 text-yellow-300" />
          </div>
        )}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-900/40 to-transparent"></div>

        {/* Tree */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <TreePine 
            className={`w-16 h-16 transition-all duration-1000 ${isAnimating ? 'scale-105' : 'scale-100'}`}
            color={state.flowerCount > 0 ? '#22c55e' : '#6b7280'}
          />
        </div>

        {/* Flowers (persistent, based on state.flowerCount) */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
          {Array.from({ length: Math.min(state.flowerCount, 5) }, (_, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Flower 
                className="w-4 h-4 text-pink-400" 
                style={{ 
                  transform: `rotate(${i * 30}deg)`,
                  marginLeft: `${(i - 2) * 20}px` 
                }}
              />
            </div>
          ))}
        </div>

        {/* Additional flowers if more than 5 */}
        {state.flowerCount > 5 && (
          <div className="absolute bottom-8 right-4">
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(state.flowerCount - 5, 3) }, (_, i) => (
                <Flower 
                  key={i + 5}
                  className="w-3 h-3 text-purple-400" 
                />
              ))}
              {state.flowerCount > 8 && (
                <span className="text-xs text-slate-400 ml-1">
                  +{state.flowerCount - 8}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Garden stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-2xl">
            {state.skyBrightness === 'bright' ? '☀️' : '☁️'}
          </div>
          <p className="text-xs text-slate-400">空の明るさ</p>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl">{state.flowerCount}</div>
          <p className="text-xs text-slate-400">咲いた花</p>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl">
            {state.hasButterfly ? '🦋' : '🌿'}
          </div>
          <p className="text-xs text-slate-400">蝶の訪問</p>
        </div>
      </div>
    </div>
  );
}