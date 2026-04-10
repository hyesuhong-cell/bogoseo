import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateInviteToken } from '@/lib/inviteToken';
import { sendInviteEmail } from '@/lib/email';
import { mockHackathons } from '@/lib/mockData';
import { getHackathon } from '@/lib/hackathonStore';

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== 'admin' && role !== 'superadmin')) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { hackathonId, emails, participantName } = await req.json();

  if (!hackathonId || !emails?.length) {
    return NextResponse.json({ error: '해커톤 ID와 이메일을 입력해주세요.' }, { status: 400 });
  }

  // 해커톤 조회
  const mock = mockHackathons.find(h => h.id === hackathonId);
  const db = mock ? null : await getHackathon(hackathonId);
  const hackathon = mock ?? db;
  if (!hackathon) {
    return NextResponse.json({ error: '해커톤을 찾을 수 없습니다.' }, { status: 404 });
  }

  const baseUrl = req.nextUrl.origin;
  const token = generateInviteToken(hackathonId);
  const inviteLink = `${baseUrl}/join?token=${token}`;

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const email of emails as string[]) {
    try {
      await sendInviteEmail({
        to: email.trim(),
        participantName: participantName || '참가자',
        hackathonName: hackathon.name,
        inviteLink,
      });
      results.push({ email, ok: true });
    } catch (e) {
      results.push({ email, ok: false, error: (e as Error).message });
    }
  }

  const successCount = results.filter(r => r.ok).length;
  return NextResponse.json({ results, successCount, inviteLink });
}
