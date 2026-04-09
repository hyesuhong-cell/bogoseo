'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

interface UniversityBenchmark {
  university: string;
  participantCount: number;
  avgPreScore: number;
  avgPostScore: number;
  growthRate: number;
  satisfaction: number;
  nps: number;
  projectSubmitRate: number;
}

interface BenchmarkComparisonProps {
  currentUniversity: UniversityBenchmark;
  benchmarkData: UniversityBenchmark[];
}

const METRICS = [
  { key: 'avgPreScore', label: '사전 역량', unit: '점', color: '#94A3B8' },
  { key: 'avgPostScore', label: '사후 역량', unit: '점', color: '#3B82F6' },
  { key: 'growthRate', label: '성장률', unit: '%', color: '#10B981' },
  { key: 'satisfaction', label: '만족도', unit: '점', color: '#F59E0B' },
  { key: 'nps', label: 'NPS', unit: '점', color: '#8B5CF6' },
  { key: 'projectSubmitRate', label: '제출률', unit: '%', color: '#EC4899' },
];

export default function BenchmarkComparison({ currentUniversity, benchmarkData }: BenchmarkComparisonProps) {
  const allUniversities = [currentUniversity, ...benchmarkData];
  
  // Calculate averages
  const averages = {
    avgPreScore: benchmarkData.reduce((sum, u) => sum + u.avgPreScore, 0) / benchmarkData.length,
    avgPostScore: benchmarkData.reduce((sum, u) => sum + u.avgPostScore, 0) / benchmarkData.length,
    growthRate: benchmarkData.reduce((sum, u) => sum + u.growthRate, 0) / benchmarkData.length,
    satisfaction: benchmarkData.reduce((sum, u) => sum + u.satisfaction, 0) / benchmarkData.length,
    nps: benchmarkData.reduce((sum, u) => sum + u.nps, 0) / benchmarkData.length,
    projectSubmitRate: benchmarkData.reduce((sum, u) => sum + u.projectSubmitRate, 0) / benchmarkData.length,
  };

  // Comparison data for bar chart
  const comparisonData = METRICS.map(metric => ({
    name: metric.label,
    [currentUniversity.university]: currentUniversity[metric.key as keyof UniversityBenchmark],
    '참여 대학 평균': averages[metric.key as keyof typeof averages],
    unit: metric.unit,
  }));

  // Radar chart data
  const radarData = METRICS.map(metric => ({
    subject: metric.label,
    [currentUniversity.university]: currentUniversity[metric.key as keyof UniversityBenchmark],
    '평균': averages[metric.key as keyof typeof averages],
    fullMark: metric.key === 'growthRate' || metric.key === 'projectSubmitRate' ? 100 : 5,
  }));

  // Ranking
  const rankings = METRICS.map(metric => {
    const sorted = [...allUniversities].sort((a, b) => 
      (b[metric.key as keyof UniversityBenchmark] as number) - (a[metric.key as keyof UniversityBenchmark] as number)
    );
    const rank = sorted.findIndex(u => u.university === currentUniversity.university) + 1;
    const total = allUniversities.length;
    const value = currentUniversity[metric.key as keyof UniversityBenchmark];
    const avg = averages[metric.key as keyof typeof averages];
    const diff = ((value as number) - avg) / avg * 100;
    
    return {
      ...metric,
      rank,
      total,
      value,
      avg,
      diff,
      isAboveAverage: (value as number) > avg,
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-3">
        {rankings.map((metric) => (
          <div
            key={metric.key}
            className={`rounded-xl p-4 text-center border-2 ${
              metric.isAboveAverage
                ? 'bg-blue-50 border-blue-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-semibold text-slate-500 mb-1">
              {metric.label}
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              metric.isAboveAverage ? 'text-blue-700' : 'text-slate-600'
            }`}>
              {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
              <span className="text-sm font-normal text-slate-400">{metric.unit}</span>
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className={`text-xs font-bold ${
                metric.isAboveAverage ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {metric.isAboveAverage ? '↑' : '↓'} {Math.abs(metric.diff).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {metric.rank}위 / {metric.total}개교
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart Comparison */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            우리 대학 vs 참여 대학 평균 비교
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `${Number(value || 0).toFixed(1)}${props.payload.unit}`,
                  name
                ]}
              />
              <Legend />
              <Bar dataKey={currentUniversity.university} fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="참여 대학 평균" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            종합 역량 벤치마크 (레이더)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} tick={{ fontSize: 9 }} />
              <Radar
                name={currentUniversity.university}
                dataKey={currentUniversity.university}
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.5}
              />
              <Radar
                name="평균"
                dataKey="평균"
                stroke="#94A3B8"
                fill="#94A3B8"
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">
                  대학명
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">
                  참가자 수
                </th>
                {METRICS.map(metric => (
                  <th key={metric.key} className="text-center px-3 py-3 text-xs font-semibold text-slate-600">
                    {metric.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUniversities
                .sort((a, b) => b.avgPostScore - a.avgPostScore)
                .map((university, index) => {
                  const isCurrent = university.university === currentUniversity.university;
                  return (
                    <tr
                      key={university.university}
                      className={`${
                        isCurrent
                          ? 'bg-blue-50 font-semibold'
                          : 'hover:bg-slate-50'
                      } transition-colors`}
                    >
                      <td className={`px-4 py-3 text-sm ${
                        isCurrent ? 'text-blue-700 font-bold' : 'text-slate-700'
                      }`}>
                        {isCurrent && '★ '}
                        {university.university}
                        {index === 0 && !isCurrent && ' 🏆'}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-slate-600">
                        {university.participantCount}명
                      </td>
                      {METRICS.map(metric => (
                        <td key={metric.key} className="px-3 py-3 text-center">
                          <span className={`text-sm ${
                            isCurrent ? 'text-blue-700 font-bold' : 'text-slate-700'
                          }`}>
                            {(university[metric.key as keyof UniversityBenchmark] as number).toFixed(1)}
                            {metric.unit}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              {/* Average row */}
              <tr className="bg-slate-100 font-semibold">
                <td className="px-4 py-3 text-sm text-slate-700">
                  전체 평균
                </td>
                <td className="px-3 py-3 text-center text-sm text-slate-600">
                  {Math.round(benchmarkData.reduce((sum, u) => sum + u.participantCount, 0) / benchmarkData.length)}명
                </td>
                {METRICS.map(metric => (
                  <td key={metric.key} className="px-3 py-3 text-center text-sm text-slate-700">
                    {averages[metric.key as keyof typeof averages].toFixed(1)}
                    {metric.unit}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
          <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <span>💪</span> 강점 영역
          </h4>
          <div className="space-y-1">
            {rankings
              .filter(r => r.isAboveAverage)
              .slice(0, 3)
              .map(r => (
                <div key={r.key} className="text-xs text-emerald-700">
                  • {r.label}: {r.rank}위 (평균 대비 +{r.diff.toFixed(1)}%)
                </div>
              ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-500">
          <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
            <span>📊</span> 개선 필요 영역
          </h4>
          <div className="space-y-1">
            {rankings
              .filter(r => !r.isAboveAverage)
              .slice(0, 3)
              .map(r => (
                <div key={r.key} className="text-xs text-amber-700">
                  • {r.label}: {r.rank}위 (평균 대비 {r.diff.toFixed(1)}%)
                </div>
              ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
          <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <span>🎯</span> 종합 평가
          </h4>
          <div className="space-y-1 text-xs text-blue-700">
            <div>• 전체 순위: {rankings[0].rank}위 / {rankings[0].total}개교</div>
            <div>• 평균 이상 지표: {rankings.filter(r => r.isAboveAverage).length}개 / {rankings.length}개</div>
            <div>
              • 종합 점수: {
                (rankings.reduce((sum, r) => sum + (r.isAboveAverage ? 1 : 0), 0) / rankings.length * 100).toFixed(0)
              }점
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
