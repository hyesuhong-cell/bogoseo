import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: 'superadmin' | 'admin' | 'participant';
    studentId?: string;
    participantId?: string;
    university?: string;
  }
  interface Session {
    user: {
      role?: 'superadmin' | 'admin' | 'participant';
      studentId?: string;
      participantId?: string;
      university?: string;
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'superadmin' | 'admin' | 'participant';
    studentId?: string;
    participantId?: string;
    university?: string;
  }
}
