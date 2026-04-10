import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateTeam, deleteTeam, upsertProject, upsertEvaluation } from '@/lib/teamStore';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/teams/[id] — 팀 정보 / 프로젝트 / 심사 수정
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.type === 'project') {
    await upsertProject(id, {
      name: body.name,
      description: body.description,
      techStack: body.techStack ?? [],
      githubUrl: body.githubUrl ?? '',
      completionLevel: body.completionLevel ?? '',
    });
  } else if (body.type === 'evaluation') {
    await upsertEvaluation(id, {
      creativity: Number(body.creativity),
      techCompletion: Number(body.techCompletion),
      feasibility: Number(body.feasibility),
      teamwork: Number(body.teamwork),
      ux: Number(body.ux),
      award: body.award ?? '',
      judgeComment: body.judgeComment ?? '',
    });
  } else {
    await updateTeam(id, {
      name: body.name,
      trackId: body.trackId,
      leaderId: body.leaderId,
      memberIds: body.memberIds,
    });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/teams/[id] — 팀 삭제
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  await deleteTeam(id);
  return NextResponse.json({ ok: true });
}
