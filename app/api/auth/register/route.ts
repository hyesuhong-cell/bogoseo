import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyInviteToken } from '@/lib/inviteToken';
import { saveUser, isStudentIdTaken } from '@/lib/userStore';
import { mockHackathons } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const { token, name, studentId, email, major, grade, password } = await req.json();

    // 1. 토큰 검증
    const tokenData = verifyInviteToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: '유효하지 않은 초대 링크입니다.' }, { status: 400 });
    }

    // 2. 해커톤 존재 확인
    const hackathon = mockHackathons.find(h => h.id === tokenData.hackathonId);
    if (!hackathon) {
      return NextResponse.json({ error: '해당 해커톤을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 3. 입력값 검증
    if (!name || !studentId || !email || !major || !grade || !password) {
      return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }

    // 4. 학번 중복 확인
    if (await isStudentIdTaken(studentId)) {
      return NextResponse.json({ error: '이미 가입된 학번입니다.' }, { status: 409 });
    }

    // 5. 비밀번호 해싱 및 저장
    const passwordHash = await bcrypt.hash(password, 12);
    await saveUser({
      id: `u-${Date.now()}`,
      hackathonId: tokenData.hackathonId,
      studentId,
      name,
      email,
      major,
      grade: Number(grade),
      passwordHash,
      registeredAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, hackathonName: hackathon.name });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
