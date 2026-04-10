import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // /join은 공개 — 매처에서 제외
  matcher: ['/admin/:path*', '/participant/:path*'],
};
