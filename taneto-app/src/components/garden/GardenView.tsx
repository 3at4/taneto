'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, Flower, TreePine, Bug } from 'lucide-react';
import { GardenState } from '@/lib/types';

interface GardenViewProps {
  state: GardenState;
  userName?: string;
}

export default function GardenView({ state, userName = 'あなた' }: GardenViewProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [state]);

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

        {/* Butterfly */}
        {state.hasButterfly && (
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

        {/* Flowers */}
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