import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveDiagnosisResult, getDiagnosisResult } from '@/lib/diagnosisStore';

// POST /api/diagnosis — 진단 결과 저장
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const participantId = (session.user as { participantId?: string }).participantId;
  if (!participantId) return NextResponse.json({ error: '참가자만 진단 가능합니다.' }, { status: 403 });

  const { hackathonId, type, scores } = await req.json();

  if (!hackathonId || !type || !scores) {
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  }

  if (!['pre', 'post'].includes(type)) {
    return NextResponse.json({ error: '유효하지 않은 진단 타입' }, { status: 400 });
  }

  const result = await saveDiagnosisResult({ participantId, hackathonId, type, scores });
  return NextResponse.json({ ok: true, ...result });
}

// GET /api/diagnosis?hackathonId=&type= — 내 진단 결과 조회
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const participantId = (session.user as { participantId?: string }).participantId;
  if (!participantId) return NextResponse.json({ error: '참가자만 조회 가능합니다.' }, { status: 403 });

  const hackathonId = req.nextUrl.searchParams.get('hackathonId') ?? '';
  const type = req.nextUrl.searchParams.get('type') as 'pre' | 'post' | null;

  if (!hackathonId || !type) {
    return NextResponse.json({ error: 'hackathonId, type 필요' }, { status: 400 });
  }

  const result = await getDiagnosisResult(participantId, hackathonId, type);
  return NextResponse.json({ result });
}
