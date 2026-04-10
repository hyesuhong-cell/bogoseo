'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

interface ReportChartsProps {
  data: {
    preScores?: Record<string, number>;
    postScores?: Record<string, number>;
    gradeData?: { grade: string; count: number }[];
    majorData?: { name: string; value: number }[];
    trackData?: { name: string; teams: number }[];
    satisfactionData?: { label: string; avg: number }[];
  };
  section: 'participation' | 'diagnosis' | 'projects';
  preScores?: Record<string, number>;
  postScores?: Record<string, number>;
}

const labelMap: Record<string, string> = {
  understanding: 'AI 이해도',
  toolUsage: '도구 활용',
  problemSolving: '문제 해결',
  collaboration: '협업',
  ethics: '윤리 판단',
};

export default function ReportCharts({ data, section, preScores, postScores }: ReportChartsProps) {
  if (section === 'participation') {
    return (
      <div className="grid grid-cols-2 gap-6">
        {/* 학년별 막대 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">학년별 참가 현황</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.gradeData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="참가자 수" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 전공 계열 파이 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">전공 계열 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.majorData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, percent }) => `${(name || '').replace('공학(', '').replace(')', '')} ${((percent || 0)*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {data.majorData?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (section === 'diagnosis' && preScores && postScores) {
    const radarData = Object.keys(preScores).map(key => ({
      subject: labelMap[key] || key,
      사전: preScores[key],
      사후: postScores[key],
      fullMark: 5,
    }));

    const barData = Object.keys(preScores).map(key => ({
      name: labelMap[key] || key,
      사전: preScores[key],
      사후: postScores[key],
    }));

    return (
      <div className="grid grid-cols-2 gap-6">
        {/* 레이더 차트 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">AI 역량 5개 영역 비교 (레이더)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar name="사전" dataKey="사전" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} />
              <Radar name="사후" dataKey="사후" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 영역별 막대 비교 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">사전/사후 점수 비교 (막대)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="사전" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="사후" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (section === 'projects') {
    return (
      <div className="grid grid-cols-2 gap-6">
        {/* 트랙별 팀 분포 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">트랙별 프로젝트 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.trackData} barSize={32} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="teams" name="팀 수" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 만족도 막대 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">항목별 만족도 (5점 척도)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.satisfactionData} barSize={20} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="avg" name="평균" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}
