'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('admin', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            UD
          </div>
          <h1 className="text-white text-xl font-bold">유디임팩트</h1>
          <p className="text-slate-400 text-sm mt-1">운영진 관리 시스템</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-slate-800 rounded-2xl p-7 border border-slate-700">
          <h2 className="text-white font-semibold text-base mb-6">관리자 로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@udimpact.kr"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-blue-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link href="/participant/login" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
            참가자로 로그인하기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
