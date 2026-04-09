import Link from 'next/link';
import { mockHackathons, mockParticipants } from '@/lib/mockData';
import { notFound } from 'next/navigation';

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hackathon = mockHackathons.find(h => h.id === id);
  if (!hackathon) notFound();

  const participants = mockParticipants.filter(p => p.hackathonId === id);

  // 통계
  const byGrade = [1,2,3,4].map(g => ({ grade: `${g}학년`, count: participants.filter(p => p.grade === g).length }));
  const byGender = { male: participants.filter(p => p.gender === '남성').length, female: participants.filter(p => p.gender === '여성').length };
  const diagnosed = participants.filter(p => p.preScore && p.postScore).length;

  const majorCategories: Record<string, number> = {};
  participants.forEach(p => { majorCategories[p.majorCategory] = (majorCategories[p.majorCategory] || 0) + 1; });

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <Link href={`/admin/hackathons/${id}`} className="hover:text-slate-800">{hackathon.name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">참가자 관리</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">참가자 관리</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-blue-600">{participants.length}명</div>
          <div className="text-sm text-slate-500 mt-1">총 참가자</div>
          <div className="text-xs text-slate-400">외부 {participants.filter(p => p.isExternal).length}명 포함</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-violet-600">{byGender.female}명</div>
          <div className="text-sm text-slate-500 mt-1">여성 참가자</div>
          <div className="text-xs text-slate-400">{Math.round(byGender.female/participants.length*100)}% 비율</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-emerald-600">{Object.keys(majorCategories).length}개</div>
          <div className="text-sm text-slate-500 mt-1">참가 전공 계열</div>
          <div className="text-xs text-slate-400">학과 다양성</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-orange-500">{diagnosed}명</div>
          <div className="text-sm text-slate-500 mt-1">역량 진단 완료</div>
          <div className="text-xs text-slate-400">{Math.round(diagnosed/participants.length*100)}% 완료율</div>
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
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${participants.length > 0 ? (g.count/participants.length*100) : 0}%` }}></div>
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
        </div>

        {/* 성별 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">성별 현황</h3>
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
            <div className="bg-blue-500 transition-all" style={{ width: `${Math.round(byGender.male/participants.length*100)}%` }}></div>
            <div className="bg-pink-400 flex-1"></div>
          </div>
        </div>
      </div>

      {/* 참가자 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">참가자 목록</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">CSV 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['이름', '학과', '학년', '성별', '팀', 'AI 역량 진단', '만족도 설문'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {participants.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.isExternal ? '외부 참가' : p.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.major}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.grade}학년</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.gender}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.teamId ? '팀 배정' : '미배정'}</td>
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
                    {p.surveyCompleted ? (
                      <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">완료</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">미완료</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
