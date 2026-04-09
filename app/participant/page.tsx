import Link from 'next/link';

export default function ParticipantHome() {
  const steps = [
    { step: 1, title: 'AI 역량 사전 진단', desc: '해커톤 참가 전 현재 AI 역량을 진단합니다', href: '/participant/diagnosis/pre', status: 'completed', color: 'bg-emerald-500', icon: '✅' },
    { step: 2, title: '해커톤 참가', desc: '팀을 구성하고 AI 솔루션을 개발합니다', href: '#', status: 'completed', color: 'bg-emerald-500', icon: '✅' },
    { step: 3, title: 'AI 역량 사후 진단', desc: '해커톤 종료 후 성장한 역량을 다시 진단합니다', href: '/participant/diagnosis/post', status: 'active', color: 'bg-blue-500', icon: '📊' },
    { step: 4, title: '만족도 설문', desc: '행사 경험에 대한 피드백을 남겨주세요', href: '/participant/survey', status: 'pending', color: 'bg-slate-300', icon: '📝' },
    { step: 5, title: '나의 성장 확인', desc: '사전/사후 AI 역량 성장 리포트를 확인합니다', href: '/participant/my-result', status: 'pending', color: 'bg-slate-300', icon: '📈' },
  ];

  return (
    <div className="fade-in">
      {/* 참가자 프로필 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-7 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">김</div>
          <div>
            <div className="text-lg font-bold">김민준</div>
            <div className="text-blue-200 text-sm">컴퓨터공학과 3학년 · 2021001001</div>
            <div className="text-blue-300 text-xs mt-0.5">AI 기반 사회문제 해결 해커톤 2025 | 팀 아이케어</div>
          </div>
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">나의 참여 여정</h2>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.step} className={`bg-white rounded-xl p-5 shadow-sm border ${step.status === 'active' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  step.status === 'completed' ? 'bg-emerald-500' :
                  step.status === 'active' ? 'bg-blue-600' : 'bg-slate-200'
                }`}>{step.step}</div>
                <div className="flex-1">
                  <div className={`font-semibold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{step.title}</div>
                  <div className="text-sm text-slate-400">{step.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{step.icon}</span>
                  {step.status === 'active' && (
                    <Link href={step.href} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      지금 하기 →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 접근 */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/participant/diagnosis/post" className="bg-blue-600 text-white rounded-xl p-5 hover:bg-blue-700 transition-colors">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold">사후 AI 역량 진단</div>
          <div className="text-blue-200 text-xs mt-1">지금 바로 진단하기</div>
        </Link>
        <Link href="/participant/survey" className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">📝</div>
          <div className="font-semibold text-slate-800">만족도 설문</div>
          <div className="text-slate-400 text-xs mt-1">약 5분 소요</div>
        </Link>
        <Link href="/participant/my-result" className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">📈</div>
          <div className="font-semibold text-slate-800">나의 성장 리포트</div>
          <div className="text-slate-400 text-xs mt-1">AI 역량 변화 확인</div>
        </Link>
      </div>
    </div>
  );
}
