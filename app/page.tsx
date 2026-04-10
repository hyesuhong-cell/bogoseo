import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* 로고 & 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6">
            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-blue-900 font-bold text-sm">UD</div>
            <span className="text-white font-semibold text-sm">유디임팩트</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            AI 역량 진단 플랫폼
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
            해커톤 참가자의 AI 역량을 사전/사후 진단하고<br />
            정량적 성장 데이터를 대학에 제공합니다
          </p>
        </div>

        {/* 역할 선택 카드 */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* 관리자 */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">대학 / 운영진</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                해커톤 개설, 참가자 관리, AI 역량 성과 리포트 확인, 후속 트래킹
              </p>
              <div className="space-y-2">
                {['해커톤 운영 관리', 'KPI 대시보드', 'AI 역량 성장 리포트', '3/6개월 후속 트래킹'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                관리자로 입장
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 참가자 */}
          <Link href="/participant" className="group">
            <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-cyan-200">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-cyan-500 transition-colors">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">해커톤 참가자</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                AI 역량 사전/사후 진단 수행, 프로젝트 제출, 나의 성장 확인
              </p>
              <div className="space-y-2">
                {['AI 역량 사전 진단', '해커톤 참가 & 프로젝트 제출', 'AI 역량 사후 진단', '나의 성장 리포트 확인'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-cyan-600 font-semibold text-sm group-hover:gap-3 transition-all">
                참가자로 입장
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* 슈퍼어드민 입장 */}
        <div className="text-center mb-6">
          <Link href="/superadmin/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">
            UD임팩트 내부 관리자 →
          </Link>
        </div>

        {/* 핵심 지표 배너 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: '5개', label: 'AI 역량 진단 영역' },
            { value: '10문항', label: '사전/사후 동일 진단' },
            { value: '4가지', label: 'KPI 카테고리' },
            { value: '6개월', label: '후속 성과 트래킹' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-blue-200 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
