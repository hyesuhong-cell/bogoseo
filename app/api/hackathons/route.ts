import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createHackathon, listHackathons } from '@/lib/hackathonStore';

// GET /api/hackathons
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const university = (session.user as { university?: string }).university;

  const hackathons = await listHackathons(role === 'superadmin' ? undefined : university);
  return NextResponse.json({ hackathons });
}

// POST /api/hackathons
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== 'admin' && role !== 'superadmin') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const body = await req.json();
  const { name, university, theme, category, status, startDate, endDate, venue, tracks } = body;

  if (!name || !university || !category || !startDate || !endDate) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  const hackathon = await createHackathon({
    name,
    university,
    theme: theme ?? '',
    category,
    status: status ?? 'upcoming',
    startDate,
    endDate,
    venue: venue ?? '',
    tracks: (tracks ?? []).map((t: { name: string; description: string }, i: number) => ({
      id: `track-${Date.now()}-${i}`,
      name: t.name,
      description: t.description ?? '',
    })),
    createdBy: session.user?.email ?? '',
  });

  return NextResponse.json({ hackathon });
}
