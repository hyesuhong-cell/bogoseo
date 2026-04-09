import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import { notFound } from 'next/navigation';

const completionColors: Record<string, string> = {
  '매우 우수': 'bg-emerald-50 text-emerald-700',
  '우수': 'bg-blue-50 text-blue-700',
  '양호': 'bg-amber-50 text-amber-700',
  '개선 필요': 'bg-red-50 text-red-600',
};

export default async function TeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hackathon = mockHackathons.find(h => h.id === id);
  if (!hackathon) notFound();

  const teams = mockTeams.filter(t => t.hackathonId === id);
  const participants = mockParticipants.filter(p => p.hackathonId === id);
  const submittedTeams = teams.filter(t => t.project);

  return (
    <div className="p-8 fade-in">
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {hackathon.tracks.map(track => {
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

      {/* 팀 카드 목록 */}
      <div className="grid grid-cols-2 gap-5">
        {teams.map(team => {
          const track = hackathon.tracks.find(t => t.id === team.trackId);
          const teamMembers = participants.filter(p => team.members.includes(p.id));
          const leader = participants.find(p => p.id === team.leaderId);
          const project = team.project;
          const score = project?.evaluationScore;
          const totalScore = score ? score.creativity + score.techCompletion + score.feasibility + score.teamwork + score.ux : null;

          return (
            <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-lg">팀 {team.name}</h3>
                    {score?.award && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        score.award === '대상' ? 'bg-yellow-100 text-yellow-700' :
                        score.award === '최우수상' ? 'bg-orange-100 text-orange-700' :
                        score.award === '우수상' ? 'bg-blue-100 text-blue-700' :
                        score.award === '장려상' ? 'bg-slate-100 text-slate-600' :
                        'bg-purple-100 text-purple-700'
                      }`}>🏆 {score.award}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{track?.name} · 팀장: {leader?.name}</div>
                </div>
                {project?.completionLevel && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${completionColors[project.completionLevel]}`}>
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
                          { label: '창의성', score: score.creativity, max: 25 },
                          { label: '기술', score: score.techCompletion, max: 30 },
                          { label: '실현성', score: score.feasibility, max: 20 },
                          { label: '팀워크', score: score.teamwork, max: 15 },
                          { label: 'UX', score: score.ux, max: 10 },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 rounded p-1">
                            <div className="font-bold text-blue-600">{item.score}</div>
                            <div className="text-slate-400">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 rounded-lg p-3 mb-4 text-center text-sm text-slate-400">프로젝트 미제출</div>
              )}

              {/* 팀원 */}
              <div className="flex items-center gap-1.5">
                {teamMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">
                    <div className="w-4 h-4 bg-blue-400 rounded-full text-white text-xs flex items-center justify-center font-bold">{m.name[0]}</div>
                    <span className="text-xs text-slate-600">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
