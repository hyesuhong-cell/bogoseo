import { supabase } from './db/supabase';

export interface DiagnosisScores {
  aiUnderstanding: number;
  toolUsage: number;
  problemSolving: number;
  collaboration: number;
  ethics: number;
}

export interface DiagnosisResult {
  id: string;
  participantId: string;
  hackathonId: string;
  type: 'pre' | 'post';
  scores: DiagnosisScores;
  totalScore: number;
  completedAt: string;
}

export async function saveDiagnosisResult(data: Omit<DiagnosisResult, 'id' | 'completedAt' | 'totalScore'>) {
  const id = `diag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const totalScore = Object.values(data.scores).reduce((a, b) => a + b, 0) / 5;

  const { error } = await supabase.from('diagnosis_results').upsert({
    id,
    participant_id: data.participantId,
    hackathon_id: data.hackathonId,
    type: data.type,
    scores: data.scores,
    total_score: Math.round(totalScore * 10) / 10,
  }, { onConflict: 'participant_id,hackathon_id,type' });

  if (error) throw new Error(error.message);
  return { id, totalScore };
}

export async function getDiagnosisResult(
  participantId: string,
  hackathonId: string,
  type: 'pre' | 'post'
): Promise<DiagnosisResult | null> {
  const { data } = await supabase
    .from('diagnosis_results')
    .select('*')
    .eq('participant_id', participantId)
    .eq('hackathon_id', hackathonId)
    .eq('type', type)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    participantId: data.participant_id,
    hackathonId: data.hackathon_id,
    type: data.type,
    scores: data.scores,
    totalScore: data.total_score,
    completedAt: data.completed_at,
  };
}

export async function getParticipantDiagnosis(participantId: string, hackathonId: string) {
  const { data } = await supabase
    .from('diagnosis_results')
    .select('*')
    .eq('participant_id', participantId)
    .eq('hackathon_id', hackathonId);

  const pre = data?.find(d => d.type === 'pre');
  const post = data?.find(d => d.type === 'post');
  return { pre, post };
}

export interface DiagnosisAggStats {
  diagnosedCount: number;
  preAvg: DiagnosisScores | null;
  postAvg: DiagnosisScores | null;
}

// 해커톤의 참가자별 사전/사후 진단 점수 반환 (리포트용)
export interface ParticipantDiagnosis {
  participantId: string;
  pre: DiagnosisScores | null;
  post: DiagnosisScores | null;
}

export async function getHackathonParticipantDiagnoses(hackathonId: string): Promise<ParticipantDiagnosis[]> {
  const { data } = await supabase
    .from('diagnosis_results')
    .select('participant_id, type, scores')
    .eq('hackathon_id', hackathonId);

  if (!data || data.length === 0) return [];

  const map = new Map<string, ParticipantDiagnosis>();
  data.forEach(row => {
    if (!map.has(row.participant_id)) {
      map.set(row.participant_id, { participantId: row.participant_id, pre: null, post: null });
    }
    const entry = map.get(row.participant_id)!;
    const s = row.scores as Record<string, number>;
    const scores: DiagnosisScores = {
      aiUnderstanding: s.aiUnderstanding ?? 0,
      toolUsage:       s.toolUsage      ?? 0,
      problemSolving:  s.problemSolving ?? 0,
      collaboration:   s.collaboration  ?? 0,
      ethics:          s.ethics         ?? 0,
    };
    if (row.type === 'pre') entry.pre = scores;
    else entry.post = scores;
  });

  return Array.from(map.values());
}

export async function getHackathonDiagnosisStats(hackathonIds: string[]): Promise<DiagnosisAggStats> {
  if (hackathonIds.length === 0) return { diagnosedCount: 0, preAvg: null, postAvg: null };

  const { data } = await supabase
    .from('diagnosis_results')
    .select('*')
    .in('hackathon_id', hackathonIds);

  if (!data || data.length === 0) return { diagnosedCount: 0, preAvg: null, postAvg: null };

  const pre = data.filter(d => d.type === 'pre');
  const post = data.filter(d => d.type === 'post');
  const postIds = new Set(post.map(d => d.participant_id));
  const diagnosedCount = pre.filter(d => postIds.has(d.participant_id)).length;

  type Row = NonNullable<typeof data>[number];
  function avgScores(results: Row[]): DiagnosisScores | null {
    if (results.length === 0) return null;
    const sum = { aiUnderstanding: 0, toolUsage: 0, problemSolving: 0, collaboration: 0, ethics: 0 };
    results.forEach(r => {
      const s = r.scores as Record<string, number>;
      sum.aiUnderstanding += s.aiUnderstanding ?? 0;
      sum.toolUsage += s.toolUsage ?? 0;
      sum.problemSolving += s.problemSolving ?? 0;
      sum.collaboration += s.collaboration ?? 0;
      sum.ethics += s.ethics ?? 0;
    });
    const n = results.length;
    return {
      aiUnderstanding: Math.round(sum.aiUnderstanding / n * 10) / 10,
      toolUsage: Math.round(sum.toolUsage / n * 10) / 10,
      problemSolving: Math.round(sum.problemSolving / n * 10) / 10,
      collaboration: Math.round(sum.collaboration / n * 10) / 10,
      ethics: Math.round(sum.ethics / n * 10) / 10,
    };
  }

  return { diagnosedCount, preAvg: avgScores(pre), postAvg: avgScores(post) };
}
