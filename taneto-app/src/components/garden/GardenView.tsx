'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // lucide-react の代わりにNext.jsのImageコンポーネントをインポート
import { GardenState } from '@/lib/types';
import { JournalApiResponse } from '@/lib/api/journalApi';

interface GardenViewProps {
  state: GardenState;
  userName?: string;
  activeEffect?: JournalApiResponse['gardenEffect'] | null;
}

// 新しいアセットを使ったGardenEffectコンポーネント
const GardenEffect = ({ effect }: { effect: JournalApiResponse['gardenEffect'] | null }) => {
  if (!effect) return null;

  const effects = {
    bloom: { src: '/garden/flower-01.svg', className: 'animate-bloom-pulse w-16 h-16' },
    butterfly: { src: '/garden/butterfly-01.svg', className: 'animate-butterfly-fly w-20 h-20' },
    sunshine: { src: '/garden/sun-day.svg', className: 'animate-sunshine-glow w-32 h-32 opacity-50' },
    rain: { src: '/garden/cloud-day.svg', className: 'animate-rain-drop w-24 h-24 opacity-70' }, // 雨は雲のアセットを流用
    calm: { src: '/garden/tree-base.svg', className: 'animate-calm-ripple w-16 h-16 opacity-30' }, // 穏やかは木のアセットを流用
  };

  const effectConfig = effects[effect];

  return (
    <div className={`absolute inset-0 flex items-center justify-center z-20`}>
      <Image
        src={effectConfig.src}
        alt={`${effect} effect`}
        width={128}
        height={128}
        className={effectConfig.className}
        unoptimized // SVGアニメーションのために最適化を無効化
      />
    </div>
  );
};


export default function GardenView({ state, userName = 'あなた', activeEffect }: GardenViewProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [state]);

  const getGardenDescription = (gardenState: GardenState): string => {
    if (gardenState.flowerCount === 0) return '静かな庭で、新しい始まりを待っています';
    if (gardenState.flowerCount <= 3) return '小さな花が咲き始めました';
    if (gardenState.flowerCount <= 7) return '庭に美しい花が咲いています';
    return '豊かな花園が広がっています';
  };
  
  const skyClass = state.skyBrightness === 'bright'
    ? 'from-blue-400/30 to-green-400/30'
    : 'from-slate-800/50 to-slate-900/50';

  const flowerAssets = ['/garden/flower-01.svg', '/garden/flower-02.svg', '/garden/flower-03.svg'];

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl font-medium text-emerald-400">
          {userName}さんの庭
        </h2>
        <p className="text-sm text-slate-400">
          {getGardenDescription(state)}
        </p>
      </div>

      {/* Garden visualization */}
      <div className={`relative flex-grow bg-gradient-to-b ${skyClass} rounded-lg overflow-hidden border border-slate-700`}>
        <GardenEffect effect={activeEffect} />
        
        {/* Sky Object (Sun or Cloud) */}
        <div className="absolute top-4 right-4 z-10">
          <Image
            src={state.skyBrightness === 'bright' ? '/garden/sun-day.svg' : '/garden/cloud-day.svg'}
            alt={state.skyBrightness === 'bright' ? 'Sun' : 'Cloud'}
            width={100}
            height={100}
            className={`transition-all duration-1000 ${isAnimating ? 'scale-110' : 'scale-100'}`}
          />
        </div>

        {/* Butterfly (persistent) */}
        {state.hasButterfly && (
          <div className="absolute top-12 left-1/4 z-10 animate-bounce">
            <Image
              src="/garden/butterfly-01.svg"
              alt="Butterfly"
              width={64}
              height={64}
            />
          </div>
        )}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-900/40 to-transparent"></div>

        {/* Tree */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <Image
            src="/garden/tree-base.svg"
            alt="Tree"
            width={150}
            height={200}
            className={`transition-all duration-1000 ${isAnimating ? 'scale-105' : 'scale-100'}`}
          />
        </div>

        {/* Flowers */}
        <div className="absolute bottom-4 left-0 right-0 h-16 z-10">
          {Array.from({ length: state.flowerCount }).map((_, i) => (
            <div
              key={i}
              className={`absolute bottom-0 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}
              style={{
                left: `${10 + (i * 15) % 80}%`, // 散りばめる
                bottom: `${Math.floor(i / 5) * 10}px`, // 複数行に配置
                animationDelay: `${i * 100}ms`,
                transform: `rotate(${(i * 45)}deg) scale(0.8)`,
              }}
            >
              <Image
                src={flowerAssets[i % flowerAssets.length]}
                alt={`Flower ${i + 1}`}
                width={40}
                height={40}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
