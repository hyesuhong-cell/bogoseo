import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { updateAdmin, deleteAdmin, isAdminEmailTaken } from '@/lib/adminStore';

// PATCH /api/admin/accounts/[id] — 계정 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const { name, university, password } = await req.json();

  if (!name && !university && !password) {
    return NextResponse.json({ error: '수정할 항목을 입력해주세요.' }, { status: 400 });
  }

  if (password && password.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
  }

  const updates: { name?: string; university?: string; passwordHash?: string } = {};
  if (name) updates.name = name;
  if (university) updates.university = university;
  if (password) updates.passwordHash = await bcrypt.hash(password, 12);

  await updateAdmin(id, updates);
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/accounts/[id] — 계정 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  await deleteAdmin(id);
  return NextResponse.json({ ok: true });
}
