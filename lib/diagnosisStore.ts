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

export async function saveDiagnosisResult(data: Omit<DiagnosisResult, 'id' | 'completedAt'>) {
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
