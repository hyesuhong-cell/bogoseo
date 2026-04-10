import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams, mockSurveys } from '@/lib/mockData';
import HackathonListWithTabs from '@/components/HackathonListWithTabs';
import { auth } from '@/auth';

export default async function AdminDashboard() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const university = (session?.user as { university?: string })?.university;

  // 슈퍼어드민은 전체, 어드민은 담당 대학만
  const hackathons = role === 'superadmin'
    ? mockHackathons
    : mockHackathons.filter(h => h.university === university);

  const hackathonIds = new Set(hackathons.map(h => h.id));
  const participants = mockParticipants.filter(p => hackathonIds.has(p.hackathonId));
  const surveys = mockSurveys.filter(s => hackathonIds.has(s.hackathonId));

  const completed = hackathons.filter(h => h.status === 'completed');
  const totalParticipants = participants.length;
  const diagnosed = participants.filter(p => p.preScore && p.postScore).length;
  const avgNps = surveys.length > 0
    ? Math.round((surveys.reduce((s, v) => s + v.nps, 0) / surveys.length) * 10)
    : 0;

  const kpiCards = [
    { label: '총 해커톤', value: hackathons.length, sub: `완료 ${completed.length}건`, color: 'bg-blue-600', icon: '🏆' },
    { label: '총 참가자', value: totalParticipants + '명', sub: '역대 누적', color: 'bg-emerald-600', icon: '👥' },
    { label: '역량 진단 완료', value: diagnosed + '명', sub: totalParticipants > 0 ? `완료율 ${Math.round(diagnosed / totalParticipants * 100)}%` : '-', color: 'bg-violet-600', icon: '📊' },
    { label: '평균 NPS', value: avgNps + '점', sub: '참가자 만족도', color: 'bg-orange-500', icon: '⭐' },
  ];

  return (
    <div className="p-8 fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="text-slate-500 mt-1">
          {role === 'superadmin'
            ? '전체 해커톤 성과 현황'
            : `${university ?? ''} 해커톤 성과 현황`}
        </p>
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
        {/* 해커톤 목록 (카테고리 탭 포함) */}
        <HackathonListWithTabs
          hackathons={hackathons.map(h => ({
            id: h.id,
            name: h.name,
            university: h.university,
            startDate: h.startDate,
            status: h.status,
            category: h.category,
          }))}
        />

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
