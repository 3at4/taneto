'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  onDismiss?: () => void; // onDismissプロップを追加（オプション）
}

export default function Toast({ message, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      // メッセージが表示されてから5秒後に非表示にし、onDismissを呼び出す
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          // アニメーションが終わるのを待ってからonDismissを呼び出す
          setTimeout(onDismiss, 500); 
        }
      }, 5000); // 5秒間表示

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, onDismiss]);

  if (!message && !isVisible) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-xl shadow-lg border border-emerald-500/30 max-w-md mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
