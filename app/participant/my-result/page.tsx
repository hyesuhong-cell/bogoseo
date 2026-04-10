'use client';
import Link from 'next/link';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockParticipants, mockTeams, mockFollowUps } from '@/lib/mockData';

// 예시: 김민준 참가자 (p001) 기준
const PARTICIPANT_ID = 'p001';

const categoryLabels: Record<string, string> = {
  understanding: 'AI 이해도',
  toolUsage: '도구 활용',
  problemSolving: '문제 해결',
  collaboration: '협업',
  ethics: '윤리 판단',
};

export default function MyResultPage() {
  const participant = mockParticipants.find(p => p.id === PARTICIPANT_ID);
  const team = participant?.teamId ? mockTeams.find(t => t.id === participant.teamId) : null;
  const followUp = mockFollowUps.find(f => f.participantId === PARTICIPANT_ID);

  if (!participant?.preScore || !participant?.postScore) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-xl font-bold text-slate-700 mb-2">아직 진단이 완료되지 않았습니다</h1>
        <p className="text-slate-400 text-sm mb-6">사전/사후 AI 역량 진단을 모두 완료하면 성장 리포트를 확인할 수 있습니다</p>
        <div className="flex gap-3 justify-center">
          <Link href="/participant/diagnosis/pre" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
            사전 진단하기
          </Link>
          <Link href="/participant/diagnosis/post" className="border border-blue-200 text-blue-600 px-5 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition-colors text-sm">
            사후 진단하기
          </Link>
        </div>
      </div>
    );
  }

  const pre = participant.preScore;
  const post = participant.postScore;

  const categories = ['understanding', 'toolUsage', 'problemSolving', 'collaboration', 'ethics'] as const;

  const preAvg = +(categories.reduce((s, k) => s + pre[k], 0) / categories.length).toFixed(2);
  const postAvg = +(categories.reduce((s, k) => s + post[k], 0) / categories.length).toFixed(2);
  const growthPct = Math.round(((postAvg - preAvg) / preAvg) * 100);

  const radarData = categories.map(k => ({
    subject: categoryLabels[k],
    사전: pre[k],
    사후: post[k],
    fullMark: 5,
  }));

  const barData = categories.map(k => ({
    name: categoryLabels[k],
    사전: pre[k],
    사후: post[k],
    성장: +(post[k] - pre[k]).toFixed(1),
  }));

  // 가장 많이 성장한 영역
  const topGrowth = categories.reduce((best, k) =>
    (post[k] - pre[k]) > (post[best] - pre[best]) ? k : best, categories[0]
  );

  // 가장 강한 영역 (사후 기준)
  const strongArea = categories.reduce((best, k) => post[k] > post[best] ? k : best, categories[0]);

  return (
    <div className="max-w-3xl mx-auto fade-in">
      {/* 헤더 */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <Link href="/participant" className="hover:text-slate-800">대시보드</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">나의 AI 역량 성장 리포트</span>
      </div>

      {/* 참가자 카드 */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-7 mb-6 text-white">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {participant.name[0]}
          </div>
          <div>
            <div className="text-xl font-bold">{participant.name}</div>
            <div className="text-blue-200 text-sm">{participant.major} {participant.grade}학년 · {team?.name ? `팀 ${team.name}` : ''}</div>
          </div>
        </div>

        {/* 핵심 성과 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-200 mb-1">사전 평균</div>
            <div className="text-3xl font-bold">{preAvg}<span className="text-sm font-normal">/5</span></div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-200 mb-1">사후 평균</div>
            <div className="text-3xl font-bold text-emerald-300">{postAvg}<span className="text-sm font-normal">/5</span></div>
          </div>
          <div className="bg-emerald-500/30 rounded-xl p-4 text-center">
            <div className="text-xs text-emerald-200 mb-1">AI 역량 성장률</div>
            <div className="text-3xl font-bold text-emerald-300">+{growthPct}%</div>
          </div>
        </div>
      </div>

      {/* 성장 하이라이트 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-xs font-semibold text-emerald-600 mb-1">가장 많이 성장한 영역</div>
          <div className="text-xl font-bold text-slate-800">{categoryLabels[topGrowth]}</div>
          <div className="text-sm text-slate-500 mt-1">
            {pre[topGrowth]} → {post[topGrowth]}점
            <span className="text-emerald-600 font-bold ml-2">+{(post[topGrowth] - pre[topGrowth]).toFixed(1)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="text-xs font-semibold text-blue-600 mb-1">가장 강한 역량 영역</div>
          <div className="text-xl font-bold text-slate-800">{categoryLabels[strongArea]}</div>
          <div className="text-sm text-slate-500 mt-1">
            현재 <span className="text-blue-600 font-bold">{post[strongArea]}/5.0</span>점
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* 레이더 차트 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 text-sm mb-4">5개 영역 비교 (레이더)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar name="사전" dataKey="사전" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} />
              <Radar name="사후" dataKey="사후" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 막대 차트 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 text-sm mb-4">사전/사후 점수 비교</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="사전" fill="#CBD5E1" radius={[3,3,0,0]} />
              <Bar dataKey="사후" fill="#3B82F6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 영역별 상세 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="font-bold text-slate-800 mb-5">영역별 상세 결과</h3>
        <div className="space-y-5">
          {categories.map(k => {
            const preVal = pre[k];
            const postVal = post[k];
            const growth = +(postVal - preVal).toFixed(1);
            const growthPctItem = preVal > 0 ? Math.round((growth / preVal) * 100) : 0;
            return (
              <div key={k}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 text-sm">{categoryLabels[k]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{preVal} → {postVal}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {growth >= 0 ? '+' : ''}{growth} ({growthPctItem >= 0 ? '+' : ''}{growthPctItem}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 text-right text-xs text-slate-400">사전 {preVal}</div>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-slate-300 rounded-full" style={{ width: `${(preVal / 5) * 100}%` }}></div>
                    <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${(postVal / 5) * 100}%`, opacity: 0.8 }}></div>
                  </div>
                  <div className="w-12 text-xs font-bold text-blue-600">사후 {postVal}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 프로젝트 성과 */}
      {team?.project && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">참여 프로젝트</h3>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-slate-800">{team.project.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">팀 {team.name}</div>
              </div>
              {team.project.evaluationScore?.award && (
                <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">🏆 {team.project.evaluationScore.award}</span>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">{team.project.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {team.project.techStack.map(t => (
                <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{t}</span>
              ))}
            </div>
            {team.project.evaluationScore && (
              <div className="text-sm font-bold text-blue-700">
                심사 점수: {
                  team.project.evaluationScore.creativity +
                  team.project.evaluationScore.techCompletion +
                  team.project.evaluationScore.feasibility +
                  team.project.evaluationScore.teamwork +
                  team.project.evaluationScore.ux
                } / 100점
              </div>
            )}
          </div>
        </div>
      )}

      {/* 후속 성과 */}
      {followUp && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">후속 성과 ({followUp.period} 팔로업)</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: '개발 지속', value: followUp.continuedDevelopment },
              { label: '창업 연계', value: followUp.startupConnected },
              { label: '특허 출원', value: followUp.patentFiled },
              { label: '대외 수상', value: followUp.externalAward },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-3 text-center ${item.value ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <div className="text-xl mb-1">{item.value ? '✅' : '—'}</div>
                <div className={`text-xs font-medium ${item.value ? 'text-emerald-700' : 'text-slate-400'}`}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 italic">
            "{followUp.currentStatus}"
          </div>
        </div>
      )}

      {/* 다음 단계 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
        <h3 className="font-bold text-slate-800 mb-3">📌 성장을 위한 다음 단계</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🎯', title: 'AI 프로젝트 심화', desc: '해커톤 아이디어를 발전시켜 실제 서비스로 만들어보세요' },
            { icon: '📚', title: '역량 강화 학습', desc: `${categoryLabels[topGrowth]} 외 부족한 영역을 집중 학습하세요` },
            { icon: '🚀', title: '다음 해커톤 참가', desc: '더 높은 수준으로 성장한 역량을 검증해보세요' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-slate-700 text-sm mb-1">{item.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
