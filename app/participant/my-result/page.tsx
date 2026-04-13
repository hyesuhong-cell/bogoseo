import { auth } from '@/auth';
import { getDiagnosisResult } from '@/lib/diagnosisStore';
import { findUserById } from '@/lib/userStore';
import { listTeamsByHackathon } from '@/lib/teamStore';
import { getHackathon } from '@/lib/hackathonStore';
import { mockHackathons, mockParticipants, mockTeams } from '@/lib/mockData';
import type { DiagnosisScore } from '@/lib/types';
import MyResultClient from '@/components/MyResultClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MyResultPage() {
  const session = await auth();
  const sessionUser = session?.user as {
    name?: string;
    participantId?: string;
    hackathonId?: string;
  } | undefined;

  const participantId = sessionUser?.participantId ?? '';
  const hackathonId = sessionUser?.hackathonId ?? '';
  const sessionName = sessionUser?.name ?? '';

  // Fetch user detail (major, grade)
  let name = sessionName;
  let major = '';
  let grade = 0;
  try {
    if (participantId) {
      const userDetail = await findUserById(participantId);
      if (userDetail) {
        name = userDetail.name || sessionName;
        major = userDetail.major;
        grade = userDetail.grade;
      }
    }
  } catch {}

  // Fetch pre/post diagnosis
  let pre = null;
  let post = null;
  try {
    if (participantId && hackathonId) {
      [pre, post] = await Promise.all([
        getDiagnosisResult(participantId, hackathonId, 'pre').catch(() => null),
        getDiagnosisResult(participantId, hackathonId, 'post').catch(() => null),
      ]);
    }
  } catch {}

  // If no DB data and this is a mock participant, fall back to mock
  if ((!pre || !post) && !hackathonId) {
    const mockParticipant = mockParticipants.find(p => p.id === participantId);
    if (mockParticipant?.preScore && mockParticipant?.postScore) {
      const scoreMap = (s: DiagnosisScore) => ({
        aiUnderstanding: s.understanding ?? 0,
        toolUsage: s.toolUsage ?? 0,
        problemSolving: s.problemSolving ?? 0,
        collaboration: s.collaboration ?? 0,
        ethics: s.ethics ?? 0,
      });
      const mockTeam = mockParticipant.teamId ? mockTeams.find(t => t.id === mockParticipant.teamId) : null;
      const teamInfo = mockTeam ? {
        name: mockTeam.name,
        projectName: mockTeam.project?.name ?? '',
        projectDescription: mockTeam.project?.description ?? '',
        techStack: mockTeam.project?.techStack ?? [],
        award: mockTeam.project?.evaluationScore?.award ?? null,
        evaluationTotal: mockTeam.project?.evaluationScore
          ? mockTeam.project.evaluationScore.creativity +
            mockTeam.project.evaluationScore.techCompletion +
            mockTeam.project.evaluationScore.feasibility +
            mockTeam.project.evaluationScore.teamwork +
            mockTeam.project.evaluationScore.ux
          : null,
      } : null;

      return (
        <MyResultClient
          name={mockParticipant.name}
          major={mockParticipant.major}
          grade={mockParticipant.grade}
          teamInfo={teamInfo}
          pre={scoreMap(mockParticipant.preScore!)}
          post={scoreMap(mockParticipant.postScore!)}
        />
      );
    }
  }

  // No scores available
  if (!pre || !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-xl font-bold text-slate-700 mb-2">아직 진단이 완료되지 않았습니다</h1>
        <p className="text-slate-400 text-sm mb-6">
          사전/사후 AI 역량 진단을 모두 완료하면 성장 리포트를 확인할 수 있습니다
        </p>
        <div className="flex gap-3 justify-center">
          {!pre && (
            <Link href="/participant/diagnosis/pre" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
              사전 진단하기
            </Link>
          )}
          {pre && !post && (
            <Link href="/participant/diagnosis/post" className="border border-blue-200 text-blue-600 px-5 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition-colors text-sm">
              사후 진단하기
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Fetch team info
  let teamInfo = null;
  if (hackathonId && participantId) {
    try {
      const teams = await listTeamsByHackathon(hackathonId);
      const myTeam = teams.find(t => t.members.includes(participantId));
      if (myTeam) {
        const ev = myTeam.evaluation;
        teamInfo = {
          name: myTeam.name,
          projectName: myTeam.project?.name ?? '',
          projectDescription: myTeam.project?.description ?? '',
          techStack: myTeam.project?.techStack ?? [],
          award: ev?.award ?? null,
          evaluationTotal: ev
            ? ev.creativity + ev.techCompletion + ev.feasibility + ev.teamwork + ev.ux
            : null,
        };
      }
    } catch {}
  }

  return (
    <MyResultClient
      name={name}
      major={major}
      grade={grade}
      teamInfo={teamInfo}
      pre={pre.scores}
      post={post.scores}
    />
  );
}
