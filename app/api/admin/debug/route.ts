import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { supabase } from '@/lib/db/supabase';

// GET /api/admin/debug — admin_accounts 테이블 상태 진단 (슈퍼어드민 전용)
export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from('admin_accounts')
    .select('id, name, email, university, password_hash, created_at, created_by');

  if (error) {
    return NextResponse.json({ error: error.message, hint: 'Supabase 연결 오류 또는 컬럼 누락' }, { status: 500 });
  }

  const accounts = (rows ?? []).map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    university: r.university,
    hasPasswordHash: r.password_hash !== null && r.password_hash !== undefined && r.password_hash !== '',
    passwordHashPrefix: r.password_hash ? String(r.password_hash).slice(0, 10) + '...' : null,
    passwordHashLength: r.password_hash ? String(r.password_hash).length : 0,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ accounts, total: accounts.length });
}

// POST /api/admin/debug — 특정 어드민 계정 로그인 테스트 (슈퍼어드민 전용)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'email과 password 필요' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  // 1. DB에서 계정 조회
  const { data, error } = await supabase
    .from('admin_accounts')
    .select('id, name, email, password_hash')
    .eq('email', normalizedEmail)
    .single();

  if (error) {
    return NextResponse.json({
      success: false,
      step: 'db_lookup',
      error: error.message,
      code: error.code,
      hint: error.code === 'PGRST116' ? '해당 이메일로 계정을 찾을 수 없습니다.' : 'DB 연결 오류',
    });
  }

  if (!data) {
    return NextResponse.json({ success: false, step: 'db_lookup', error: '계정 없음' });
  }

  if (!data.password_hash) {
    return NextResponse.json({ success: false, step: 'hash_check', error: 'password_hash가 null/빈값', accountId: data.id });
  }

  // 2. bcrypt 비교
  let bcryptResult = false;
  try {
    bcryptResult = await bcrypt.compare(normalizedPassword, data.password_hash);
  } catch (e) {
    return NextResponse.json({
      success: false,
      step: 'bcrypt_compare',
      error: String(e),
      hashPrefix: data.password_hash.slice(0, 10),
    });
  }

  return NextResponse.json({
    success: bcryptResult,
    step: bcryptResult ? 'all_passed' : 'bcrypt_mismatch',
    accountId: data.id,
    accountName: data.name,
    emailMatch: true,
    hashPrefix: data.password_hash.slice(0, 10) + '...',
    hint: bcryptResult ? '로그인 성공 가능' : '비밀번호 불일치 — 수정 페이지에서 비밀번호 재설정 필요',
  });
}
