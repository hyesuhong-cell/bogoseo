import { NextRequest, NextResponse } from 'next/server';
import { verifyInviteToken } from '@/lib/inviteToken';
import { mockHackathons } from '@/lib/mockData';
import { getHackathon } from '@/lib/hackathonStore';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const data = verifyInviteToken(token);
  if (!data) return NextResponse.json({ error: '유효하지 않은 초대 링크입니다.' }, { status: 400 });

  // mockData → DB 순으로 조회
  const mock = mockHackathons.find(h => h.id === data.hackathonId);
  if (mock) return NextResponse.json({ hackathonName: mock.name });

  const db = await getHackathon(data.hackathonId);
  if (!db) return NextResponse.json({ error: '해커톤을 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ hackathonName: db.name });
}
