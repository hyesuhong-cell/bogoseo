/**
 * 인메모리 사용자 스토어 (MVP용)
 * 프로세스 재시작 시 초기화됨 — 실제 운영 시 DB로 교체 필요
 */

export interface RegisteredUser {
  id: string;
  hackathonId: string;
  studentId: string;
  name: string;
  email: string;
  major: string;
  grade: number;
  passwordHash: string;
  registeredAt: string;
}

// 싱글톤 Map — 서버 프로세스 내에서 유지됨
const store = new Map<string, RegisteredUser>();

export function saveUser(user: RegisteredUser) {
  store.set(user.studentId, user);
}

export function findUserByStudentId(studentId: string): RegisteredUser | undefined {
  return store.get(studentId);
}

export function isStudentIdTaken(studentId: string): boolean {
  return store.has(studentId);
}
