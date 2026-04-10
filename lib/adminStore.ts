/**
 * 관리자(어드민) 계정 스토어 (MVP 인메모리)
 * 실제 운영 시 Supabase admins 테이블로 교체
 */

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  university: string;   // 담당 대학
  passwordHash: string;
  createdAt: string;
  createdBy: string;    // 'superadmin' 또는 슈퍼어드민 email
}

const store = new Map<string, AdminAccount>();

export function saveAdmin(admin: AdminAccount) {
  store.set(admin.email, admin);
}

export function findAdminByEmail(email: string): AdminAccount | undefined {
  return store.get(email);
}

export function listAdmins(): AdminAccount[] {
  return Array.from(store.values());
}

export function isAdminEmailTaken(email: string): boolean {
  return store.has(email);
}
