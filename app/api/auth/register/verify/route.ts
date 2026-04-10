import { NextRequest, NextResponse } from 'next/server';
import { verifyInviteToken } from '@/lib/inviteToken';
import { mockHackathons } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const data = verifyInviteToken(token);
  if (!data) return NextResponse.json({ error: '유효하지 않은 초대 링크입니다.' }, { status: 400 });

  const hackathon = mockHackathons.find(h => h.id === data.hackathonId);
  if (!hackathon) return NextResponse.json({ error: '해커톤을 찾을 수 없습니다.' }, { status: 404 });

  return NextResponse.json({ hackathonName: hackathon.name });
}
