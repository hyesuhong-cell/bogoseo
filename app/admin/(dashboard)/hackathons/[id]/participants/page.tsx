import Link from 'next/link';
import { mockHackathons, mockParticipants } from '@/lib/mockData';
import { getHackathon } from '@/lib/hackathonStore';
import { listParticipantsByHackathon } from '@/lib/userStore';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 해커톤 조회 (mock → DB)
  const mockH = mockHackathons.find(h => h.id === id);
  const dbH = mockH ? null : await getHackathon(id);
  const hackathon = mockH ?? dbH;
  if (!hackathon) notFound();

  // 참가자 조회: mockData + DB 병합
  const mockList = mockParticipants.filter(p => p.hackathonId === id);
  const dbList = await listParticipantsByHackathon(id);

  // DB 참가자를 표준 형식으로 변환
  const dbFormatted = dbList.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    major: u.major,
    majorCategory: u.major,
    grade: u.grade,
    gender: u.gender || '-',
    teamId: null as string | null,
    isExternal: false,
    preScore: null as number | null,
    postScore: null as number | null,
    surveyCompleted: false,
    studentId: u.studentId,
    isFromDb: true,
  }));

  const mockFormatted = mockList.map(p => ({ ...p, isFromDb: false, studentId: p.studentId ?? '' }));

  // mock에 없는 DB 참가자만 추가
  const mockIds = new Set(mockList.map(p => p.id));
  const newDbOnly = dbFormatted.filter(p => !mockIds.has(p.id));
  const participants = [...mockFormatted, ...newDbOnly];

  // 통계
  const byGrade = [1, 2, 3, 4].map(g => ({
    grade: `${g}학년`,
    count: participants.filter(p => p.grade === g).length,
  }));
  const byGender = {
    male: participants.filter(p => p.gender === '남성').length,
    female: participants.filter(p => p.gender === '여성').length,
  };
  const diagnosed = participants.filter(p => p.preScore && p.postScore).length;

  const majorCategories: Record<string, number> = {};
  participants.forEach(p => {
    const cat = (p as { majorCategory?: string }).majorCategory ?? p.major ?? '기타';
    majorCategories[cat] = (majorCategories[cat] || 0) + 1;
  });

  const total = participants.length;

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <Link href={`/admin/hackathons/${id}`} className="hover:text-slate-800">{hackathon.name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">참가자 관리</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">참가자 관리</h1>
        {dbList.length > 0 && (
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
            초대 가입 {dbList.length}명 포함
          </span>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-blue-600">{total}명</div>
          <div className="text-sm text-slate-500 mt-1">총 참가자</div>
          <div className="text-xs text-slate-400">초대 가입 {dbList.length}명</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-violet-600">{byGender.female}명</div>
          <div className="text-sm text-slate-500 mt-1">여성 참가자</div>
          <div className="text-xs text-slate-400">{total > 0 ? Math.round(byGender.female / total * 100) : 0}% 비율</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-emerald-600">{Object.keys(majorCategories).length}개</div>
          <div className="text-sm text-slate-500 mt-1">참가 전공 계열</div>
          <div className="text-xs text-slate-400">학과 다양성</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-orange-500">{diagnosed}명</div>
          <div className="text-sm text-slate-500 mt-1">역량 진단 완료</div>
          <div className="text-xs text-slate-400">{total > 0 ? Math.round(diagnosed / total * 100) : 0}% 완료율</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* 학년별 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">학년별 참가 현황</h3>
          {byGrade.map(g => (
            <div key={g.grade} className="flex items-center gap-3 mb-3">
              <span className="text-sm text-slate-500 w-12">{g.grade}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${total > 0 ? (g.count / total * 100) : 0}%` }}></div>
              </div>
              <span className="text-sm font-bold text-slate-700 w-8 text-right">{g.count}</span>
            </div>
          ))}
        </div>

        {/* 전공 계열 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">전공 계열별</h3>
          {Object.entries(majorCategories).map(([cat, cnt]) => (
            <div key={cat} className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 truncate">{cat}</span>
              <span className="text-sm font-bold text-slate-700 ml-2">{cnt}명</span>
            </div>
          ))}
          {Object.keys(majorCategories).length === 0 && (
            <p className="text-sm text-slate-400">데이터 없음</p>
          )}
        </div>

        {/* 성별 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">성별 현황</h3>
          {byGender.male + byGender.female > 0 ? (
            <>
              <div className="flex items-center justify-center gap-8 h-20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{byGender.male}</div>
                  <div className="text-sm text-slate-400 mt-1">남성</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-500">{byGender.female}</div>
                  <div className="text-sm text-slate-400 mt-1">여성</div>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-blue-500 transition-all" style={{ width: `${Math.round(byGender.male / (byGender.male + byGender.female) * 100)}%` }}></div>
                <div className="bg-pink-400 flex-1"></div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 pt-6 text-center">성별 데이터 없음</p>
          )}
        </div>
      </div>

      {/* 참가자 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">참가자 목록 ({total}명)</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">CSV 내보내기</button>
        </div>
        {total === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-slate-500 text-sm">아직 참가자가 없습니다.</p>
            <p className="text-slate-400 text-xs mt-1">초대 링크를 공유해 참가자를 모집하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {['이름', '학번', '학과', '학년', '팀', 'AI 역량 진단', '만족도 설문', '가입 경로'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {participants.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 text-sm">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.studentId || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.major}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.grade}학년</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {(p as { teamId?: string | null }).teamId ? '팀 배정' : '미배정'}
                    </td>
                    <td className="px-4 py-3">
                      {p.preScore && p.postScore ? (
                        <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">완료</span>
                      ) : p.preScore ? (
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">사전만</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">미완료</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(p as { surveyCompleted?: boolean }).surveyCompleted ? (
                        <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">완료</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">미완료</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.isFromDb ? (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">초대 링크</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">데모</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
