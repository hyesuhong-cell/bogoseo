'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParticipantLoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('participant', {
      studentId,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('학번 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/participant');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-blue-200">
            UD
          </div>
          <h1 className="text-slate-800 text-xl font-bold">AI 역량 진단 플랫폼</h1>
          <p className="text-slate-500 text-sm mt-1">해커톤 참가자 로그인</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl p-7 shadow-xl border border-slate-100">
          <h2 className="text-slate-800 font-semibold text-base mb-6">참가자 로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">학번</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                required
                placeholder="2021001001"
                className="w-full border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1.5">초기 비밀번호는 학번과 동일합니다</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <div className="text-center mt-5 space-y-2">
          <p className="text-slate-400 text-xs">
            비밀번호를 잊으셨나요?{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">운영진에게 문의</span>
          </p>
          <Link href="/admin/login" className="text-slate-400 hover:text-slate-600 text-xs transition-colors block">
            관리자로 로그인하기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
