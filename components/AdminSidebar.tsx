'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  {
    href: '/admin',
    label: '대시보드',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/hackathons',
    label: '해커톤 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6H21M8 12H21M8 18H21M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-60 bg-slate-900 min-h-screen flex flex-col">
      {/* 로고 */}
      <div className="p-5 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">UD</div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">유디임팩트</div>
            <div className="text-slate-400 text-xs">운영진 관리</div>
          </div>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        {/* 로그인 계정 정보 */}
        {session?.user && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
              {session.user.name?.[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{session.user.name}</div>
              <div className="text-slate-500 text-[10px] truncate">
                {(session.user as { university?: string }).university ?? session.user.email}
              </div>
            </div>
          </div>
        )}
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          홈으로
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors w-full"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
