import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import { listHackathons } from '@/lib/hackathonStore';
import { countParticipantsPerHackathon } from '@/lib/userStore';
import { auth } from '@/auth';
import HackathonManageActions from '@/components/HackathonManageActions';

export const dynamic = 'force-dynamic';

export default async function HackathonsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const university = (session?.user as { university?: string })?.university;

  // DB 해커톤 + mockData 병합
  const dbHackathons = await listHackathons(role === 'superadmin' ? undefined : university);

  const mockFiltered = role === 'superadmin'
    ? mockHackathons
    : mockHackathons.filter(h => h.university === university);

  // DB에 없는 mock 해커톤만 추가 (id 기준)
  const dbIds = new Set(dbHackathons.map(h => h.id));
  const mockOnly = mockFiltered.filter(h => !dbIds.has(h.id));

  // 통합 목록 (DB 우선, mock 후)
  const allHackathons = [
    ...dbHackathons.map(h => ({ ...h, theme: h.theme ?? '', venue: h.venue ?? '', isDb: true })),
    ...mockOnly.map(h => ({ ...h, theme: (h as { theme?: string }).theme ?? '', venue: h.venue ?? '', isDb: false })),
  ];

  // DB 해커톤별 참가자 수
  const dbParticipantCounts = await countParticipantsPerHackathon(dbHackathons.map(h => h.id));

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">해커톤 관리</h1>
          <p className="text-slate-500 mt-1">
            {role === 'superadmin'
              ? `전체 ${allHackathons.length}건`
              : `${university ?? ''} · ${allHackathons.length}건`}
          </p>
        </div>
        <Link
          href="/admin/hackathons/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 해커톤 개설
        </Link>
      </div>

      {allHackathons.length === 0 ? (
        <div className="bg-white rounded-xl p-16 shadow-sm border border-slate-100 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-slate-500 font-medium">담당 대학의 해커톤이 없습니다.</p>
          <p className="text-slate-400 text-sm mt-1">위의 버튼으로 첫 해커톤을 개설해보세요.</p>
          <Link
            href="/admin/hackathons/new"
            className="inline-block mt-5 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            첫 해커톤 개설하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allHackathons.map(h => {
            const mockParticipantCount = mockParticipants.filter(p => p.hackathonId === h.id).length;
            const dbParticipantCount = dbParticipantCounts[h.id] ?? 0;
            const totalParticipants = mockParticipantCount + dbParticipantCount;

            const teams = mockTeams.filter(t => t.hackathonId === h.id);
            const diagnosedCount = mockParticipants
              .filter(p => p.hackathonId === h.id && p.preScore && p.postScore).length;

            return (
              <div key={h.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-slate-900">{h.name}</h2>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        h.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        h.status === 'ongoing' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {h.status === 'completed' ? '완료' : h.status === 'ongoing' ? '진행중' : '예정'}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        {h.category}
                      </span>
                      {h.isDb && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium border border-blue-100">
                          DB
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span>🏫 {h.university}</span>
                      <span>📅 {h.startDate} ~ {h.endDate}</span>
                      {h.venue && <span>📍 {h.venue}</span>}
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{totalParticipants}</div>
                        <div className="text-xs text-slate-400">참가자</div>
                        {dbParticipantCount > 0 && (
                          <div className="text-xs text-blue-400">초대 {dbParticipantCount}명</div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-violet-600">{teams.length}</div>
                        <div className="text-xs text-slate-400">팀</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-emerald-600">{diagnosedCount}</div>
                        <div className="text-xs text-slate-400">진단 완료</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-500">{h.tracks.length}</div>
                        <div className="text-xs text-slate-400">트랙</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    <Link href={`/admin/hackathons/${h.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center">
                      상세 보기
                    </Link>
                    <Link href={`/admin/hackathons/${h.id}/report`} className="border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors text-center">
                      성과 리포트
                    </Link>
                    {role === 'superadmin' && (
                      <HackathonManageActions hackathon={h} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
