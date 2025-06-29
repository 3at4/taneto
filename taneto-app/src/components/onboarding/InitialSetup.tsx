'use client';

import { useState } from 'react';
import { Sprout, ArrowRight } from 'lucide-react';

interface InitialSetupProps {
  onComplete: () => void;
}

export default function InitialSetup({ onComplete }: InitialSetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      // Save user preferences to local storage
      localStorage.setItem('taneto_user_name', name);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-light text-emerald-400">
            タネト
          </h1>
          <p className="text-slate-300 text-sm">
            種と、人。そして未来へ。
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-medium">
                まずは、お名前を教えてください
              </h2>
              <p className="text-slate-400 text-sm">
                あなただけの庭を準備します
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="お名前またはニックネーム"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                maxLength={20}
              />
              
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors duration-200 text-white font-medium"
              >
                <span>次へ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-medium">
                {name}さん、ようこそ
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                ここは、あなただけの特別な場所です。<br />
                日々の「問いかけ」に答えながら、<br />
                心の庭を一緒に育てていきましょう。
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
              <h3 className="text-emerald-400 font-medium">
                プライバシーについて
              </h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>あなたの記録は全てこの端末内に安全に保存されます</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>外部サーバーには一切送信されません</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>あなただけの安全な空間です</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg transition-colors duration-200 text-white font-medium"
            >
              <Sprout className="w-5 h-5" />
              <span>庭づくりを始める</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}