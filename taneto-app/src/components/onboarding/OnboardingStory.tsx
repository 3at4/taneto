'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Heart } from 'lucide-react';

interface OnboardingStoryProps {
  onComplete: () => void;
}

const storySlides = [
  {
    title: "ある夜のこと",
    text: "彼女が何度も寝返りを打っているのに気づきました。\n月明かりが差し込む部屋で、小さなため息が聞こえました。",
    image: "🌙"
  },
  {
    title: "翌朝",
    text: "「おはよう」といつものように声をかけても、\n彼女の笑顔がいつもより少し遠くに感じられました。",
    image: "☀️"
  },
  {
    title: "コーヒーを飲みながら",
    text: "彼女は携帯で何かを調べていました。\n画面には「妊活」という文字が見えて、\n私の心もざわつき始めました。",
    image: "☕"
  },
  {
    title: "その時、気づいたのです",
    text: "彼女は一人で悩んでいたのだと。\n私たちの未来について、\n私よりもずっと深く考えていたのだと。",
    image: "💭"
  },
  {
    title: "二人の旅路",
    text: "これは一人の問題ではありません。\n二人で歩む、新しい旅路の始まりです。\n\nあなたも、この旅の大切な一歩を踏み出してみませんか？",
    image: "🌱"
  }
];

export default function OnboardingStory({ onComplete }: OnboardingStoryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const nextSlide = () => {
    if (currentSlide < storySlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = storySlides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
      <div className={`max-w-md w-full space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Progress indicator */}
        <div className="flex space-x-2 justify-center">
          {storySlides.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-8 rounded-full transition-all duration-300 ${
                index <= currentSlide ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Story content */}
        <div className="text-center space-y-6">
          <div className="text-6xl mb-6">
            {slide.image}
          </div>
          
          <h2 className="text-2xl font-light text-emerald-400 mb-4">
            {slide.title}
          </h2>
          
          <p className="text-lg leading-relaxed text-slate-300 whitespace-pre-line">
            {slide.text}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center pt-8">
          <button
            onClick={nextSlide}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-full transition-colors duration-200 text-white font-medium"
          >
            {currentSlide === storySlides.length - 1 ? (
              <>
                <Heart className="w-5 h-5" />
                <span>旅を始める</span>
              </>
            ) : (
              <>
                <span>続ける</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Skip option for testing (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center pt-4">
            <button
              onClick={onComplete}
              className="text-slate-500 hover:text-slate-400 text-sm underline"
            >
              スキップ（開発用）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}