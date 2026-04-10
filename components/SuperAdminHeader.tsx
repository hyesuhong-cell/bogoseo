'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function SuperAdminHeader({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-lg">
          🛡️
        </div>
        <div>
          <div className="text-white font-bold text-sm">UD임팩트 관리자 포털</div>
          <div className="text-purple-400 text-xs">{title}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/superadmin" className="text-purple-400 hover:text-white text-sm transition-colors">
          ← 대시보드
        </Link>
        <span className="text-purple-300 text-sm">{session?.user?.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/superadmin/login' })}
          className="text-white/50 hover:text-white text-sm transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
