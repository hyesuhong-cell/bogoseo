import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveSurveyResponse, getSurveyResponse } from '@/lib/surveyStore';

// POST /api/survey — 만족도 설문 저장
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const participantId = (session.user as { participantId?: string }).participantId;
  if (!participantId) return NextResponse.json({ error: '참가자만 이용 가능합니다.' }, { status: 403 });

  const { hackathonId, ratings, nps, positive, improvement } = await req.json();
  if (!hackathonId || !ratings || nps === undefined || nps === null) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  }

  try {
    const result = await saveSurveyResponse({
      participantId,
      hackathonId,
      ratings,
      nps,
      positive: positive ?? '',
      improvement: improvement ?? '',
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[survey POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/survey?hackathonId= — 내 설문 결과 조회
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const participantId = (session.user as { participantId?: string }).participantId;
  if (!participantId) return NextResponse.json({ error: '참가자만 이용 가능합니다.' }, { status: 403 });

  const hackathonId = req.nextUrl.searchParams.get('hackathonId') ?? '';
  if (!hackathonId) return NextResponse.json({ error: 'hackathonId 필요' }, { status: 400 });

  try {
    const result = await getSurveyResponse(participantId, hackathonId);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ result: null });
  }
}
