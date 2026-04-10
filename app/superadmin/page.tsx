'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* 헤더 */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-lg">
            🛡️
          </div>
          <div>
            <div className="text-white font-bold text-sm">UD임팩트 관리자 포털</div>
            <div className="text-purple-400 text-xs">슈퍼어드민 대시보드</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-purple-300 text-sm">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/superadmin/login' })}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">대시보드</h1>
        <p className="text-purple-300 mb-10">UD임팩트 플랫폼 전체를 관리합니다.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 어드민 계정 관리 */}
          <Link href="/superadmin/accounts" className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-7 transition-all">
            <div className="text-3xl mb-4">👤</div>
            <h2 className="text-white font-bold text-lg mb-2">어드민 계정 관리</h2>
            <p className="text-purple-300 text-sm">대학 담당자 계정을 생성하고 관리합니다.</p>
            <div className="mt-5 text-purple-400 group-hover:text-purple-200 text-sm font-medium transition-colors">
              관리하기 →
            </div>
          </Link>

          {/* 해커톤 전체 현황 */}
          <Link href="/admin" className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-7 transition-all">
            <div className="text-3xl mb-4">🏆</div>
            <h2 className="text-white font-bold text-lg mb-2">해커톤 현황</h2>
            <p className="text-purple-300 text-sm">전체 해커톤 및 참가자 현황을 확인합니다.</p>
            <div className="mt-5 text-purple-400 group-hover:text-purple-200 text-sm font-medium transition-colors">
              바로가기 →
            </div>
          </Link>

          {/* 시스템 정보 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-7 md:col-span-2">
            <div className="text-3xl mb-4">⚙️</div>
            <h2 className="text-white font-bold text-lg mb-4">시스템 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '환경', value: process.env.NODE_ENV === 'production' ? '운영' : '개발', color: 'text-emerald-400' },
                { label: 'DB', value: 'In-Memory (MVP)', color: 'text-amber-400' },
                { label: '인증', value: 'NextAuth v5', color: 'text-blue-400' },
                { label: '배포', value: 'Vercel', color: 'text-purple-400' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4">
                  <div className="text-white/40 text-xs mb-1">{item.label}</div>
                  <div className={`font-semibold text-sm ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
