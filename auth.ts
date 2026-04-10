import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { mockParticipants } from './lib/mockData';
import { findUserByStudentId } from './lib/userStore';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // ── 관리자 로그인 ──────────────────────────────
    Credentials({
      id: 'admin',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) return null;
        if (credentials.email !== adminEmail) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          adminPasswordHash
        );
        if (!isValid) return null;

        return {
          id: 'admin-001',
          name: process.env.ADMIN_NAME || '관리자',
          email: credentials.email as string,
          role: 'admin',
        };
      },
    }),

    // ── 참가자 로그인 ──────────────────────────────
    Credentials({
      id: 'participant',
      credentials: {
        studentId: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.studentId || !credentials?.password) return null;
        const sid = credentials.studentId as string;
        const pwd = credentials.password as string;

        // 1. 초대 링크로 가입한 사용자 확인 (우선)
        const registered = findUserByStudentId(sid);
        if (registered) {
          const isValid = await bcrypt.compare(pwd, registered.passwordHash);
          if (!isValid) return null;
          return {
            id: registered.id,
            name: registered.name,
            email: registered.email,
            role: 'participant',
            studentId: registered.studentId,
            participantId: registered.id,
          };
        }

        // 2. 기존 mockData 참가자 (데모용)
        const participant = mockParticipants.find(p => p.studentId === sid);
        if (!participant) return null;

        const storedHash = participant.passwordHash;
        let isValid = false;
        if (storedHash) {
          isValid = await bcrypt.compare(pwd, storedHash);
        } else {
          isValid = pwd === participant.studentId; // 초기 비밀번호: 학번
        }
        if (!isValid) return null;

        return {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          role: 'participant',
          studentId: participant.studentId,
          participantId: participant.id,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
