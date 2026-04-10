import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { mockParticipants } from './lib/mockData';

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

        // 실제 운영 시 DB 쿼리로 교체
        const participant = mockParticipants.find(
          (p) => p.studentId === credentials.studentId
        );
        if (!participant) return null;

        // 초기 비밀번호: 학번과 동일 (운영 시 bcrypt 해시로 교체)
        const defaultPassword = participant.studentId;
        const storedHash = participant.passwordHash;

        let isValid = false;
        if (storedHash) {
          isValid = await bcrypt.compare(credentials.password as string, storedHash);
        } else {
          isValid = credentials.password === defaultPassword;
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
