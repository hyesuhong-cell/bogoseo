import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createTeam } from '@/lib/teamStore';

// POST /api/admin/teams — 팀 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { hackathonId, name, trackId, leaderId, memberIds } = await req.json();
  if (!hackathonId || !name) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  const team = await createTeam({ hackathonId, name, trackId, leaderId, memberIds: memberIds ?? [] });
  return NextResponse.json({ ok: true, id: team.id });
}
