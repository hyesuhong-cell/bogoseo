import { supabase } from './db/supabase';

export interface RegisteredUser {
  id: string;
  hackathonId: string;
  studentId: string;
  name: string;
  email: string;
  major: string;
  grade: number;
  gender: string;
  passwordHash: string;
  registeredAt: string;
}

export async function saveUser(user: RegisteredUser) {
  const { error } = await supabase.from('registered_participants').upsert({
    id: user.id,
    name: user.name,
    email: user.email,
    student_id: user.studentId,
    hackathon_id: user.hackathonId,
    password_hash: user.passwordHash,
    department: user.major,
    grade: user.grade,
    gender: user.gender,
    created_at: user.registeredAt,
  });
  if (error) throw new Error(`[saveUser] ${error.message}`);
}

export async function findUserByStudentId(studentId: string): Promise<RegisteredUser | undefined> {
  const { data, error } = await supabase
    .from('registered_participants')
    .select('*')
    .eq('student_id', studentId.trim())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined; // no row
    throw new Error(`[findUserByStudentId] ${error.message} (code: ${error.code})`);
  }
  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    email: data.email ?? '',
    studentId: data.student_id,
    hackathonId: data.hackathon_id,
    major: data.department ?? '',
    grade: data.grade ?? 1,
    gender: data.gender ?? '',
    passwordHash: data.password_hash,
    registeredAt: data.created_at,
  };
}

export async function countParticipantsByHackathons(hackathonIds: string[]): Promise<number> {
  if (hackathonIds.length === 0) return 0;
  const { count } = await supabase
    .from('registered_participants')
    .select('id', { count: 'exact', head: true })
    .in('hackathon_id', hackathonIds);
  return count ?? 0;
}

export async function countParticipantsPerHackathon(hackathonIds: string[]): Promise<Record<string, number>> {
  if (hackathonIds.length === 0) return {};
  const { data } = await supabase
    .from('registered_participants')
    .select('hackathon_id')
    .in('hackathon_id', hackathonIds);

  const counts: Record<string, number> = {};
  (data ?? []).forEach(row => {
    counts[row.hackathon_id] = (counts[row.hackathon_id] ?? 0) + 1;
  });
  return counts;
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
    gender: d.gender ?? '',
    passwordHash: d.password_hash,
    registeredAt: d.created_at,
  }));
}
