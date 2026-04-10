import { supabase } from './db/supabase';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  university: string;
  passwordHash: string;
  createdAt: string;
  createdBy: string;
}

export async function saveAdmin(admin: AdminAccount) {
  await supabase.from('admin_accounts').upsert({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    university: admin.university,
    password_hash: admin.passwordHash,
    created_at: admin.createdAt,
    created_by: admin.createdBy,
  });
}

export async function findAdminByEmail(email: string): Promise<AdminAccount | undefined> {
  const { data } = await supabase
    .from('admin_accounts')
    .select('*')
    .eq('email', email)
    .single();

  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    university: data.university,
    passwordHash: data.password_hash,
    createdAt: data.created_at,
    createdBy: data.created_by,
  };
}

export async function listAdmins(): Promise<AdminAccount[]> {
  const { data } = await supabase
    .from('admin_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  return (data ?? []).map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    university: d.university,
    passwordHash: d.password_hash,
    createdAt: d.created_at,
    createdBy: d.created_by,
  }));
}

export async function isAdminEmailTaken(email: string): Promise<boolean> {
  const { count } = await supabase
    .from('admin_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('email', email);

  return (count ?? 0) > 0;
}
