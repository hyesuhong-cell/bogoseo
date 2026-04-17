import Link from 'next/link';

const features = [
  {
    icon: '🎯',
    title: '해커톤 통합 관리',
    desc: '행사 개설부터 팀 구성, 프로젝트 제출, 심사까지 한 플랫폼에서',
    items: ['해커톤 개설 & 트랙 설정', '참가자 초대 & 등록 관리', '팀/프로젝트 관리', '심사 점수 입력'],
    color: 'blue',
  },
  {
    icon: '🧠',
    title: 'AI 역량 진단 시스템',
    desc: '사전/사후 10문항 진단으로 5개 영역의 AI 역량 성장을 정량화',
    items: ['AI 이해도 · 도구 활용능력', '문제 해결력 · 협업 역량', '윤리적 판단력', '성장률 자동 계산'],
    color: 'violet',
  },
  {
    icon: '📊',
    title: '성과 리포트 & 분석',
    desc: '대학 실무진을 위한 정량적 성과 보고서를 자동으로 생성',
    items: ['KPI 대시보드', '참가자 역량 히트맵', '타 대학 벤치마크', 'PDF 리포트 발행'],
    color: 'emerald',
  },
];

const steps = [
  { role: '운영진', step: '1', title: '해커톤 개설', desc: '행사 정보, 트랙, 일정 설정', icon: '⚙️' },
  { role: '운영진', step: '2', title: '참가자 초대', desc: '초대 링크 발송, 등록 관리', icon: '📨' },
  { role: '참가자', step: '3', title: '사전 AI 역량 진단', desc: '5개 영역 10문항 진단 완료', icon: '📋' },
  { role: '참가자', step: '4', title: '해커톤 참가', desc: '팀 구성, 개발, 프로젝트 제출', icon: '💻' },
  { role: '참가자', step: '5', title: '사후 AI 역량 진단', desc: '동일 문항으로 성장 측정', icon: '📈' },
  { role: '운영진', step: '6', title: '성과 리포트 발행', desc: '정량 데이터 PDF 다운로드', icon: '📄' },
];

const demoAccounts = [
  {
    role: '🏫 대학 운영진 (어드민)',
    color: 'blue',
    desc: '해커톤 관리, KPI 대시보드, 성과 리포트 확인',
    path: '/admin/login',
    cta: '어드민으로 체험하기',
    accounts: [
      { label: '이메일', value: 'admin@udimpact.kr' },
      { label: '비밀번호', value: 'admin1234' },
    ],
  },
  {
    role: '🎓 해커톤 참가자',
    color: 'cyan',
    desc: 'AI 역량 진단, 성장 리포트 확인',
    path: '/participant/login',
    cta: '참가자로 체험하기',
    accounts: [
      { label: '학번', value: '2021001001' },
      { label: '비밀번호', value: 'test1234' },
    ],
  },
];

