import Link from 'next/link';

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 네비게이션 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">UD</div>
            <span className="font-semibold text-slate-800 text-sm">AI 역량 진단 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-1">
            {[
              { href: '/participant', label: '내 현황' },
              { href: '/participant/diagnosis/pre', label: '사전 진단' },
              { href: '/participant/diagnosis/post', label: '사후 진단' },
              { href: '/participant/survey', label: '만족도 설문' },
              { href: '/participant/my-result', label: '나의 성장' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
