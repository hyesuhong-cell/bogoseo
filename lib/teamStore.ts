import { supabase } from './db/supabase';

export interface DbTeam {
  id: string;
  hackathonId: string;
  name: string;
  trackId: string | null;
  leaderId: string | null;
  createdAt: string;
  members: string[];         // registered_participant ids
  project?: DbProject | null;
  evaluation?: DbEvaluation | null;
}

export interface DbProject {
  id: string;
  teamId: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  completionLevel: string;
  submittedAt: string;
}

export interface DbEvaluation {
  id: string;
  teamId: string;
  creativity: number;
  techCompletion: number;
  feasibility: number;
  teamwork: number;
  ux: number;
  award: string | null;
  judgeComment: string;
  evaluatedAt: string;
}

// ── 팀 목록 조회 ──────────────────────────────
export async function listTeamsByHackathon(hackathonId: string): Promise<DbTeam[]> {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('created_at', { ascending: true });

  if (error || !teams) return [];

  const teamIds = teams.map(t => t.id);

  // 팀원 조회
  const { data: members } = await supabase
    .from('team_members')
    .select('team_id, participant_id')
    .in('team_id', teamIds);

  // 프로젝트 조회
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .in('team_id', teamIds);

  // 심사 점수 조회
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('*')
    .in('team_id', teamIds);

  return teams.map(t => {
    const teamMembers = (members ?? []).filter(m => m.team_id === t.id).map(m => m.participant_id);
    const proj = (projects ?? []).find(p => p.team_id === t.id);
    const eval_ = (evaluations ?? []).find(e => e.team_id === t.id);

    return {
      id: t.id,
      hackathonId: t.hackathon_id,
      name: t.name,
      trackId: t.track_id,
      leaderId: t.leader_id,
      createdAt: t.created_at,
      members: teamMembers,
      project: proj ? {
        id: proj.id,
        teamId: proj.team_id,
        name: proj.name ?? '',
        description: proj.description ?? '',
        techStack: proj.tech_stack ?? [],
        githubUrl: proj.github_url ?? '',
        completionLevel: proj.completion_level ?? '',
        submittedAt: proj.submitted_at ?? '',
      } : null,
      evaluation: eval_ ? {
        id: eval_.id,
        teamId: eval_.team_id,
        creativity: eval_.creativity ?? 0,
        techCompletion: eval_.tech_completion ?? 0,
        feasibility: eval_.feasibility ?? 0,
        teamwork: eval_.teamwork ?? 0,
        ux: eval_.ux ?? 0,
        award: eval_.award,
        judgeComment: eval_.judge_comment ?? '',
        evaluatedAt: eval_.evaluated_at ?? '',
      } : null,
    };
  });
}

// ── 팀 생성 ──────────────────────────────
export async function createTeam(team: {
  hackathonId: string;
  name: string;
  trackId: string | null;
  leaderId: string | null;
  memberIds: string[];
}): Promise<{ id: string }> {
  const id = `team-${Date.now()}`;
  const { error } = await supabase.from('teams').insert({
    id,
    hackathon_id: team.hackathonId,
    name: team.name,
    track_id: team.trackId || null,
    leader_id: team.leaderId || null,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  if (team.memberIds.length > 0) {
    await supabase.from('team_members').insert(
      team.memberIds.map(pid => ({ team_id: id, participant_id: pid }))
    );
  }
  return { id };
}

// ── 팀 수정 ──────────────────────────────
export async function updateTeam(teamId: string, updates: {
  name?: string;
  trackId?: string | null;
  leaderId?: string | null;
  memberIds?: string[];
}) {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.trackId !== undefined) payload.track_id = updates.trackId;
  if (updates.leaderId !== undefined) payload.leader_id = updates.leaderId;

  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('teams').update(payload).eq('id', teamId);
    if (error) throw new Error(error.message);
  }

  if (updates.memberIds !== undefined) {
    await supabase.from('team_members').delete().eq('team_id', teamId);
    if (updates.memberIds.length > 0) {
      await supabase.from('team_members').insert(
        updates.memberIds.map(pid => ({ team_id: teamId, participant_id: pid }))
      );
    }
  }
}

// ── 팀 삭제 ──────────────────────────────
export async function deleteTeam(teamId: string) {
  await supabase.from('evaluations').delete().eq('team_id', teamId);
  await supabase.from('projects').delete().eq('team_id', teamId);
  await supabase.from('team_members').delete().eq('team_id', teamId);
  const { error } = await supabase.from('teams').delete().eq('id', teamId);
  if (error) throw new Error(error.message);
}

// ── 프로젝트 저장 (upsert) ──────────────────────────────
export async function upsertProject(teamId: string, project: {
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  completionLevel: string;
}) {
  const { data: existing } = await supabase
    .from('projects').select('id').eq('team_id', teamId).single();

  const id = existing?.id ?? `proj-${Date.now()}`;
  const { error } = await supabase.from('projects').upsert({
    id,
    team_id: teamId,
    name: project.name,
    description: project.description,
    tech_stack: project.techStack,
    github_url: project.githubUrl,
    completion_level: project.completionLevel,
    submitted_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

// ── 심사 점수 저장 (upsert) ──────────────────────────────
export async function upsertEvaluation(teamId: string, evaluation: {
  creativity: number;
  techCompletion: number;
  feasibility: number;
  teamwork: number;
  ux: number;
  award: string;
  judgeComment: string;
}) {
  const { data: existing } = await supabase
    .from('evaluations').select('id').eq('team_id', teamId).single();

  const id = existing?.id ?? `eval-${Date.now()}`;
  const { error } = await supabase.from('evaluations').upsert({
    id,
    team_id: teamId,
    creativity: evaluation.creativity,
    tech_completion: evaluation.techCompletion,
    feasibility: evaluation.feasibility,
    teamwork: evaluation.teamwork,
    ux: evaluation.ux,
    award: evaluation.award || null,
    judge_comment: evaluation.judgeComment,
    evaluated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
