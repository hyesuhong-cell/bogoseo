import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateHackathon, deleteHackathon } from '@/lib/hackathonStore';

// PATCH /api/admin/hackathons/[id] — 해커톤 수정 (슈퍼어드민 전용)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowed = ['name', 'status', 'category', 'theme', 'startDate', 'endDate', 'venue', 'university'];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '수정할 항목을 입력해주세요.' }, { status: 400 });
  }

  try {
    await updateHackathon(id, updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// DELETE /api/admin/hackathons/[id] — 해커톤 삭제 (슈퍼어드민 전용)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteHackathon(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
