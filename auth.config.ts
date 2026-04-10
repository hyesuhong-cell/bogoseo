import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role;
      const path = nextUrl.pathname;

      // 슈퍼어드민 로그인 페이지
      if (path === '/superadmin/login') {
        if (isLoggedIn && role === 'superadmin') {
          return Response.redirect(new URL('/superadmin', nextUrl));
        }
        return true;
      }

      // 슈퍼어드민 전용 페이지
      if (path.startsWith('/superadmin')) {
        if (!isLoggedIn || role !== 'superadmin') {
          return Response.redirect(new URL('/superadmin/login', nextUrl));
        }
        return true;
      }

      // 관리자 로그인 페이지 (슈퍼어드민도 접근 가능 — 어드민으로 별도 로그인)
      if (path === '/admin/login') {
        if (isLoggedIn && role === 'admin') {
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }

      // 참가자 로그인 페이지
      if (path === '/participant/login') {
        if (isLoggedIn && role === 'participant') {
          return Response.redirect(new URL('/participant', nextUrl));
        }
        return true;
      }

      // 관리자 전용 페이지 (어드민 role만 접근, 슈퍼어드민은 해커톤 상세만 열람 허용)
      if (path.startsWith('/admin')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/admin/login', nextUrl));
        }
        if (role === 'superadmin') {
          // 슈퍼어드민은 해커톤 상세 sub-page(/admin/hackathons/[id]/...)만 열람 허용
          const isHackathonDetail = /^\/admin\/hackathons\/(?!new($|\/))/.test(path);
          if (isHackathonDetail) return true;
          return Response.redirect(new URL('/superadmin', nextUrl));
        }
        if (role !== 'admin') {
          return Response.redirect(new URL('/admin/login', nextUrl));
        }
        return true;
      }

      // 참가자 전용 페이지
      if (path.startsWith('/participant')) {
        if (!isLoggedIn || role !== 'participant') {
          return Response.redirect(new URL('/participant/login', nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.studentId = (user as { studentId?: string }).studentId;
        token.participantId = (user as { participantId?: string }).participantId;
        token.university = (user as { university?: string }).university;
        token.hackathonId = (user as { hackathonId?: string }).hackathonId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { studentId?: string }).studentId = token.studentId as string;
        (session.user as { participantId?: string }).participantId = token.participantId as string;
        (session.user as { university?: string }).university = token.university as string;
        (session.user as { hackathonId?: string }).hackathonId = token.hackathonId as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