const stats = [
  { value: '5개', label: 'AI 역량 진단 영역' },
  { value: '10문항', label: '사전/사후 동일 진단' },
  { value: '실시간', label: 'KPI 대시보드' },
  { value: 'PDF', label: '리포트 자동 발행' },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── 헤더 네비 ──────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">UD</div>
            <span className="font-bold text-slate-900">AI 역량 진단 플랫폼</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold ml-1">DEMO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">어드민 로그인</Link>
            <Link href="/participant/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">참가자 로그인</Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 ─────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            유디임팩트 · AI 해커톤 운영 솔루션
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            해커톤 참가자의<br />
            <span className="text-cyan-300">AI 역량 성장</span>을 증명합니다
          </h1>
          <p className="text-blue-200 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            사전/사후 AI 역량 진단으로 학생들의 성장을 정량화하고,
            대학 실무진에게 신뢰할 수 있는 성과 데이터를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demo" className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-base hover:bg-blue-50 transition-colors shadow-lg">
              🚀 지금 데모 체험하기
            </a>
            <a href="#features" className="bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/25 transition-colors border border-white/20">
              주요 기능 살펴보기 ↓
            </a>
          </div>
        </div>

        {/* 지표 배너 */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold mb-1">{s.value}</div>
              <div className="text-blue-200 text-xs leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 플로우 ─────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">어떻게 운영되나요?</h2>
            <p className="text-slate-500">해커톤 개설부터 성과 리포트 발행까지 6단계</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-slate-200 z-0" style={{ width: 'calc(100% - 2rem)', left: '2rem' }}></div>
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-sm ${
                    s.role === '운영진' ? 'bg-blue-100' : 'bg-cyan-100'
                  }`}>
                    {s.icon}
                  </div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
                    s.role === '운영진' ? 'bg-blue-100 text-blue-700' : 'bg-cyan-100 text-cyan-700'
                  }`}>
                    {s.role}
                  </div>
                  <div className="font-bold text-slate-800 text-sm mb-1">{s.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 기능 ───────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">주요 기능</h2>
            <p className="text-slate-500">운영진과 참가자 모두를 위한 완성된 플랫폼</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className={`rounded-2xl p-7 border ${
                f.color === 'blue' ? 'bg-blue-50 border-blue-100' :
                f.color === 'violet' ? 'bg-violet-50 border-violet-100' :
                'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className={`text-lg font-bold mb-2 ${
                  f.color === 'blue' ? 'text-blue-900' :
                  f.color === 'violet' ? 'text-violet-900' :
                  'text-emerald-900'
                }`}>{f.title}</h3>
                <p className="text-slate-600 text-sm mb-5 leading-relaxed">{f.desc}</p>
                <ul className="space-y-2">
                  {f.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        f.color === 'blue' ? 'bg-blue-500' :
                        f.color === 'violet' ? 'bg-violet-500' :
                        'bg-emerald-500'
                      }`}></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 데모 체험 ───────────────────────────── */}
      <section id="demo" className="py-20 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">지금 바로 체험해보세요</h2>
            <p className="text-slate-400">아래 데모 계정으로 실제 플랫폼을 직접 사용해볼 수 있습니다</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {demoAccounts.map(acc => (
              <div key={acc.role} className={`rounded-2xl p-8 border ${
                acc.color === 'blue'
                  ? 'bg-blue-950 border-blue-800'
                  : 'bg-cyan-950 border-cyan-800'
              }`}>
                <div className="text-2xl font-bold text-white mb-1">{acc.role}</div>
                <p className={`text-sm mb-6 ${acc.color === 'blue' ? 'text-blue-300' : 'text-cyan-300'}`}>
                  {acc.desc}
                </p>

                {/* 계정 정보 */}
                <div className="bg-black/30 rounded-xl p-4 mb-6 space-y-2 font-mono">
                  {acc.accounts.map(a => (
                    <div key={a.label} className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">{a.label}</span>
                      <span className="text-white text-sm font-semibold">{a.value}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={acc.path}
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-colors ${
                    acc.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  }`}
                >
                  {acc.cta} →
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-xs mt-8">
            데모 계정은 읽기/쓰기가 모두 가능합니다. 작성된 데이터는 주기적으로 초기화됩니다.
          </p>
        </div>
      </section>

      {/* ── 대상 고객 ───────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">이런 분들에게 추천합니다</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏫', title: '대학 창업지원단', desc: '해커톤 성과를 정량적 데이터로 증명하고 싶은 담당자' },
              { icon: '🏢', title: '기업 / 기관', desc: 'AI 교육 프로그램의 효과를 측정하고 싶은 HRD 담당자' },
              { icon: '🎓', title: '교육 기관', desc: '학생들의 AI 역량 변화를 체계적으로 추적하고 싶은 교수/강사' },
            ].map(t => (
              <div key={t.title} className="bg-slate-50 rounded-2xl p-7 text-center border border-slate-100">
                <div className="text-4xl mb-4">{t.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{t.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 배너 ────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">도입 문의</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            귀 기관에 맞게 커스터마이징하여 제공합니다.<br />
            아래 버튼으로 문의주시면 빠르게 답변드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#demo"
              className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors"
            >
              🚀 데모 체험하기
            </a>
            <a
              href="mailto:contact@udimpact.kr"
              className="bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              ✉️ 도입 문의하기
            </a>
          </div>
        </div>
      </section>

      {/* ── 푸터 ────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">UD</div>
            <span className="font-semibold text-white text-sm">유디임팩트</span>
          </div>
          <div className="text-xs text-center">
            AI 역량 진단 플랫폼 · 데모 환경
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-white transition-colors">홈</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">어드민</Link>
            <Link href="/participant/login" className="hover:text-white transition-colors">참가자</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
