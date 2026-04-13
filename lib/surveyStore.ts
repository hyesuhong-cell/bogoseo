import { supabase } from './db/supabase';

export interface SurveyResponse {
  id?: string;
  participantId: string;
  hackathonId: string;
  ratings: Record<string, number>;
  nps: number;
  positive: string;
  improvement: string;
  submittedAt?: string;
}

export async function saveSurveyResponse(data: Omit<SurveyResponse, 'id' | 'submittedAt'>) {
  const id = `survey-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { error } = await supabase.from('survey_responses').upsert({
    id,
    participant_id: data.participantId,
    hackathon_id: data.hackathonId,
    ratings: data.ratings,
    nps: data.nps,
    positive: data.positive,
    improvement: data.improvement,
  }, { onConflict: 'participant_id,hackathon_id' });

  if (error) throw new Error(error.message);
  return { id };
}

export async function getSurveyResponse(
  participantId: string,
  hackathonId: string
): Promise<SurveyResponse | null> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('participant_id', participantId)
    .eq('hackathon_id', hackathonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  return {
    id: data.id,
    participantId: data.participant_id,
    hackathonId: data.hackathon_id,
    ratings: data.ratings ?? {},
    nps: data.nps ?? 0,
    positive: data.positive ?? '',
    improvement: data.improvement ?? '',
    submittedAt: data.submitted_at,
  };
}

export async function getSurveyStats(hackathonIds: string[]) {
  if (hackathonIds.length === 0) return { count: 0, avgNps: null, avgRating: null };

  const { data } = await supabase
    .from('survey_responses')
    .select('*')
    .in('hackathon_id', hackathonIds);

  if (!data || data.length === 0) return { count: 0, avgNps: null, avgRating: null };

  const avgNps = data.reduce((s, r) => s + (r.nps ?? 0), 0) / data.length;

  const ratingTotals: Record<string, number> = {};
  let ratingCount = 0;
  data.forEach(r => {
    const ratings = r.ratings as Record<string, number>;
    Object.values(ratings).forEach(v => {
      ratingTotals['_total'] = (ratingTotals['_total'] ?? 0) + v;
      ratingCount++;
    });
  });
  const avgRating = ratingCount > 0 ? ratingTotals['_total'] / ratingCount : null;

  return {
    count: data.length,
    avgNps: Math.round(avgNps * 10) / 10,
    avgRating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
  };
}
