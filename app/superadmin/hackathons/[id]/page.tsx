import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getHackathon } from '@/lib/hackathonStore';
import { listParticipantsByHackathon } from '@/lib/userStore';
import { mockHackathons, mockParticipants, mockTeams, mockSurveys } from '@/lib/mockData';
import HackathonManageActions from '@/components/HackathonManageActions';
import SuperAdminHeader from '@/components/SuperAdminHeader';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG = {
  completed: { label: '완료', cls: 'bg-emerald-400/30 text-emerald-100' },
  ongoing:   { label: '진행중', cls: 'bg-blue-400/30 text-blue-100' },
  upcoming:  { label: '예정', cls: 'bg-amber-400/30 text-amber-100' },
};

export default async function SuperAdminHackathonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'superadmin') redirect('/superadmin/login');

  // mock → DB 순으로 조회
  const mockData = mockHackathons.find(h => h.id === id);
  const dbData = mockData ? null : await getHackathon(id);
  const raw = mockData ?? dbData;
  if (!raw) notFound();

  const hackathon = {
    id: raw.id,
    name: raw.name,
    university: raw.university,
    theme: (raw as { theme?: string }).theme ?? '',
    category: (raw as { category?: string }).category ?? '',
    status: raw.status as 'upcoming' | 'ongoing' | 'completed',
    startDate: raw.startDate,
    endDate: raw.endDate,
    venue: (raw as { venue?: string }).venue ?? '',
    tracks: raw.tracks ?? [],
    isDb: !mockData,
  };

  // 참가자
  const mockParts = mockParticipants.filter(p => p.hackathonId === id);
  const dbParts = await listParticipantsByHackathon(id);
  const mockIds = new Set(mockParts.map(p => p.id));
  const dbOnly = dbParts.filter(p => !mockIds.has(p.id));
  const allParticipants = [...mockParts, ...dbOnly];

  const teams = mockTeams.filter(t => t.hackathonId === id);
  const surveys = mockSurveys.filter(s => s.hackathonId === id);
  const diagnosed = mockParts.filter(p => p.preScore && p.postScore);
  const submittedTeams = teams.filter(t => t.project).length;
  const avgNps = surveys.length > 0
    ? (surveys.reduce((s, v) => s + v.nps, 0) / surveys.length).toFixed(1)
    : '-';

  const st = STATUS_CONFIG[hackathon.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <SuperAdminHeader title={hackathon.name} />

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-sm text-purple-400 mb-8">
          <Link href="/superadmin" className="hover:text-white transition-colors">대시보드</Link>
          <span className="text-white/20">/</span>
          <Link href="/superadmin/hackathons" className="hover:text-white transition-colors">해커톤 현황</Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-medium">{hackathon.name}</span>
        </div>

        {/* 헤더 카드 */}
        <div className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl p-7 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold">{hackathon.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                  {st.label}
                </span>
                {hackathon.category && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-white/80">
                    {hackathon.category}
                  </span>
                )}
                {hackathon.isDb && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-400/30 text-blue-100 border border-blue-400/30">
                    DB
                  </span>
                )}
              </div>
              {hackathon.theme && (
                <p className="text-purple-200 text-sm mb-4">{hackathon.theme}</p>
              )}
              <div className="flex gap-5 text-sm text-purple-100 flex-wrap">
                <span>🏫 {hackathon.university}</span>
                <span>📅 {hackathon.startDate} ~ {hackathon.endDate}</span>
                {hackathon.venue && <span>📍 {hackathon.venue}</span>}
              </div>
            </div>
            {/* 액션 버튼 */}
            <div className="ml-4 mt-1 flex flex-col gap-2 items-end">
              <Link
                href={`/admin/hackathons/${hackathon.id}`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                어드민 뷰로 자세히 보기 →
              </Link>
              <HackathonManageActions hackathon={hackathon} redirectAfterDelete="/superadmin/hackathons" />
            </div>
          </div>
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: '총 참가자', value: allParticipants.length + '명', icon: '👥', color: 'text-blue-300' },
            { label: '참가 팀', value: teams.length + '팀', icon: '🏅', color: 'text-violet-300' },
            { label: '프로젝트 제출', value: submittedTeams + '팀', icon: '💻', color: 'text-emerald-300' },
            { label: '역량 진단 완료', value: diagnosed.length + '명', icon: '📊', color: 'text-orange-300' },
            { label: 'NPS 점수', value: avgNps, icon: '⭐', color: 'text-pink-300' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-purple-300 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 참가자 목록 */}
          <div className="col-span-2 bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-semibold">참가자 ({allParticipants.length}명)</h2>
              <span className="text-purple-400 text-xs">초대 가입 {dbOnly.length}명</span>
            </div>
            {allParticipants.length === 0 ? (
              <div className="px-6 py-10 text-center text-purple-400 text-sm">참가자가 없습니다.</div>
            ) : (
              <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                {allParticipants.slice(0, 20).map((p) => (
                  <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/40 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{p.name}</div>
                      <div className="text-purple-400 text-xs truncate">{p.email}</div>
                    </div>
                    <div className="text-purple-300 text-xs">{(p as { major?: string }).major ?? '-'}</div>
                  </div>
                ))}
                {allParticipants.length > 20 && (
                  <div className="px-6 py-3 text-center text-purple-400 text-xs">
                    +{allParticipants.length - 20}명 더 있음
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽 사이드 */}
          <div className="space-y-6">
            {/* 팀 현황 */}
            <div className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-white font-semibold">팀 현황 ({teams.length}팀)</h2>
              </div>
              {teams.length === 0 ? (
                <div className="px-5 py-6 text-center text-purple-400 text-xs">팀이 없습니다.</div>
              ) : (
                <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                  {teams.map(t => (
                    <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-white text-sm">{t.name}</span>
                      {t.project ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">제출</span>
                      ) : (
                        <span className="text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-full">미제출</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 트랙 구성 */}
            {hackathon.tracks.length > 0 && (
              <div className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <h2 className="text-white font-semibold">트랙 ({hackathon.tracks.length}개)</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {hackathon.tracks.map((track, i) => (
                    <div key={track.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500'][i % 4]
                      }`}>{i + 1}</div>
                      <div>
                        <div className="text-white text-xs font-medium">{track.name}</div>
                        {track.description && (
                          <div className="text-purple-400 text-[10px]">{track.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
