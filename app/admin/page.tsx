import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams, mockSurveys } from '@/lib/mockData';

export default function AdminDashboard() {
  const completed = mockHackathons.filter(h => h.status === 'completed');
  const upcoming = mockHackathons.filter(h => h.status === 'upcoming');
  const totalParticipants = mockParticipants.length;
  const diagnosed = mockParticipants.filter(p => p.preScore && p.postScore).length;
  const avgNps = mockSurveys.length > 0
    ? Math.round((mockSurveys.reduce((s, v) => s + v.nps, 0) / mockSurveys.length) * 10)
    : 0;

  const kpiCards = [
    { label: '총 해커톤', value: mockHackathons.length, sub: `완료 ${completed.length}건`, color: 'bg-blue-600', icon: '🏆' },
    { label: '총 참가자', value: totalParticipants + '명', sub: '역대 누적', color: 'bg-emerald-600', icon: '👥' },
    { label: '역량 진단 완료', value: diagnosed + '명', sub: `완료율 ${Math.round(diagnosed/totalParticipants*100)}%`, color: 'bg-violet-600', icon: '📊' },
    { label: '평균 NPS', value: avgNps + '점', sub: '참가자 만족도', color: 'bg-orange-500', icon: '⭐' },
  ];

  return (
    <div className="p-8 fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="text-slate-500 mt-1">해커톤 성과 추적 현황을 확인하세요</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${card.color}`}>Live</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{card.value}</div>
            <div className="text-sm font-medium text-slate-600">{card.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 해커톤 목록 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">해커톤 현황</h2>
            <Link href="/admin/hackathons" className="text-blue-600 text-sm font-medium hover:underline">모두 보기 →</Link>
          </div>
          <div className="space-y-3">
            {mockHackathons.map(h => (
              <Link key={h.id} href={`/admin/hackathons/${h.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.status === 'completed' ? 'bg-emerald-500' : h.status === 'ongoing' ? 'bg-blue-500' : 'bg-amber-400'}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{h.name}</div>
                    <div className="text-xs text-slate-400">{h.university} · {h.startDate}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    h.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    h.status === 'ongoing' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {h.status === 'completed' ? '완료' : h.status === 'ongoing' ? '진행중' : '예정'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI 역량 성장 요약 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">AI 역량 평균 성장</h2>
            <span className="text-xs text-slate-400">2025 해커톤 기준</span>
          </div>
          {[
            { label: 'AI 이해도', pre: 2.7, post: 4.2 },
            { label: '도구 활용능력', pre: 2.1, post: 3.9 },
            { label: '문제 해결력', pre: 2.8, post: 4.3 },
            { label: '협업/커뮤니케이션', pre: 3.7, post: 4.6 },
            { label: '윤리적 판단력', pre: 3.2, post: 4.2 },
          ].map(item => {
            const growth = item.post - item.pre;
            const postPct = (item.post / 5) * 100;
            return (
              <div key={item.label} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-xs font-semibold text-emerald-600">+{growth.toFixed(1)} ▲</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400 w-10 text-right">{item.pre}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${postPct}%` }}></div>
                  </div>
                  <div className="text-xs font-bold text-blue-600 w-10">{item.post}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
