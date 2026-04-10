import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listHackathons } from '@/lib/hackathonStore';
import { countParticipantsPerHackathon } from '@/lib/userStore';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import HackathonManageActions from '@/components/HackathonManageActions';
import SuperAdminHeader from '@/components/SuperAdminHeader';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG = {
  completed: { label: '완료', cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  ongoing:   { label: '진행중', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  upcoming:  { label: '예정', cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
};

const CATEGORY_CONFIG: Record<string, string> = {
  '사회문제해결': 'bg-green-500/20 text-green-300',
  '창업·MVP':     'bg-violet-500/20 text-violet-300',
  '기술개발':     'bg-sky-500/20 text-sky-300',
  '교육·인재':    'bg-orange-500/20 text-orange-300',
};

export default async function SuperAdminHackathonsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'superadmin') redirect('/superadmin/login');

  // 전체 DB 해커톤
  const dbHackathons = await listHackathons();
  const dbIds = new Set(dbHackathons.map(h => h.id));

  // DB에 없는 mock 해커톤
  const mockOnly = mockHackathons.filter(h => !dbIds.has(h.id));

  const allHackathons = [
    ...dbHackathons.map(h => ({
      id: h.id,
      name: h.name,
      university: h.university,
      category: h.category,
      status: h.status as 'upcoming' | 'ongoing' | 'completed',
      startDate: h.startDate,
      endDate: h.endDate,
      venue: h.venue ?? '',
      theme: h.theme ?? '',
      tracks: h.tracks,
      isDb: true,
    })),
    ...mockOnly.map(h => ({
      id: h.id,
      name: h.name,
      university: h.university,
      category: h.category,
      status: h.status as 'upcoming' | 'ongoing' | 'completed',
      startDate: h.startDate,
      endDate: h.endDate,
      venue: (h as { venue?: string }).venue ?? '',
      theme: (h as { theme?: string }).theme ?? '',
      tracks: h.tracks ?? [],
      isDb: false,
    })),
  ];

  // DB 해커톤별 참가자 수
  const dbParticipantCounts = await countParticipantsPerHackathon(dbHackathons.map(h => h.id));

  // 집계
  const totalHackathons = allHackathons.length;
  const totalDbParticipants = Object.values(dbParticipantCounts).reduce((a, b) => a + b, 0);
  const totalMockParticipants = mockParticipants.filter(p => !dbIds.has(p.hackathonId)).length;
  const totalParticipants = totalDbParticipants + totalMockParticipants;
  const completedCount = allHackathons.filter(h => h.status === 'completed').length;
  const ongoingCount = allHackathons.filter(h => h.status === 'ongoing').length;

  // 대학별 그룹
  const byUniversity: Record<string, typeof allHackathons> = {};
  allHackathons.forEach(h => {
    if (!byUniversity[h.university]) byUniversity[h.university] = [];
    byUniversity[h.university].push(h);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <SuperAdminHeader title="해커톤 현황" />

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-sm text-purple-400 mb-8">
          <Link href="/superadmin" className="hover:text-white transition-colors">대시보드</Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-medium">해커톤 현황</span>
        </div>

        {/* 집계 KPI */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: '전체 해커톤', value: totalHackathons + '건', sub: `DB ${dbHackathons.length}건`, icon: '🏆', color: 'text-purple-300' },
            { label: '총 참가자', value: totalParticipants + '명', sub: `초대 가입 ${totalDbParticipants}명`, icon: '👥', color: 'text-blue-300' },
            { label: '진행중', value: ongoingCount + '건', sub: '현재 활성 해커톤', icon: '🔴', color: 'text-emerald-300' },
            { label: '완료', value: completedCount + '건', sub: `${totalHackathons > 0 ? Math.round(completedCount / totalHackathons * 100) : 0}% 완료율`, icon: '✅', color: 'text-amber-300' },
          ].map(card => (
            <div key={card.label} className="bg-white/10 border border-white/20 rounded-2xl p-5">
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className={`text-2xl font-bold mb-1 ${card.color}`}>{card.value}</div>
              <div className="text-white/60 text-sm">{card.label}</div>
              <div className="text-white/30 text-xs mt-0.5">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* 해커톤 목록 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">전체 해커톤 ({totalHackathons}건)</h2>
          <Link
            href="/admin/hackathons/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            + 새 해커톤 개설
          </Link>
        </div>

        {/* 대학별 그룹 */}
        <div className="space-y-6">
          {Object.entries(byUniversity).map(([university, hackathons]) => {
            const uParticipants = hackathons.reduce((sum, h) => {
              const db = dbParticipantCounts[h.id] ?? 0;
              const mock = mockParticipants.filter(p => p.hackathonId === h.id).length;
              return sum + db + mock;
            }, 0);

            return (
              <div key={university} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* 대학 헤더 */}
                <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏫</span>
                    <div>
                      <span className="text-white font-semibold">{university}</span>
                      <span className="text-purple-400 text-sm ml-2">{hackathons.length}개 해커톤</span>
                    </div>
                  </div>
                  <span className="text-purple-300 text-sm">총 {uParticipants}명</span>
                </div>

                {/* 해커톤 카드 목록 */}
                <div className="divide-y divide-white/5">
                  {hackathons.map(h => {
                    const dbPCount = dbParticipantCounts[h.id] ?? 0;
                    const mockPCount = mockParticipants.filter(p => p.hackathonId === h.id).length;
                    const totalP = dbPCount + mockPCount;
                    const teamCount = mockTeams.filter(t => t.hackathonId === h.id).length;
                    const st = STATUS_CONFIG[h.status];
                    const catCls = CATEGORY_CONFIG[h.category] ?? 'bg-slate-500/20 text-slate-300';

                    return (
                      <div key={h.id} className="px-6 py-5 flex items-center gap-4">
                        {/* 상태 표시 */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          h.status === 'ongoing' ? 'bg-blue-400' :
                          h.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`} />

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white font-semibold text-sm">{h.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                              {st.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${catCls}`}>
                              {h.category}
                            </span>
                            {h.isDb && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20 font-medium">
                                DB
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-purple-300">
                            <span>📅 {h.startDate} ~ {h.endDate}</span>
                            {h.venue && <span>📍 {h.venue}</span>}
                          </div>
                        </div>

                        {/* 통계 */}
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">{totalP}</div>
                            <div className="text-purple-400 text-[10px]">참가자</div>
                            {dbPCount > 0 && (
                              <div className="text-blue-400 text-[10px]">초대 {dbPCount}</div>
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">{teamCount}</div>
                            <div className="text-purple-400 text-[10px]">팀</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">{h.tracks.length}</div>
                            <div className="text-purple-400 text-[10px]">트랙</div>
                          </div>
                        </div>

                        {/* 액션 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href={`/admin/hackathons/${h.id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 rounded-lg transition-colors border border-purple-500/30"
                          >
                            상세 보기
                          </Link>
                          <HackathonManageActions hackathon={h} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {allHackathons.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-purple-300">등록된 해커톤이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
