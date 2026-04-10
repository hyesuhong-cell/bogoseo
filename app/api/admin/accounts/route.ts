import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import {
  saveAdmin,
  listAdmins,
  isAdminEmailTaken,
  AdminAccount,
} from '@/lib/adminStore';

// GET /api/admin/accounts — 어드민 목록 (슈퍼어드민 전용)
export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const admins = (await listAdmins()).map(a => ({
    id: a.id,
    name: a.name,
    email: a.email,
    university: a.university,
    createdAt: a.createdAt,
    createdBy: a.createdBy,
  }));

  return NextResponse.json({ admins });
}

// POST /api/admin/accounts — 어드민 계정 생성 (슈퍼어드민 전용)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { name, email, university, password } = await req.json();

  if (!name || !email || !university || !password) {
    return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
  }

  if (await isAdminEmailTaken(email)) {
    return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin: AdminAccount = {
    id: `admin-${Date.now()}`,
    name,
    email,
    university,
    passwordHash,
    createdAt: new Date().toISOString(),
    createdBy: session.user?.email ?? 'superadmin',
  };

  await saveAdmin(admin);

  return NextResponse.json({
    success: true,
    admin: { id: admin.id, name: admin.name, email: admin.email, university: admin.university },
  });
}
