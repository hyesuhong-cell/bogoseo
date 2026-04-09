import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';

export default function HackathonsPage() {
  return (
    <div className="p-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">해커톤 관리</h1>
          <p className="text-slate-500 mt-1">운영 중인 해커톤을 관리하고 성과를 추적하세요</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 해커톤 개설
        </button>
      </div>

      <div className="space-y-4">
        {mockHackathons.map(h => {
          const participants = mockParticipants.filter(p => p.hackathonId === h.id);
          const teams = mockTeams.filter(t => t.hackathonId === h.id);
          const diagnosedCount = participants.filter(p => p.preScore && p.postScore).length;

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
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span>🏫 {h.university}</span>
                    <span>📅 {h.startDate} ~ {h.endDate}</span>
                    <span>📍 {h.venue}</span>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{participants.length}</div>
                      <div className="text-xs text-slate-400">참가자</div>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
