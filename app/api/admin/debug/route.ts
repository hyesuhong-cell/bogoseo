import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/db/supabase';

// GET /api/admin/debug — admin_accounts 테이블 상태 진단 (슈퍼어드민 전용)
export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  // 테이블 컬럼 확인
  const { data: rows, error } = await supabase
    .from('admin_accounts')
    .select('id, name, email, university, password_hash, created_at, created_by');

  if (error) {
    return NextResponse.json({ error: error.message, hint: 'password_hash 컬럼이 없을 수 있습니다.' }, { status: 500 });
  }

  const accounts = (rows ?? []).map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    university: r.university,
    hasPasswordHash: r.password_hash !== null && r.password_hash !== undefined && r.password_hash !== '',
    passwordHashPrefix: r.password_hash ? String(r.password_hash).slice(0, 10) + '...' : null,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ accounts, total: accounts.length });
}
