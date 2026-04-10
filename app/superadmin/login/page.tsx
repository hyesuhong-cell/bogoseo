'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('superadmin', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/superadmin');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">UD임팩트 관리자</h1>
          <p className="text-purple-300 text-sm mt-1">슈퍼어드민 전용 포털</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="superadmin@udimpact.kr"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          UD임팩트 내부 전용 시스템 · 허가된 인원만 접근 가능
        </p>
      </div>
    </div>
  );
}
