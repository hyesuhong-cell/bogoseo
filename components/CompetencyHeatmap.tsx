'use client';
import { useState } from 'react';

interface ParticipantCompetency {
  id: string;
  name: string;
  level: number;
  scores: {
    understanding: number;
    toolUsage: number;
    problemSolving: number;
    collaboration: number;
    ethics: number;
  };
}

interface CompetencyHeatmapProps {
  participants: ParticipantCompetency[];
  type: 'pre' | 'post';
}

const COMPETENCY_LABELS = {
  understanding: 'AI 이해도',
  toolUsage: '도구 활용',
  problemSolving: '문제 해결',
  collaboration: '협업',
  ethics: '윤리 판단',
};

const getLevelLabel = (avgScore: number): string => {
  if (avgScore >= 4.5) return 'Lv.5 전문가';
  if (avgScore >= 3.5) return 'Lv.4 숙련자';
  if (avgScore >= 2.5) return 'Lv.3 중급자';
  if (avgScore >= 1.5) return 'Lv.2 초급자';
  return 'Lv.1 입문자';
};

const getScoreColor = (score: number): string => {
  if (score >= 4.5) return 'bg-emerald-600';
  if (score >= 3.5) return 'bg-blue-500';
  if (score >= 2.5) return 'bg-yellow-500';
  if (score >= 1.5) return 'bg-orange-400';
  return 'bg-red-400';
};

const getScoreOpacity = (score: number): string => {
  const opacity = Math.min(100, Math.max(10, (score / 5) * 100));
  return `opacity-${Math.round(opacity / 10) * 10}`;
};

export default function CompetencyHeatmap({ participants, type }: CompetencyHeatmapProps) {
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'understanding' | 'toolUsage' | 'problemSolving' | 'collaboration' | 'ethics'>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  // Sort participants
  const sortedParticipants = [...participants].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name, 'ko');
    } else if (sortBy === 'level') {
      comparison = a.level - b.level;
    } else {
      comparison = a.scores[sortBy] - b.scores[sortBy];
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter by level
  const filteredParticipants = filterLevel 
    ? sortedParticipants.filter(p => p.level === filterLevel)
    : sortedParticipants;

  // Calculate level distribution
  const levelDistribution = [1, 2, 3, 4, 5].map(level => ({
    level,
    count: participants.filter(p => p.level === level).length,
    percentage: (participants.filter(p => p.level === level).length / participants.length) * 100,
  }));

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Distribution Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          {type === 'pre' ? '사전' : '사후'} 역량 레벨 분포
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {levelDistribution.map(({ level, count, percentage }) => (
            <button
              key={level}
              onClick={() => setFilterLevel(filterLevel === level ? null : level)}
              className={`rounded-lg p-3 text-center transition-all ${
                filterLevel === level 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-white hover:bg-blue-50'
              }`}
            >
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Lv.{level}
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                filterLevel === level ? 'text-white' : 'text-blue-600'
              }`}>
                {count}명
              </div>
              <div className={`text-xs ${
                filterLevel === level ? 'text-blue-100' : 'text-slate-400'
              }`}>
                {percentage.toFixed(1)}%
              </div>
            </button>
          ))}
        </div>
        {filterLevel && (
          <button
            onClick={() => setFilterLevel(null)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            ✕ 필터 해제
          </button>
        )}
      </div>

      {/* Heatmap Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="sticky left-0 bg-slate-50 z-10">
                  <button
                    onClick={() => handleSort('name')}
                    className="w-full text-left px-4 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    참가자
                    {sortBy === 'name' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('level')}
                    className="w-full text-center px-3 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"
                  >
                    종합 레벨
                    {sortBy === 'level' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                {Object.entries(COMPETENCY_LABELS).map(([key, label]) => (
                  <th key={key}>
                    <button
                      onClick={() => handleSort(key as any)}
                      className="w-full text-center px-3 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"
                    >
                      {label}
                      {sortBy === key && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="sticky left-0 bg-white px-4 py-3 font-medium text-sm text-slate-800 border-r border-slate-100">
                    {participant.name}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                      participant.level >= 4 ? 'bg-emerald-100 text-emerald-700' :
                      participant.level >= 3 ? 'bg-blue-100 text-blue-700' :
                      participant.level >= 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      Lv.{participant.level}
                    </span>
                  </td>
                  {Object.keys(COMPETENCY_LABELS).map((key) => {
                    const score = participant.scores[key as keyof typeof participant.scores];
                    return (
                      <td key={key} className="px-3 py-3">
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-12 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${getScoreColor(score)}`}
                            style={{ opacity: 0.2 + (score / 5) * 0.8 }}
                            title={`${score.toFixed(1)}/5.0`}
                          >
                            {score.toFixed(1)}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <span className="text-slate-500 font-semibold">점수 범위:</span>
        {[
          { label: '5.0 (전문가)', color: 'bg-emerald-600' },
          { label: '4.0', color: 'bg-blue-500' },
          { label: '3.0 (중급)', color: 'bg-yellow-500' },
          { label: '2.0', color: 'bg-orange-400' },
          { label: '1.0 (입문)', color: 'bg-red-400' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-4 rounded ${color}`}></div>
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
