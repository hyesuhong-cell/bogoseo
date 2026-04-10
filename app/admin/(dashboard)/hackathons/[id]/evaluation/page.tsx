import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import { notFound } from 'next/navigation';

export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hackathon = mockHackathons.find(h => h.id === id);
  if (!hackathon) notFound();

  const teams = mockTeams.filter(t => t.hackathonId === id);
  const participants = mockParticipants.filter(p => p.hackathonId === id);

  const rankedTeams = teams
    .filter(t => t.project?.evaluationScore)
    .map(t => {
      const s = t.project!.evaluationScore!;
      return { ...t, total: s.creativity + s.techCompletion + s.feasibility + s.teamwork + s.ux };
    })
    .sort((a, b) => b.total - a.total);

  const criteria = [
    { label: '창의성 및 아이디어 독창성', key: 'creativity', max: 25 },
    { label: '기술 완성도 및 구현력', key: 'techCompletion', max: 30 },
    { label: '실현 가능성 및 비즈니스 가치', key: 'feasibility', max: 20 },
    { label: '팀워크 및 발표 능력', key: 'teamwork', max: 15 },
    { label: '사용자 경험(UX) 설계', key: 'ux', max: 10 },
  ];

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <Link href={`/admin/hackathons/${id}`} className="hover:text-slate-800">{hackathon.name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">심사 결과</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">심사 결과 및 수상 내역</h1>

      {/* 심사 기준 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">심사 기준 (총 100점)</h2>
        <div className="grid grid-cols-5 gap-3">
          {criteria.map(c => (
            <div key={c.key} className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-700 mb-1">{c.max}점</div>
              <div className="text-xs font-medium text-slate-600">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">팀별 심사 점수</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">순위</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">팀명 / 프로젝트</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">창의성<br/>/25</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">기술<br/>/30</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">실현성<br/>/20</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">팀워크<br/>/15</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">UX<br/>/10</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">합계</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">수상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rankedTeams.map((team, rank) => {
                const s = team.project!.evaluationScore!;
                return (
                  <tr key={team.id} className={rank < 3 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 0 ? 'bg-yellow-400 text-white' :
                        rank === 1 ? 'bg-slate-400 text-white' :
                        rank === 2 ? 'bg-orange-400 text-white' : 'text-slate-500'
                      }`}>{rank + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{team.name}</div>
                      <div className="text-xs text-slate-400">{team.project?.name}</div>
                    </td>
                    {[s.creativity, s.techCompletion, s.feasibility, s.teamwork, s.ux].map((score, i) => (
                      <td key={i} className="px-3 py-3 text-center text-sm font-semibold text-blue-700">{score}</td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg font-bold text-blue-800">{team.total}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.award ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          s.award === '대상' ? 'bg-yellow-100 text-yellow-700' :
                          s.award === '최우수상' ? 'bg-orange-100 text-orange-700' :
                          s.award === '우수상' ? 'bg-blue-100 text-blue-700' :
                          s.award === '장려상' ? 'bg-slate-100 text-slate-600' :
                          'bg-purple-100 text-purple-700'
                        }`}>🏆 {s.award}</span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수상팀 상세 */}
      <div className="grid grid-cols-2 gap-5">
        {rankedTeams.filter(t => t.project?.evaluationScore?.award).map(team => {
          const s = team.project!.evaluationScore!;
          const leader = participants.find(p => p.id === team.leaderId);
          const teamMembers = participants.filter(p => team.members.includes(p.id));
          return (
            <div key={team.id} className={`rounded-xl p-5 border-l-4 bg-white shadow-sm ${
              s.award === '대상' ? 'border-yellow-400' :
              s.award === '최우수상' ? 'border-orange-400' :
              s.award === '우수상' ? 'border-blue-400' :
              s.award === '장려상' ? 'border-slate-300' : 'border-purple-400'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                    s.award === '대상' ? 'bg-yellow-100 text-yellow-700' :
                    s.award === '최우수상' ? 'bg-orange-100 text-orange-700' :
                    s.award === '우수상' ? 'bg-blue-100 text-blue-700' :
                    s.award === '장려상' ? 'bg-slate-100 text-slate-600' : 'bg-purple-100 text-purple-700'
                  }`}>🏆 {s.award}</span>
                  <span className="font-bold text-slate-800">팀 {team.name}</span>
                </div>
                <span className="text-xl font-bold text-blue-700">{(s.creativity+s.techCompletion+s.feasibility+s.teamwork+s.ux)}/100</span>
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">{team.project?.name}</div>
              <div className="text-xs text-slate-500 mb-3">{team.project?.description}</div>
              <div className="text-xs text-slate-500 mb-2 italic">"{s.judgeComment}"</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {team.project?.techStack.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {teamMembers.map(m => (
                  <div key={m.id} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                    {m.name} ({m.major.slice(0,4)})
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
