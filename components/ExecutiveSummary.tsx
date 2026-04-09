'use client';

interface ExecutiveSummaryProps {
  hackathonName: string;
  university: string;
  participantCount: number;
  growthRate: number;
  satisfaction: number;
  nps: number;
  preAvg: number;
  postAvg: number;
  submitRate: number;
  impactStatement: string;
  nextAction: string;
}

export default function ExecutiveSummary({
  hackathonName,
  university,
  participantCount,
  growthRate,
  satisfaction,
  nps,
  preAvg,
  postAvg,
  submitRate,
  impactStatement,
  nextAction,
}: ExecutiveSummaryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-blue-200 text-xs font-semibold mb-1 uppercase tracking-wide">
              Executive Summary
            </div>
            <h1 className="text-2xl font-bold mb-1">{hackathonName}</h1>
            <div className="text-blue-200 text-sm">{university}</div>
          </div>
          <div className="text-right">
            <div className="text-blue-200 text-xs mb-1">보고서 생성일</div>
            <div className="text-white font-semibold">
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - The 3 Numbers */}
      <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              참가자 수
            </div>
            <div className="text-5xl font-bold text-blue-700 mb-1">
              {participantCount}
            </div>
            <div className="text-sm text-slate-600">명</div>
          </div>

          <div className="text-center border-x border-slate-300">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              AI 역량 평균 성장률
            </div>
            <div className="text-5xl font-bold text-emerald-600 mb-1">
              +{growthRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600">
              {preAvg.toFixed(1)} → {postAvg.toFixed(1)}점
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              참가자 만족도
            </div>
            <div className="text-5xl font-bold text-amber-600 mb-1">
              {satisfaction.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">/ 5.0</div>
          </div>
        </div>
      </div>

      {/* Impact Statement */}
      <div className="px-8 py-6 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              핵심 임팩트
            </h3>
            <p className="text-xl font-semibold text-slate-800 leading-relaxed">
              {impactStatement}
            </p>
          </div>
        </div>
      </div>

      {/* Visual - Before/After Comparison */}
      <div className="px-8 py-6 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
          AI 역량 변화 (Before → After)
        </h3>
        <div className="grid grid-cols-2 gap-8">
          {/* Before */}
          <div className="text-center">
            <div className="text-xs text-slate-500 font-semibold mb-3">행사 전 (Pre)</div>
            <div className="relative">
              <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="20"
                  strokeDasharray={`${(preAvg / 5) * 502.65} 502.65`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-3xl font-bold text-slate-600">{preAvg.toFixed(1)}</div>
                  <div className="text-xs text-slate-400">/5.0</div>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="text-center">
            <div className="text-xs text-blue-600 font-semibold mb-3">행사 후 (Post)</div>
            <div className="relative">
              <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#E0F2FE"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="20"
                  strokeDasharray={`${(postAvg / 5) * 502.65} 502.65`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{postAvg.toFixed(1)}</div>
                  <div className="text-xs text-blue-400">/5.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Arrow */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-3 bg-emerald-100 rounded-full px-6 py-3">
            <span className="text-2xl">📈</span>
            <span className="text-lg font-bold text-emerald-700">
              +{(postAvg - preAvg).toFixed(1)}점 향상 (+{growthRate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Additional KPIs */}
      <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">프로젝트 제출률</div>
              <div className="text-2xl font-bold text-slate-800">{submitRate}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💯</span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">NPS 점수</div>
              <div className="text-2xl font-bold text-slate-800">{nps}점</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className="px-8 py-6 bg-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              다음 단계 (Next Action)
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              {nextAction}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-slate-100 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            이 보고서는 AI 역량 진단 플랫폼에서 자동 생성되었습니다.
          </div>
          <div className="font-mono">
            ID: {hackathonName.split(' ')[0].toUpperCase()}-{new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
