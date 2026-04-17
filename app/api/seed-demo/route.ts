/**
 * GET /api/seed-demo
 * 데모 계정(학번 2021001001)에 사전/사후 진단 결과와 설문 응답을 삽입합니다.
 * 이미 데이터가 있는 경우 upsert로 덮어씁니다.
 */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

const DEMO_STUDENT_ID = '2021001001';

const PRE_SCORES = {
  aiUnderstanding: 2.4,
  toolUsage:       1.8,
  problemSolving:  2.6,
  collaboration:   3.2,
  ethics:          2.9,
};

const POST_SCORES = {
  aiUnderstanding: 4.1,
  toolUsage:       3.8,
  problemSolving:  4.3,
  collaboration:   4.6,
  ethics:          4.0,
};

export async function GET() {
  // 데모 참가자 조회
  const { data: participant, error: pErr } = await supabase
    .from('registered_participants')
    .select('id, hackathon_id')
    .eq('student_id', DEMO_STUDENT_ID)
    .single();

  if (pErr || !participant) {
    return NextResponse.json(
      { error: `데모 참가자(${DEMO_STUDENT_ID})를 찾을 수 없습니다. 먼저 참가자로 가입해주세요.` },
      { status: 404 }
    );
  }

  const participantId = participant.id;
  const hackathonId   = participant.hackathon_id;

  const preTotal  = Object.values(PRE_SCORES).reduce((a, b) => a + b, 0) / 5;
  const postTotal = Object.values(POST_SCORES).reduce((a, b) => a + b, 0) / 5;

  // 사전 진단 upsert
  const { error: e1 } = await supabase.from('diagnosis_results').upsert({
    id:             `demo-pre-${participantId}`,
    participant_id: participantId,
    hackathon_id:   hackathonId,
    type:           'pre',
    scores:         PRE_SCORES,
    total_score:    Math.round(preTotal * 10) / 10,
    completed_at:   new Date().toISOString(),
  }, { onConflict: 'participant_id,hackathon_id,type' });

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // 사후 진단 upsert
  const { error: e2 } = await supabase.from('diagnosis_results').upsert({
    id:             `demo-post-${participantId}`,
    participant_id: participantId,
    hackathon_id:   hackathonId,
    type:           'post',
    scores:         POST_SCORES,
    total_score:    Math.round(postTotal * 10) / 10,
    completed_at:   new Date().toISOString(),
  }, { onConflict: 'participant_id,hackathon_id,type' });

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  // 설문 응답 upsert
  const { error: e3 } = await supabase.from('survey_responses').upsert({
    id:             `demo-survey-${participantId}`,
    participant_id: participantId,
    hackathon_id:   hackathonId,
    ratings:        { overall: 4.5, theme: 4.0, mentoring: 4.2, venue: 3.8, fairness: 4.0, rewillingness: 5.0 },
    nps:            9,
    positive:       'AI 도구를 실제 프로젝트에 써볼 수 있어 정말 유익했어요. 단기간에 이렇게 성장할 수 있을 줄 몰랐습니다.',
    improvement:    '멘토링 시간이 조금 더 있었으면 좋겠어요. 심사 피드백도 더 구체적이면 좋을 것 같습니다.',
    submitted_at:   new Date().toISOString(),
  }, { onConflict: 'participant_id,hackathon_id' });

  if (e3) return NextResponse.json({ error: e3.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    message: `데모 데이터 삽입 완료`,
    participantId,
    hackathonId,
    pre:  PRE_SCORES,
    post: POST_SCORES,
  });
}
