import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateInviteToken } from '@/lib/inviteToken';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  const { hackathonId } = await req.json();
  if (!hackathonId) return NextResponse.json({ error: 'hackathonId required' }, { status: 400 });

  const token = generateInviteToken(hackathonId);
  const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const link = `${baseUrl}/join?token=${token}`;

  return NextResponse.json({ link, token });
}
