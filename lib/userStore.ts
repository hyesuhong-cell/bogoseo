import { supabase } from './db/supabase';

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

export async function saveUser(user: RegisteredUser) {
  await supabase.from('registered_participants').upsert({
    id: user.id,
    name: user.name,
    email: user.email,
    student_id: user.studentId,
    hackathon_id: user.hackathonId,
    password_hash: user.passwordHash,
    department: user.major,
    grade: user.grade,
    created_at: user.registeredAt,
  });
}

export async function findUserByStudentId(studentId: string): Promise<RegisteredUser | undefined> {
  const { data } = await supabase
    .from('registered_participants')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    email: data.email ?? '',
    studentId: data.student_id,
    hackathonId: data.hackathon_id,
    major: data.department ?? '',
    grade: data.grade ?? 1,
    passwordHash: data.password_hash,
    registeredAt: data.created_at,
  };
}

export async function isStudentIdTaken(studentId: string): Promise<boolean> {
  const { count } = await supabase
    .from('registered_participants')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId);

  return (count ?? 0) > 0;
}

export async function listParticipantsByHackathon(hackathonId: string): Promise<RegisteredUser[]> {
  const { data } = await supabase
    .from('registered_participants')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('created_at', { ascending: true });

  return (data ?? []).map(d => ({
    id: d.id,
    name: d.name,
    email: d.email ?? '',
    studentId: d.student_id,
    hackathonId: d.hackathon_id,
    major: d.department ?? '',
    grade: d.grade ?? 1,
    passwordHash: d.password_hash,
    registeredAt: d.created_at,
  }));
}
