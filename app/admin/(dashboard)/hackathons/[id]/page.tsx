import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams, mockSurveys } from '@/lib/mockData';
import { notFound } from 'next/navigation';

export default async function HackathonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hackathon = mockHackathons.find(h => h.id === id);
  if (!hackathon) notFound();

  const participants = mockParticipants.filter(p => p.hackathonId === id);
  const teams = mockTeams.filter(t => t.hackathonId === id);
  const surveys = mockSurveys.filter(s => s.hackathonId === id);
  const diagnosed = participants.filter(p => p.preScore && p.postScore);

  const avgNps = surveys.length > 0
    ? (surveys.reduce((s, v) => s + v.nps, 0) / surveys.length).toFixed(1)
    : '-';
  const submittedTeams = teams.filter(t => t.project).length;

  const tabs = [
    { label: '참가자 관리', href: `/admin/hackathons/${id}/participants` },
    { label: '팀/프로젝트', href: `/admin/hackathons/${id}/teams` },
    { label: '심사 결과', href: `/admin/hackathons/${id}/evaluation` },
    { label: '성과 리포트', href: `/admin/hackathons/${id}/report` },
  ];

  return (
    <div className="p-8 fade-in">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{hackathon.name}</span>
      </div>

      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-7 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{hackathon.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                hackathon.status === 'completed' ? 'bg-emerald-400/30 text-emerald-100' : 'bg-amber-400/30 text-amber-100'
              }`}>
                {hackathon.status === 'completed' ? '완료' : '예정'}
              </span>
            </div>
            <p className="text-blue-200 text-sm mb-4">{hackathon.theme}</p>
            <div className="flex gap-5 text-sm text-blue-100">
              <span>🏫 {hackathon.university}</span>
              <span>📅 {hackathon.startDate} ~ {hackathon.endDate}</span>
              <span>📍 {hackathon.venue}</span>
            </div>
          </div>
          <Link href={`/admin/hackathons/${id}/report`} className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
            성과 리포트 →
          </Link>
        </div>
      </div>

      {/* 핵심 KPI */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: '총 참가자', value: participants.length + '명', icon: '👥', color: 'text-blue-600' },
          { label: '참가 팀', value: teams.length + '팀', icon: '🏅', color: 'text-violet-600' },
          { label: '프로젝트 제출', value: submittedTeams + '팀', icon: '💻', color: 'text-emerald-600' },
          { label: '역량 진단 완료', value: diagnosed.length + '명', icon: '📊', color: 'text-orange-500' },
          { label: 'NPS 점수', value: avgNps, icon: '⭐', color: 'text-pink-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 flex gap-1 mb-6">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 text-center py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 트랙 구성 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">트랙 구성</h2>
        <div className="grid grid-cols-2 gap-3">
          {hackathon.tracks.map((track, i) => {
            const trackTeams = teams.filter(t => t.trackId === track.id);
            return (
              <div key={track.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                  ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500'][i % 4]
                }`}>{i + 1}</div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{track.name}</div>
                  <div className="text-xs text-slate-400">{track.description}</div>
                </div>
                <div className="ml-auto text-sm font-bold text-slate-600">{trackTeams.length}팀</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
