import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import { getHackathon } from '@/lib/hackathonStore';
import { listParticipantsByHackathon } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

const completionColors: Record<string, string> = {
  '매우 우수': 'bg-emerald-50 text-emerald-700',
  '우수': 'bg-blue-50 text-blue-700',
  '양호': 'bg-amber-50 text-amber-700',
  '개선 필요': 'bg-red-50 text-red-600',
};

const awardColors: Record<string, string> = {
  '대상':    'bg-yellow-100 text-yellow-700',
  '최우수상': 'bg-orange-100 text-orange-700',
  '우수상':  'bg-blue-100 text-blue-700',
  '장려상':  'bg-slate-100 text-slate-600',
  '특별상':  'bg-purple-100 text-purple-700',
};

export default async function TeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // mock → DB 순으로 조회
  const mockH = mockHackathons.find(h => h.id === id);
  const dbH = mockH ? null : await getHackathon(id);
  const hackathon = mockH ?? dbH;
  if (!hackathon) notFound();

  const isDbHackathon = !mockH;

  // 팀 데이터 (mock만 지원; DB 해커톤은 추후 연동)
  const teams = isDbHackathon ? [] : mockTeams.filter(t => t.hackathonId === id);

  // 참가자: mock + DB 병합
  const mockParts = isDbHackathon ? [] : mockParticipants.filter(p => p.hackathonId === id);
  const dbParts = await listParticipantsByHackathon(id);
  const mockIds = new Set(mockParts.map(p => p.id));
  const dbOnly = dbParts.filter(p => !mockIds.has(p.id));
  const allParticipants = [...mockParts, ...dbOnly];

  const submittedTeams = teams.filter(t => t.project);

  // 트랙 목록
  const tracks = hackathon.tracks ?? [];

  return (
    <div className="p-8 fade-in">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <Link href={`/admin/hackathons/${id}`} className="hover:text-slate-800">{hackathon.name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">팀/프로젝트</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">팀 & 프로젝트 관리</h1>
        <div className="flex gap-3 text-sm">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">{teams.length}팀 참가</span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">{submittedTeams.length}팀 제출</span>
        </div>
      </div>

      {/* 트랙별 분포 */}
      {tracks.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {tracks.map(track => {
            const trackTeams = teams.filter(t => t.trackId === track.id);
            const submitted = trackTeams.filter(t => t.project).length;
            return (
              <div key={track.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="text-sm font-semibold text-slate-700 mb-1">{track.name}</div>
                <div className="text-2xl font-bold text-blue-600">{trackTeams.length}팀</div>
                <div className="text-xs text-slate-400 mt-0.5">제출 {submitted}팀</div>
              </div>
            );
          })}
        </div>
      )}

      {/* DB 해커톤: 팀 기능 준비 중 안내 + 참가자 현황 */}
      {isDbHackathon && (
        <div className="space-y-6">
          {/* 안내 배너 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl">🏗️</div>
            <div>
              <div className="font-semibold text-blue-800 mb-1">팀 관리 기능 준비 중</div>
              <p className="text-blue-600 text-sm">
                현재 참가자 {allParticipants.length}명이 등록되어 있습니다.
                팀 구성, 프로젝트 제출, 심사 입력 기능은 곧 추가될 예정입니다.
              </p>
            </div>
          </div>

          {/* 미배정 참가자 목록 */}
          {allParticipants.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">등록된 참가자 ({allParticipants.length}명)</h2>
                <span className="text-xs text-slate-400">팀 미배정 상태</span>
              </div>
              <div className="divide-y divide-slate-50">
                {allParticipants.map((p) => (
                  <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                      {p.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.email}</div>
                    </div>
                    <div className="text-xs text-slate-500">{(p as { major?: string }).major ?? '-'}</div>
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">미배정</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mock 해커톤: 기존 팀 카드 목록 */}
      {!isDbHackathon && (
        <>
          {teams.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
              <div className="text-4xl mb-3">🏅</div>
              <p className="text-slate-500">아직 팀이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {teams.map(team => {
                const track = tracks.find(t => t.id === team.trackId);
                const teamMembers = allParticipants.filter(p => team.members.includes(p.id));
                const leader = allParticipants.find(p => p.id === team.leaderId);
                const project = team.project;
                const score = project?.evaluationScore;
                const totalScore = score
                  ? score.creativity + score.techCompletion + score.feasibility + score.teamwork + score.ux
                  : null;

                return (
                  <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-slate-800 text-lg">팀 {team.name}</h3>
                          {score?.award && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${awardColors[score.award] ?? 'bg-slate-100 text-slate-600'}`}>
                              🏆 {score.award}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{track?.name} · 팀장: {leader?.name}</div>
                      </div>
                      {project?.completionLevel && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${completionColors[project.completionLevel] ?? ''}`}>
                          {project.completionLevel}
                        </span>
                      )}
                    </div>

                    {project ? (
                      <>
                        <div className="bg-slate-50 rounded-lg p-3 mb-4">
                          <div className="font-semibold text-slate-800 text-sm mb-1">{project.name}</div>
                          <div className="text-xs text-slate-500 mb-2">{project.description}</div>
                          <div className="flex flex-wrap gap-1">
                            {project.techStack.map(t => (
                              <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{t}</span>
                            ))}
                          </div>
                        </div>

                        {score && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-slate-500">심사 점수</span>
                              <span className="text-lg font-bold text-blue-600">{totalScore}/100</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-center text-xs">
                              {[
                                { label: '창의성', score: score.creativity },
                                { label: '기술', score: score.techCompletion },
                                { label: '실현성', score: score.feasibility },
                                { label: '팀워크', score: score.teamwork },
                                { label: 'UX', score: score.ux },
                              ].map(item => (
                                <div key={item.label} className="bg-slate-50 rounded p-1.5">
                                  <div className="font-bold text-blue-600">{item.score}</div>
                                  <div className="text-slate-400">{item.label}</div>
                                </div>
                              ))}
                            </div>
                            {score.judgeComment && (
                              <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 italic">
                                "{score.judgeComment}"
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-slate-50 rounded-lg p-3 mb-4 text-center text-sm text-slate-400">
                        프로젝트 미제출
                      </div>
                    )}

                    {/* 팀원 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teamMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">
                          <div className="w-4 h-4 bg-blue-400 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                            {m.name[0]}
                          </div>
                          <span className="text-xs text-slate-600">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
