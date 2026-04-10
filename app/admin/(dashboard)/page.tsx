import Link from 'next/link';
import { mockHackathons, mockParticipants, mockSurveys } from '@/lib/mockData';
import HackathonListWithTabs from '@/components/HackathonListWithTabs';
import { auth } from '@/auth';
import { listHackathons } from '@/lib/hackathonStore';
import { countParticipantsByHackathons } from '@/lib/userStore';
import { getHackathonDiagnosisStats } from '@/lib/diagnosisStore';
import type { DiagnosisScores } from '@/lib/diagnosisStore';
import type { HackathonCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const university = (session?.user as { university?: string })?.university;

  // DB 해커톤 조회 (슈퍼어드민: 전체, 어드민: 담당 대학)
  const dbHackathons = await listHackathons(role === 'superadmin' ? undefined : university);
  const dbHackathonIds = new Set(dbHackathons.map(h => h.id));

  // mock 해커톤 (DB에 없는 것만)
  const filteredMock = role === 'superadmin'
    ? mockHackathons
    : mockHackathons.filter(h => h.university === university);
  const mockOnlyHackathons = filteredMock.filter(h => !dbHackathonIds.has(h.id));

  // 전체 해커톤 목록 (DB 우선, mock 보완)
  const allHackathons = [
    ...dbHackathons.map(h => ({
      id: h.id,
      name: h.name,
      university: h.university,
      startDate: h.startDate,
      status: h.status,
      category: h.category as HackathonCategory,
    })),
    ...mockOnlyHackathons.map(h => ({
      id: h.id,
      name: h.name,
      university: h.university,
      startDate: h.startDate,
      status: h.status,
      category: h.category as HackathonCategory,
    })),
  ];

  // DB 참가자 수 & 진단 통계 조회
  const dbIds = dbHackathons.map(h => h.id);
  const [dbParticipantCount, diagStats] = await Promise.all([
    countParticipantsByHackathons(dbIds),
    getHackathonDiagnosisStats(dbIds),
  ]);

  // mock 통계 (mock-only 해커톤 기준)
  const mockOnlyIds = new Set(mockOnlyHackathons.map(h => h.id));
  const mockParticipantsFiltered = mockParticipants.filter(p => mockOnlyIds.has(p.hackathonId));
  const mockSurveysFiltered = mockSurveys.filter(s => allHackathons.some(h => h.id === s.hackathonId));

  // 종합 KPI
  const totalParticipants = dbParticipantCount + mockParticipantsFiltered.length;
  const mockDiagnosed = mockParticipantsFiltered.filter(p => p.preScore && p.postScore).length;
  const diagnosed = diagStats.diagnosedCount + mockDiagnosed;
  const completed = allHackathons.filter(h => h.status === 'completed');
  const avgNps = mockSurveysFiltered.length > 0
    ? Math.round(mockSurveysFiltered.reduce((s, v) => s + v.nps, 0) / mockSurveysFiltered.length * 10)
    : 0;

  const kpiCards = [
    { label: '총 해커톤', value: allHackathons.length, sub: `완료 ${completed.length}건`, color: 'bg-blue-600', icon: '🏆' },
    { label: '총 참가자', value: totalParticipants + '명', sub: '역대 누적', color: 'bg-emerald-600', icon: '👥' },
    { label: '역량 진단 완료', value: diagnosed + '명', sub: totalParticipants > 0 ? `완료율 ${Math.round(diagnosed / totalParticipants * 100)}%` : '-', color: 'bg-violet-600', icon: '📊' },
    { label: '평균 NPS', value: avgNps + '점', sub: '참가자 만족도', color: 'bg-orange-500', icon: '⭐' },
  ];

  // AI 역량 성장 데이터 (DB 우선, fallback: mock 고정값)
  const MOCK_GROWTH = [
    { label: 'AI 이해도', key: 'aiUnderstanding', pre: 2.7, post: 4.2 },
    { label: '도구 활용능력', key: 'toolUsage', pre: 2.1, post: 3.9 },
    { label: '문제 해결력', key: 'problemSolving', pre: 2.8, post: 4.3 },
    { label: '협업/커뮤니케이션', key: 'collaboration', pre: 3.7, post: 4.6 },
    { label: '윤리적 판단력', key: 'ethics', pre: 3.2, post: 4.2 },
  ];

  const growthItems = MOCK_GROWTH.map(item => {
    const k = item.key as keyof DiagnosisScores;
    const hasDbData = diagStats.preAvg !== null && diagStats.postAvg !== null;
    const pre = hasDbData ? (diagStats.preAvg![k] ?? item.pre) : item.pre;
    const post = hasDbData ? (diagStats.postAvg![k] ?? item.post) : item.post;
    return { label: item.label, pre, post };
  });

  const hasRealData = dbHackathons.length > 0;

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
        {/* 해커톤 목록 (DB + mock) */}
        <HackathonListWithTabs hackathons={allHackathons} />

        {/* AI 역량 성장 요약 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">AI 역량 평균 성장</h2>
            <span className="text-xs text-slate-400">
              {hasRealData && diagStats.preAvg ? 'DB 실측 기준' : '샘플 데이터'}
            </span>
          </div>
          {growthItems.map(item => {
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
          {hasRealData && !diagStats.preAvg && (
            <p className="text-xs text-slate-400 mt-4 text-center">진단 완료 데이터가 쌓이면 실측값으로 업데이트됩니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
