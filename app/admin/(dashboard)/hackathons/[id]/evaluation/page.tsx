import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import { getHackathon } from '@/lib/hackathonStore';
import { listParticipantsByHackathon } from '@/lib/userStore';
import { listTeamsByHackathon } from '@/lib/teamStore';

export const dynamic = 'force-dynamic';

const criteria = [
  { label: '창의성 및 아이디어 독창성', key: 'creativity', max: 25 },
  { label: '기술 완성도 및 구현력', key: 'techCompletion', max: 30 },
  { label: '실현 가능성 및 비즈니스 가치', key: 'feasibility', max: 20 },
  { label: '팀워크 및 발표 능력', key: 'teamwork', max: 15 },
  { label: '사용자 경험(UX) 설계', key: 'ux', max: 10 },
];

const awardBorder: Record<string, string> = {
  '대상': 'border-yellow-400',
  '최우수상': 'border-orange-400',
  '우수상': 'border-blue-400',
  '장려상': 'border-slate-300',
  '특별상': 'border-purple-400',
};
const awardBadge: Record<string, string> = {
  '대상': 'bg-yellow-100 text-yellow-700',
  '최우수상': 'bg-orange-100 text-orange-700',
  '우수상': 'bg-blue-100 text-blue-700',
  '장려상': 'bg-slate-100 text-slate-600',
  '특별상': 'bg-purple-100 text-purple-700',
};

export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // mock → DB 순으로 해커톤 조회
  const mockH = mockHackathons.find(h => h.id === id);
  const dbH = mockH ? null : await getHackathon(id);
  const hackathon = mockH ?? dbH;
  if (!hackathon) notFound();

  const isDbHackathon = !mockH;

  // ── 데이터 로드 ──────────────────────────────────────────────
  let rankedTeams: Array<{
    id: string;
    name: string;
    total: number;
    projectName: string;
    projectDescription: string;
    techStack: string[];
    judgeComment: string;
    award: string | null;
    creativity: number;
    techCompletion: number;
    feasibility: number;
    teamwork: number;
    ux: number;
    members: Array<{ name: string; major: string }>;
  }> = [];

  if (isDbHackathon) {
    // DB 해커톤: teamStore에서 팀+심사 데이터 가져오기
    const [dbTeams, dbParticipants] = await Promise.all([
      listTeamsByHackathon(id),
      listParticipantsByHackathon(id),
    ]);
    const participantMap = Object.fromEntries(dbParticipants.map(p => [p.id, p]));

    rankedTeams = dbTeams
      .filter(t => t.evaluation)
      .map(t => {
        const ev = t.evaluation!;
        const total = ev.creativity + ev.techCompletion + ev.feasibility + ev.teamwork + ev.ux;
        return {
          id: t.id,
          name: t.name,
          total,
          projectName: t.project?.name ?? '',
          projectDescription: t.project?.description ?? '',
          techStack: t.project?.techStack ?? [],
          judgeComment: ev.judgeComment,
          award: ev.award,
          creativity: ev.creativity,
          techCompletion: ev.techCompletion,
          feasibility: ev.feasibility,
          teamwork: ev.teamwork,
          ux: ev.ux,
          members: t.members
            .map(mid => participantMap[mid])
            .filter(Boolean)
            .map(p => ({ name: p.name, major: p.major })),
        };
      })
      .sort((a, b) => b.total - a.total);
  } else {
    // Mock 해커톤
    const participants = mockParticipants.filter(p => p.hackathonId === id);
    rankedTeams = mockTeams
      .filter(t => t.hackathonId === id && t.project?.evaluationScore)
      .map(t => {
        const s = t.project!.evaluationScore!;
        const total = s.creativity + s.techCompletion + s.feasibility + s.teamwork + s.ux;
        return {
          id: t.id,
          name: t.name,
          total,
          projectName: t.project?.name ?? '',
          projectDescription: t.project?.description ?? '',
          techStack: t.project?.techStack ?? [],
          judgeComment: s.judgeComment,
          award: s.award ?? null,
          creativity: s.creativity,
          techCompletion: s.techCompletion,
          feasibility: s.feasibility,
          teamwork: s.teamwork,
          ux: s.ux,
          members: participants
            .filter(p => t.members.includes(p.id))
            .map(p => ({ name: p.name, major: p.major })),
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  const awardedTeams = rankedTeams.filter(t => t.award);

  return (
    <div className="p-8 fade-in">
      {/* 브레드크럼 */}
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

      {/* 심사 데이터 없음 */}
      {rankedTeams.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100 mb-6">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-500 mb-1">아직 심사 결과가 없습니다.</p>
          <p className="text-slate-400 text-sm">팀/프로젝트 탭에서 심사 점수를 입력해주세요.</p>
        </div>
      )}

      {/* 랭킹 테이블 */}
      {rankedTeams.length > 0 && (
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
                {rankedTeams.map((team, rank) => (
                  <tr key={team.id} className={rank < 3 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 0 ? 'bg-yellow-400 text-white' :
                        rank === 1 ? 'bg-slate-400 text-white' :
                        rank === 2 ? 'bg-orange-400 text-white' : 'text-slate-500 text-sm'
                      }`}>{rank + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{team.name}</div>
                      <div className="text-xs text-slate-400">{team.projectName}</div>
                    </td>
                    {[team.creativity, team.techCompletion, team.feasibility, team.teamwork, team.ux].map((score, i) => (
                      <td key={i} className="px-3 py-3 text-center text-sm font-semibold text-blue-700">{score}</td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg font-bold text-blue-800">{team.total}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {team.award ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${awardBadge[team.award] ?? 'bg-slate-100 text-slate-600'}`}>
                          🏆 {team.award}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 수상팀 상세 카드 */}
      {awardedTeams.length > 0 && (
        <div className="grid grid-cols-2 gap-5">
          {awardedTeams.map(team => (
            <div key={team.id} className={`rounded-xl p-5 border-l-4 bg-white shadow-sm ${awardBorder[team.award!] ?? 'border-slate-300'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${awardBadge[team.award!] ?? 'bg-slate-100 text-slate-600'}`}>
                    🏆 {team.award}
                  </span>
                  <span className="font-bold text-slate-800">팀 {team.name}</span>
                </div>
                <span className="text-xl font-bold text-blue-700">{team.total}/100</span>
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">{team.projectName}</div>
              <div className="text-xs text-slate-500 mb-2">{team.projectDescription}</div>
              {team.judgeComment && (
                <div className="text-xs text-slate-500 mb-3 italic">"{team.judgeComment}"</div>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                {team.techStack.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {team.members.map((m, i) => (
                  <div key={i} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                    {m.name} ({m.major.slice(0, 4)})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
