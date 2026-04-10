import { supabase } from './db/supabase';

export interface HackathonTrack {
  id: string;
  name: string;
  description: string;
}

export interface HackathonRecord {
  id: string;
  name: string;
  university: string;
  theme: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: string;
  endDate: string;
  venue: string;
  tracks: HackathonTrack[];
  createdBy: string;
  createdAt: string;
}

export async function createHackathon(data: Omit<HackathonRecord, 'id' | 'createdAt'>): Promise<HackathonRecord> {
  const id = `hack-${Date.now()}`;

  await supabase.from('hackathons').insert({
    id,
    name: data.name,
    university: data.university,
    theme: data.theme,
    category: data.category,
    status: data.status,
    start_date: data.startDate,
    end_date: data.endDate,
    venue: data.venue,
    created_by: data.createdBy,
  });

  if (data.tracks.length > 0) {
    await supabase.from('hackathon_tracks').insert(
      data.tracks.map(t => ({
        id: t.id,
        hackathon_id: id,
        name: t.name,
        description: t.description,
      }))
    );
  }

  return { ...data, id, createdAt: new Date().toISOString() };
}

export async function listHackathons(university?: string): Promise<HackathonRecord[]> {
  let query = supabase
    .from('hackathons')
    .select('*')
    .order('created_at', { ascending: false });

  if (university) {
    query = query.eq('university', university);
  }

  const { data: hackathons } = await query;
  if (!hackathons || hackathons.length === 0) return [];

  const ids = hackathons.map(h => h.id);
  const { data: tracks } = await supabase
    .from('hackathon_tracks')
    .select('*')
    .in('hackathon_id', ids);

  return hackathons.map(h => ({
    id: h.id,
    name: h.name,
    university: h.university,
    theme: h.theme ?? '',
    category: h.category,
    status: h.status,
    startDate: h.start_date,
    endDate: h.end_date,
    venue: h.venue ?? '',
    createdBy: h.created_by ?? '',
    createdAt: h.created_at,
    tracks: (tracks ?? [])
      .filter(t => t.hackathon_id === h.id)
      .map(t => ({ id: t.id, name: t.name, description: t.description ?? '' })),
  }));
}

export async function getHackathon(id: string): Promise<HackathonRecord | null> {
  const { data: h } = await supabase
    .from('hackathons')
    .select('*')
    .eq('id', id)
    .single();

  if (!h) return null;

  const { data: tracks } = await supabase
    .from('hackathon_tracks')
    .select('*')
    .eq('hackathon_id', id);

  return {
    id: h.id,
    name: h.name,
    university: h.university,
    theme: h.theme ?? '',
    category: h.category,
    status: h.status,
    startDate: h.start_date,
    endDate: h.end_date,
    venue: h.venue ?? '',
    createdBy: h.created_by ?? '',
    createdAt: h.created_at,
    tracks: (tracks ?? []).map(t => ({ id: t.id, name: t.name, description: t.description ?? '' })),
  };
}

export async function updateHackathonStatus(id: string, status: 'upcoming' | 'ongoing' | 'completed') {
  await supabase.from('hackathons').update({ status }).eq('id', id);
}

export async function updateHackathon(
  id: string,
  updates: Partial<Pick<HackathonRecord, 'name' | 'status' | 'category' | 'theme' | 'startDate' | 'endDate' | 'venue' | 'university'>>
) {
  const payload: Record<string, string> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.theme !== undefined) payload.theme = updates.theme;
  if (updates.startDate !== undefined) payload.start_date = updates.startDate;
  if (updates.endDate !== undefined) payload.end_date = updates.endDate;
  if (updates.venue !== undefined) payload.venue = updates.venue;
  if (updates.university !== undefined) payload.university = updates.university;

  const { error } = await supabase.from('hackathons').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteHackathon(id: string) {
  const { error } = await supabase.from('hackathons').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
