'use client';

import { useState } from 'react';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignUp: (email: string, pass: string) => Promise<void>;
  error: string | null;
}

export default function AuthPage({ onLogin, onSignUp, error }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin(email, password);
    } else {
      onSignUp(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {isLoginMode ? 'ログイン' : '新規登録'}
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900/50 placeholder-slate-500 text-white rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900/50 placeholder-slate-500 text-white rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500"
            >
              {isLoginMode ? 'ログイン' : '登録する'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            {isLoginMode ? 'アカウントをお持ちでないですか？ 新規登録' : 'すでにアカウントをお持ちですか？ ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
}
