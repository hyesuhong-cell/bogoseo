import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { mockParticipants } from './lib/mockData';
import { findUserByStudentId } from './lib/userStore';
import { findAdminByEmail } from './lib/adminStore';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // ── 슈퍼어드민 로그인 ──────────────────────────────
    Credentials({
      id: 'superadmin',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const superAdminEmail = process.env.SUPERADMIN_EMAIL;
        const superAdminPasswordHash = process.env.SUPERADMIN_PASSWORD_HASH;

        if (!superAdminEmail || !superAdminPasswordHash) return null;
        if (credentials.email !== superAdminEmail) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          superAdminPasswordHash
        );
        if (!isValid) return null;

        return {
          id: 'superadmin-001',
          name: process.env.SUPERADMIN_NAME || 'UD임팩트 관리자',
          email: credentials.email as string,
          role: 'superadmin',
        };
      },
    }),

    // ── 관리자(대학 담당자) 로그인 ──────────────────────────────
    Credentials({
      id: 'admin',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 이메일 정규화 (대소문자, 공백 제거)
        const email = (credentials.email as string).trim().toLowerCase();
        const password = (credentials.password as string).trim();

        // 1. superadmin이 생성한 어드민 계정 확인 (우선)
        try {
          const adminAccount = await findAdminByEmail(email);
          if (adminAccount) {
            if (!adminAccount.passwordHash) {
              console.error('[admin auth] passwordHash is null for:', email);
              return null;
            }
            const isValid = await bcrypt.compare(password, adminAccount.passwordHash);
            if (!isValid) {
              console.error('[admin auth] bcrypt mismatch for:', email);
              return null;
            }
            return {
              id: adminAccount.id,
              name: adminAccount.name,
              email: adminAccount.email,
              role: 'admin',
              university: adminAccount.university,
            };
          }
        } catch (err) {
          console.error('[admin auth] DB lookup failed:', err);
          // DB 오류 시 env var fallback으로 진행
        }

        // 2. 환경변수 기본 관리자 계정 (fallback)
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) return null;
        if (email !== adminEmail.trim().toLowerCase()) return null;

        const isValid = await bcrypt.compare(password, adminPasswordHash);
        if (!isValid) {
          console.error('[admin auth] env var bcrypt mismatch for:', email);
          return null;
        }

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
        const registered = await findUserByStudentId(sid);
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
            hackathonId: registered.hackathonId,
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
