'use client';
import Link from 'next/link';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const categoryLabels: Record<string, string> = {
  aiUnderstanding: 'AI 이해도',
  toolUsage: '도구 활용',
  problemSolving: '문제 해결',
  collaboration: '협업',
  ethics: '윤리 판단',
};

const categories = ['aiUnderstanding', 'toolUsage', 'problemSolving', 'collaboration', 'ethics'] as const;
type Category = typeof categories[number];

interface ScoreMap {
  aiUnderstanding: number;
  toolUsage: number;
  problemSolving: number;
  collaboration: number;
  ethics: number;
}

interface TeamInfo {
  name: string;
  projectName: string;
  projectDescription: string;
  techStack: string[];
  award: string | null;
  evaluationTotal: number | null;
}

interface Props {
  name: string;
  major: string;
  grade: number;
  teamInfo: TeamInfo | null;
  pre: ScoreMap;
  post: ScoreMap;
}

export default function MyResultClient({ name, major, grade, teamInfo, pre, post }: Props) {
  const preAvg = +(categories.reduce((s, k) => s + pre[k], 0) / categories.length).toFixed(2);
  const postAvg = +(categories.reduce((s, k) => s + post[k], 0) / categories.length).toFixed(2);
  const growthPct = preAvg > 0 ? Math.round(((postAvg - preAvg) / preAvg) * 100) : 0;

  const topGrowth = categories.reduce<Category>(
    (best, k) => (post[k] - pre[k]) > (post[best] - pre[best]) ? k : best,
    categories[0]
  );
  const strongArea = categories.reduce<Category>(
    (best, k) => post[k] > post[best] ? k : best,
    categories[0]
  );

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
  }));

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
            {name[0] ?? '?'}
          </div>
          <div>
            <div className="text-xl font-bold">{name}</div>
            <div className="text-blue-200 text-sm">
              {[major, grade ? `${grade}학년` : '', teamInfo?.name ? `팀 ${teamInfo.name}` : ''].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

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
            <div className="text-3xl font-bold text-emerald-300">{growthPct >= 0 ? '+' : ''}{growthPct}%</div>
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
      {teamInfo && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">참여 프로젝트</h3>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-slate-800">{teamInfo.projectName || '(프로젝트명 미입력)'}</div>
                <div className="text-xs text-slate-400 mt-0.5">팀 {teamInfo.name}</div>
              </div>
              {teamInfo.award && (
                <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">🏆 {teamInfo.award}</span>
              )}
            </div>
            {teamInfo.projectDescription && (
              <p className="text-sm text-slate-600 mb-3">{teamInfo.projectDescription}</p>
            )}
            {teamInfo.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {teamInfo.techStack.map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{t}</span>
                ))}
              </div>
            )}
            {teamInfo.evaluationTotal !== null && (
              <div className="text-sm font-bold text-blue-700">심사 점수: {teamInfo.evaluationTotal} / 100점</div>
            )}
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
