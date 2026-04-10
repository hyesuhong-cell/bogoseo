import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: 'admin' | 'participant';
    studentId?: string;
    participantId?: string;
  }
  interface Session {
    user: {
      role?: 'admin' | 'participant';
      studentId?: string;
      participantId?: string;
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'participant';
    studentId?: string;
    participantId?: string;
  }
}
