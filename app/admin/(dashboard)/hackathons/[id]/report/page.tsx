import Link from 'next/link';
import { mockHackathons, mockParticipants, mockTeams, mockSurveys, mockFollowUps, mockBenchmarkData } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import ReportCharts from './ReportCharts';
import ReportSectionNav from './ReportSectionNav';
import ExecutiveSummary from '@/components/ExecutiveSummary';
import CompetencyHeatmap from '@/components/CompetencyHeatmap';
import BenchmarkComparison from '@/components/BenchmarkComparison';
import ReportActions from '@/components/ReportActions';
import { ReportData } from '@/lib/pdfExport';
import './print.css';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hackathon = mockHackathons.find(h => h.id === id);
  if (!hackathon) notFound();

  const participants = mockParticipants.filter(p => p.hackathonId === id);
  const teams = mockTeams.filter(t => t.hackathonId === id);
  const surveys = mockSurveys.filter(s => s.hackathonId === id);
  const followUps = mockFollowUps.filter(f => f.hackathonId === id);

  const diagnosed = participants.filter(p => p.preScore && p.postScore);
  const submittedTeams = teams.filter(t => t.project);
  const awardedTeams = teams.filter(t => t.project?.evaluationScore?.award);

  // AI 역량 평균 계산
  const calcAvg = (scores: number[]) => scores.length > 0 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;

  const preScores = {
    understanding: calcAvg(diagnosed.map(p => p.preScore!.understanding)),
    toolUsage: calcAvg(diagnosed.map(p => p.preScore!.toolUsage)),
    problemSolving: calcAvg(diagnosed.map(p => p.preScore!.problemSolving)),
    collaboration: calcAvg(diagnosed.map(p => p.preScore!.collaboration)),
    ethics: calcAvg(diagnosed.map(p => p.preScore!.ethics)),
  };

  const postScores = {
    understanding: calcAvg(diagnosed.map(p => p.postScore!.understanding)),
    toolUsage: calcAvg(diagnosed.map(p => p.postScore!.toolUsage)),
    problemSolving: calcAvg(diagnosed.map(p => p.postScore!.problemSolving)),
    collaboration: calcAvg(diagnosed.map(p => p.postScore!.collaboration)),
    ethics: calcAvg(diagnosed.map(p => p.postScore!.ethics)),
  };

  const totalPreAvg = calcAvg(Object.values(preScores));
  const totalPostAvg = calcAvg(Object.values(postScores));
  const growthRate = totalPreAvg > 0 ? (((totalPostAvg - totalPreAvg) / totalPreAvg) * 100).toFixed(1) : '0';

  const avgNps = surveys.length > 0 ? +(surveys.reduce((s, v) => s + v.nps, 0) / surveys.length).toFixed(1) : 0;
  const npsScore = Math.round(avgNps * 10); // 0~100

  // 만족도 평균
  const avgSatisfaction = surveys.length > 0 ? (surveys.reduce((s, v) => s + v.overall, 0) / surveys.length).toFixed(1) : '-';
  const avgMentoring = surveys.length > 0 ? (surveys.reduce((s, v) => s + v.mentoring, 0) / surveys.length).toFixed(1) : '-';

  // 프로젝트 제출률
  const submitRate = teams.length > 0 ? Math.round((submittedTeams.length / teams.length) * 100) : 0;

  // 후속 성과
  const continuedDevCount = followUps.filter(f => f.continuedDevelopment).length;
  const startupCount = followUps.filter(f => f.startupConnected).length;
  const awardCount = followUps.filter(f => f.externalAward).length;

  // 수상 팀
  const awards = ['대상', '최우수상', '우수상', '장려상', '특별상'] as const;

  // 참가자 역량 레벨 계산 (히트맵용)
  const getCompetencyLevel = (score: number) => {
    if (score >= 4.5) return 5;
    if (score >= 3.5) return 4;
    if (score >= 2.5) return 3;
    if (score >= 1.5) return 2;
    return 1;
  };

  const participantCompetencyPre = diagnosed.map(p => {
    const avgScore = (p.preScore!.understanding + p.preScore!.toolUsage + p.preScore!.problemSolving + p.preScore!.collaboration + p.preScore!.ethics) / 5;
    return {
      id: p.id,
      name: p.name,
      level: getCompetencyLevel(avgScore),
      scores: {
        understanding: p.preScore!.understanding,
        toolUsage: p.preScore!.toolUsage,
        problemSolving: p.preScore!.problemSolving,
        collaboration: p.preScore!.collaboration,
        ethics: p.preScore!.ethics,
      },
    };
  });

  const participantCompetencyPost = diagnosed.map(p => {
    const avgScore = (p.postScore!.understanding + p.postScore!.toolUsage + p.postScore!.problemSolving + p.postScore!.collaboration + p.postScore!.ethics) / 5;
    return {
      id: p.id,
      name: p.name,
      level: getCompetencyLevel(avgScore),
      scores: {
        understanding: p.postScore!.understanding,
        toolUsage: p.postScore!.toolUsage,
        problemSolving: p.postScore!.problemSolving,
        collaboration: p.postScore!.collaboration,
        ethics: p.postScore!.ethics,
      },
    };
  });

  // Benchmark data
  const currentUniversityBenchmark = {
    university: hackathon.university,
    participantCount: participants.length,
    avgPreScore: totalPreAvg,
    avgPostScore: totalPostAvg,
    growthRate: Number(growthRate),
    satisfaction: Number(avgSatisfaction) || 0,
    nps: npsScore,
    projectSubmitRate: submitRate,
  };

  // Report data for export
  const reportData: ReportData = {
    hackathon: {
      id: hackathon.id,
      name: hackathon.name,
      university: hackathon.university,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      venue: hackathon.venue,
      host: hackathon.host,
      organizer: hackathon.organizer,
      theme: hackathon.theme,
    },
    metrics: {
      participantCount: participants.length,
      teamCount: teams.length,
      submitRate,
      growthRate: Number(growthRate),
      satisfaction: Number(avgSatisfaction) || 0,
      nps: npsScore,
      preAvg: totalPreAvg,
      postAvg: totalPostAvg,
    },
    competency: {
      pre: preScores,
      post: postScores,
    },
    awards: teams
      .filter(t => t.project?.evaluationScore?.award)
      .map(t => ({
        teamName: t.name,
        projectName: t.project!.name,
        award: t.project!.evaluationScore!.award!,
        score: (t.project!.evaluationScore!.creativity + t.project!.evaluationScore!.techCompletion + t.project!.evaluationScore!.feasibility + t.project!.evaluationScore!.teamwork + t.project!.evaluationScore!.ux),
      })),
    followUps: {
      continuedDev: continuedDevCount,
      startup: startupCount,
      externalAward: awardCount,
    },
  };

  // 차트용 데이터
  const chartData = {
    preScores,
    postScores,
    gradeData: [1,2,3,4].map(g => ({
      grade: `${g}학년`,
      count: participants.filter(p => p.grade === g).length,
    })),
    majorData: Object.entries(
      participants.reduce((acc, p) => {
        acc[p.majorCategory] = (acc[p.majorCategory] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })),
    trackData: hackathon.tracks.map(t => ({
      name: t.name,
      teams: teams.filter(tm => tm.trackId === t.id).length,
    })),
    satisfactionData: [
      { label: '전반적 만족도', avg: surveys.length > 0 ? +(surveys.reduce((s,v)=>s+v.overall,0)/surveys.length).toFixed(1) : 0 },
      { label: '주제·트랙 적절성', avg: surveys.length > 0 ? +(surveys.reduce((s,v)=>s+v.theme,0)/surveys.length).toFixed(1) : 0 },
      { label: '멘토링 만족도', avg: surveys.length > 0 ? +(surveys.reduce((s,v)=>s+v.mentoring,0)/surveys.length).toFixed(1) : 0 },
      { label: '장소·시설', avg: surveys.length > 0 ? +(surveys.reduce((s,v)=>s+v.venue,0)/surveys.length).toFixed(1) : 0 },
      { label: '심사 공정성', avg: surveys.length > 0 ? +(surveys.reduce((s,v)=>s+v.fairness,0)/surveys.length).toFixed(1) : 0 },
      { label: '재참여 의향', avg: surveys.length > 0 ? +(surveys.reduce((s,v)=>s+v.rewillingness,0)/surveys.length).toFixed(1) : 0 },
    ],
  };

  return (
    <div className="p-8 fade-in max-w-7xl mx-auto">
      {/* 브레드크럼 (인쇄 숨김) */}
      <div className="no-print flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <Link href={`/admin/hackathons/${id}`} className="hover:text-slate-800">{hackathon.name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">성과 추적 리포트</span>
      </div>

      {/* Header with Export Actions (인쇄 숨김) */}
      <div className="no-print flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">운영 성과 리포트</h1>
          <p className="text-slate-500">대학 실무진을 위한 상세 분석 보고서</p>
        </div>
        <ReportActions data={reportData} />
      </div>

      {/* ===== Section Navigation Tabs (인쇄 숨김) ===== */}
      <div className="no-print"><ReportSectionNav /></div>

      {/* ===== Executive Summary (1페이지) ===== */}
      <div className="mb-12" id="executive-summary">
        <ExecutiveSummary
          hackathonName={hackathon.name}
          university={hackathon.university}
          participantCount={participants.length}
          growthRate={Number(growthRate)}
          satisfaction={Number(avgSatisfaction) || 0}
          nps={npsScore}
          preAvg={totalPreAvg}
          postAvg={totalPostAvg}
          submitRate={submitRate}
          impactStatement={`참가 학생의 AI 역량이 평균 ${growthRate}% 향상되었으며, ${Math.round(participantCompetencyPost.filter(p => p.level >= 3).length / participantCompetencyPost.length * 100)}%가 중급 이상 수준에 도달했습니다.`}
          nextAction="연간 계약 시 타 대학 벤치마크 데이터 포함 제공 및 6개월 후속 추적 시스템 자동화"
        />
      </div>

      {/* Page Break for Print */}
      <div className="print:page-break-before-always"></div>

      {/* ===== 1. 행사 개요 ===== */}
      <div id="sec-overview" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
          행사 개요
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '행사명', value: hackathon.name },
            { label: '행사 기간', value: `${hackathon.startDate} ~ ${hackathon.endDate}` },
            { label: '장소', value: hackathon.venue },
            { label: '주최 / 주관', value: `${hackathon.host} / ${hackathon.organizer}` },
            { label: '행사 주제', value: hackathon.theme },
            { label: '참가 대상', value: '전교 재학생 (학년 무관)' },
          ].map(item => (
            <div key={item.label} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-500 w-28 flex-shrink-0">{item.label}</span>
              <span className="text-sm text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-600 mb-2">행사 목적</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              '창의적 아이디어를 단기간 내 프로토타입으로 구현하는 실전 역량 강화',
              '다양한 전공 학생 간 Cross-functional 협업 문화 조성',
              '우수 아이디어의 후속 창업·연구 연계 경로 발굴',
              'SW·AI 관련 기술 스택 활용 경험 제공',
            ].map((goal, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-blue-50 rounded-lg p-2.5">
                <span className="text-blue-600 font-bold flex-shrink-0">{['①','②','③','④'][i]}</span>
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 2. 참가 현황 통계 ===== */}
      <div id="sec-participants" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
          참가자 통계 및 현황
        </h2>

        {/* 핵심 지표 요약 */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: '총 참가자 수', value: participants.length + '명', note: `목표 대비 ${Math.round(participants.length/hackathon.maxTeams*5*100)}%` },
            { label: '참가 팀 수', value: teams.length + '팀', note: `팀당 평균 ${+(participants.length/teams.length).toFixed(1)}명` },
            { label: '프로젝트 제출', value: submittedTeams.length + '건', note: `제출률 ${submitRate}%` },
            { label: '참가 학과 수', value: [...new Set(participants.map(p=>p.major))].length + '개', note: `비CS ${participants.filter(p=>p.majorCategory!=='공학(컴퓨터·전자)').length}명 포함` },
            { label: '외부 참가자', value: participants.filter(p=>p.isExternal).length + '명', note: `전체 ${Math.round(participants.filter(p=>p.isExternal).length/participants.length*100)}%` },
          ].map(item => (
            <div key={item.label} className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700 mb-0.5">{item.value}</div>
              <div className="text-xs font-semibold text-slate-600 mb-0.5">{item.label}</div>
              <div className="text-xs text-slate-400">{item.note}</div>
            </div>
          ))}
        </div>

        <ReportCharts data={chartData} section="participation" />
      </div>

      {/* ===== 3. AI 역량 진단 결과 (핵심!) ===== */}
      <div id="sec-diagnosis" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
          AI 역량 사전/사후 진단 결과
        </h2>
        <p className="text-sm text-slate-500 mb-5 ml-9">참가자 {diagnosed.length}명 진단 완료 (전체 {participants.length}명 중 {Math.round(diagnosed.length/participants.length*100)}%)</p>

        {/* 전체 성장 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-6 break-inside-avoid">
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 mb-1">사전 평균 점수</div>
            <div className="text-3xl font-bold text-slate-700">{totalPreAvg}<span className="text-sm font-normal">/5.0</span></div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 mb-1">사후 평균 점수</div>
            <div className="text-3xl font-bold text-emerald-700">{totalPostAvg}<span className="text-sm font-normal">/5.0</span></div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 mb-1">역량 성장률</div>
            <div className="text-3xl font-bold text-blue-700">+{growthRate}%</div>
          </div>
        </div>

        {/* 영역별 사전/사후 비교 */}
        <div className="space-y-4 mb-6">
          {[
            { key: 'understanding', label: 'AI 이해도', desc: 'AI 개념, 원리, 한계 이해' },
            { key: 'toolUsage', label: '도구 활용능력', desc: '프롬프팅, API 활용, 툴 사용' },
            { key: 'problemSolving', label: '문제 해결력', desc: 'AI로 실제 문제 정의 및 접근' },
            { key: 'collaboration', label: '협업/커뮤니케이션', desc: 'AI 프로젝트 팀 내 역할 수행' },
            { key: 'ethics', label: '윤리적 판단력', desc: 'AI 편향, 책임 인식' },
          ].map(item => {
            const pre = preScores[item.key as keyof typeof preScores];
            const post = postScores[item.key as keyof typeof postScores];
            const growth = +(post - pre).toFixed(2);
            const growthPct = pre > 0 ? Math.round((growth/pre)*100) : 0;
            return (
              <div key={item.key} className="bg-slate-50 rounded-xl p-4 break-inside-avoid">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">{item.label}</span>
                    <span className="text-xs text-slate-400 ml-2">{item.desc}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{growth} (↑{growthPct}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 text-right">
                    <span className="text-xs text-slate-500">사전 </span>
                    <span className="text-sm font-bold text-slate-600">{pre}</span>
                  </div>
                  <div className="flex-1 relative h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-slate-400 rounded-full opacity-60" style={{ width: `${(pre/5)*100}%` }}></div>
                    <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${(post/5)*100}%`, opacity: 0.85 }}></div>
                  </div>
                  <div className="w-16">
                    <span className="text-xs text-blue-500">사후 </span>
                    <span className="text-sm font-bold text-blue-700">{post}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ReportCharts data={chartData} section="diagnosis" preScores={preScores} postScores={postScores} />
      </div>

      {/* ===== 3-1. 참가자 역량 분포 히트맵 ===== */}
      <div id="sec-heatmap" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-sm font-bold">3.1</span>
          전체 참가자 역량 분포 히트맵
        </h2>
        <p className="text-sm text-slate-500 mb-5 ml-9">참가자별 5개 영역 역량 점수를 한눈에 파악할 수 있는 히트맵</p>

        {/* Pre Heatmap */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
            사전 진단 (Pre)
          </h3>
          <CompetencyHeatmap participants={participantCompetencyPre} type="pre" />
        </div>

        {/* Post Heatmap */}
        <div className="break-inside-avoid">
          <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            사후 진단 (Post)
          </h3>
          <CompetencyHeatmap participants={participantCompetencyPost} type="post" />
        </div>

        {/* AS-IS / TO-BE 분석 */}
        <div className="mt-8 grid grid-cols-3 gap-4 break-inside-avoid">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 break-inside-avoid">
            <h4 className="text-sm font-bold text-slate-700 mb-3">AS-IS (사전)</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(level => {
                const count = participantCompetencyPre.filter(p => p.level === level).length;
                const pct = (count / participantCompetencyPre.length * 100).toFixed(1);
                return (
                  <div key={level} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Lv.{level}</span>
                    <span className="font-bold text-slate-700">{count}명 ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 break-inside-avoid">
            <h4 className="text-sm font-bold text-blue-700 mb-3">TO-BE (사후)</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(level => {
                const count = participantCompetencyPost.filter(p => p.level === level).length;
                const pct = (count / participantCompetencyPost.length * 100).toFixed(1);
                return (
                  <div key={level} className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">Lv.{level}</span>
                    <span className="font-bold text-blue-700">{count}명 ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 break-inside-avoid">
            <h4 className="text-sm font-bold text-emerald-700 mb-3">전체 평균 변화량</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Lv.3 이상 비율</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {Math.round(participantCompetencyPre.filter(p => p.level >= 3).length / participantCompetencyPre.length * 100)}%
                  <span className="text-sm mx-2">→</span>
                  {Math.round(participantCompetencyPost.filter(p => p.level >= 3).length / participantCompetencyPost.length * 100)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">평균 레벨</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {(participantCompetencyPre.reduce((sum, p) => sum + p.level, 0) / participantCompetencyPre.length).toFixed(1)}
                  <span className="text-sm mx-2">→</span>
                  {(participantCompetencyPost.reduce((sum, p) => sum + p.level, 0) / participantCompetencyPost.length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 3-2. 타 대학 벤치마크 ===== */}
      <div id="sec-benchmark" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">3.2</span>
          타 대학 벤치마크 비교
        </h2>
        <p className="text-sm text-slate-500 mb-5 ml-9">
          참여 대학 평균 대비 우리 학교 학생 수준 (누적 데이터 기반)
        </p>

        <BenchmarkComparison
          currentUniversity={currentUniversityBenchmark}
          benchmarkData={mockBenchmarkData}
        />
      </div>

      {/* ===== 4. 프로젝트 성과 ===== */}
      <div id="sec-projects" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
          팀별 프로젝트 성과
        </h2>

        <ReportCharts data={chartData} section="projects" />

        <div className="overflow-x-auto mt-5">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['팀명', '프로젝트명', '트랙', '주요 기술', '완성도', '점수'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teams.filter(t => t.project).sort((a,b) => {
                const sa = (a.project?.evaluationScore?.creativity||0) + (a.project?.evaluationScore?.techCompletion||0) + (a.project?.evaluationScore?.feasibility||0) + (a.project?.evaluationScore?.teamwork||0) + (a.project?.evaluationScore?.ux||0);
                const sb = (b.project?.evaluationScore?.creativity||0) + (b.project?.evaluationScore?.techCompletion||0) + (b.project?.evaluationScore?.feasibility||0) + (b.project?.evaluationScore?.teamwork||0) + (b.project?.evaluationScore?.ux||0);
                return sb - sa;
              }).map(team => {
                const track = hackathon.tracks.find(t => t.id === team.trackId);
                const s = team.project!.evaluationScore;
                const total = s ? s.creativity+s.techCompletion+s.feasibility+s.teamwork+s.ux : null;
                return (
                  <tr key={team.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800 text-sm">{team.name}</div>
                      {s?.award && <span className="text-xs text-yellow-600 font-semibold">🏆 {s.award}</span>}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700">{team.project!.name}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{track?.name}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {team.project!.techStack.slice(0,3).map(t => (
                          <span key={t} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${team.project!.completionLevel ? (completionColorMap[team.project!.completionLevel] || 'bg-slate-100 text-slate-600') : 'bg-slate-100 text-slate-600'}`}>
                        {team.project!.completionLevel || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-blue-700">{total ? `${total}점` : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 5. 심사 결과 ===== */}
      <div id="sec-evaluation" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
          심사 기준 및 수상 내역
        </h2>

        {/* 심사 기준 */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { label: '창의성 및 아이디어 독창성', score: 25, desc: '문제 정의의 참신함, 기존 솔루션 차별성' },
            { label: '기술 완성도 및 구현력', score: 30, desc: '기능 구현 수준, 코드 품질, 시연 완성도' },
            { label: '실현 가능성 및 비즈니스 가치', score: 20, desc: '시장성, 확장 가능성, 사회적 임팩트' },
            { label: '팀워크 및 발표 능력', score: 15, desc: '역할 분담, 발표 구성, 질의응답' },
            { label: '사용자 경험(UX) 설계', score: 10, desc: '인터페이스 직관성, 사용자 흐름' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{item.score}점</div>
              <div className="text-xs font-semibold text-slate-700 mb-1">{item.label}</div>
              <div className="text-xs text-slate-400 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 수상 내역 */}
        <div className="space-y-3">
          {awards.map(award => {
            const awardTeams = teams.filter(t => t.project?.evaluationScore?.award === award);
            if (awardTeams.length === 0) return null;
            return (
              <div key={award}>
                {awardTeams.map(team => {
                  const s = team.project?.evaluationScore;
                  const total = s ? s.creativity+s.techCompletion+s.feasibility+s.teamwork+s.ux : 0;
                  return (
                    <div key={team.id} className={`rounded-xl p-4 border-l-4 break-inside-avoid ${
                      award === '대상' ? 'bg-yellow-50 border-yellow-400' :
                      award === '최우수상' ? 'bg-orange-50 border-orange-400' :
                      award === '우수상' ? 'bg-blue-50 border-blue-400' :
                      award === '장려상' ? 'bg-slate-50 border-slate-300' :
                      'bg-purple-50 border-purple-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                            award === '대상' ? 'bg-yellow-200 text-yellow-800' :
                            award === '최우수상' ? 'bg-orange-200 text-orange-800' :
                            award === '우수상' ? 'bg-blue-200 text-blue-800' :
                            award === '장려상' ? 'bg-slate-200 text-slate-700' :
                            'bg-purple-200 text-purple-800'
                          }`}>🏆 {award}</span>
                          <span className="font-bold text-slate-800">팀 {team.name}</span>
                          <span className="text-slate-500 text-sm">— {team.project?.name}</span>
                        </div>
                        <span className="font-bold text-blue-700">{total}점 / 100점</span>
                      </div>
                      {s?.judgeComment && (
                        <p className="text-sm text-slate-600 italic ml-1">"{s.judgeComment}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 6. 참가자 피드백 ===== */}
      <div id="sec-feedback" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
          참가자 피드백 및 만족도
        </h2>

        <div className="grid grid-cols-3 gap-5 mb-6 break-inside-avoid">
          {/* NPS */}
          <div className="bg-slate-50 rounded-xl p-5 text-center break-inside-avoid">
            <div className="text-xs text-slate-500 mb-1">NPS 점수 (순추천지수)</div>
            <div className="text-5xl font-bold text-blue-700 mb-2">{npsScore}</div>
            <div className="text-xs text-slate-400 mb-3">응답자 {surveys.length}명 (응답률 {Math.round(surveys.length/participants.length*100)}%)</div>
            <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
              npsScore >= 50 ? 'bg-emerald-100 text-emerald-700' :
              npsScore >= 20 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {npsScore >= 50 ? '우수한 점수' : npsScore >= 20 ? '유리한 점수' : '개선 필요'}
            </div>
          </div>

          {/* 만족도 항목별 */}
          <div className="col-span-2">
            <div className="space-y-3">
              {chartData.satisfactionData.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.avg} / 5.0</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${(item.avg/5)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 정성 피드백 */}
        <div className="grid grid-cols-2 gap-4 break-inside-avoid">
          <div>
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
              <span>✅</span> 주요 긍정 피드백
            </h3>
            <div className="space-y-2">
              {surveys.slice(0,4).map(s => (
                <div key={s.participantId} className="bg-emerald-50 rounded-lg p-2.5 text-sm text-slate-600 border-l-2 border-emerald-400">
                  "{s.positiveComment}"
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
              <span>⚠️</span> 주요 개선 요청
            </h3>
            <div className="space-y-2">
              {surveys.slice(0,4).map(s => (
                <div key={s.participantId} className="bg-amber-50 rounded-lg p-2.5 text-sm text-slate-600 border-l-2 border-amber-400">
                  "{s.improvementComment}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 7. 후속 트래킹 ===== */}
      <div id="sec-followup" className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
          후속 성과 트래킹 (3개월)
        </h2>

        <div className="grid grid-cols-4 gap-4 mb-5 break-inside-avoid">
          {[
            { label: '프로젝트 지속 개발', value: continuedDevCount + '팀', target: '30%+', met: continuedDevCount/Math.max(1,followUps.length) >= 0.3 },
            { label: '창업 연계', value: startupCount + '팀', target: '1건+', met: startupCount >= 1 },
            { label: '대외 수상', value: awardCount + '팀', target: '1건+', met: awardCount >= 1 },
            { label: '팔로업 응답률', value: Math.round(followUps.length/participants.length*100) + '%', target: '30%+', met: followUps.length/participants.length >= 0.3 },
          ].map(item => (
            <div key={item.label} className={`rounded-xl p-4 text-center break-inside-avoid ${item.met ? 'bg-emerald-50' : 'bg-slate-50'}`}>
              <div className={`text-2xl font-bold mb-1 ${item.met ? 'text-emerald-600' : 'text-slate-600'}`}>{item.value}</div>
              <div className="text-xs font-semibold text-slate-600 mb-1">{item.label}</div>
              <div className="text-xs text-slate-400">목표: {item.target}</div>
              <div className={`text-xs font-semibold mt-1 ${item.met ? 'text-emerald-600' : 'text-amber-600'}`}>
                {item.met ? '✓ 달성' : '△ 미달'}
              </div>
            </div>
          ))}
        </div>

        {/* 개별 팔로업 현황 */}
        {followUps.length > 0 && (
          <div className="space-y-2">
            {followUps.map(fu => {
              const p = participants.find(p => p.id === fu.participantId);
              return (
                <div key={fu.participantId} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 text-sm">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                    {p?.name?.[0]}
                  </div>
                  <div className="font-medium text-slate-700">{p?.name}</div>
                  <div className="flex-1 text-slate-500 text-xs">{fu.currentStatus}</div>
                  <div className="flex gap-1">
                    {fu.continuedDevelopment && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">개발 지속</span>}
                    {fu.startupConnected && <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">창업 연계</span>}
                    {fu.externalAward && <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded">대외 수상</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== 8. 종합 결론 ===== */}
      <div id="sec-conclusion" className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 text-white">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
          종합 결론 및 향후 계획
        </h2>

        {/* KPI 달성 여부 */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: '총 참가자', target: hackathon.maxTeams * 4 + '명+', actual: participants.length + '명', met: participants.length >= hackathon.maxTeams * 3 },
            { label: '제출률', target: '80%+', actual: submitRate + '%', met: submitRate >= 80 },
            { label: '만족도', target: '4.0/5.0+', actual: avgSatisfaction + '/5', met: Number(avgSatisfaction) >= 4.0 },
            { label: '역량 성장', target: '20%+', actual: '+' + growthRate + '%', met: Number(growthRate) >= 20 },
            { label: 'NPS', target: '50점+', actual: npsScore + '점', met: npsScore >= 50 },
          ].map(item => (
            <div key={item.label} className={`rounded-xl p-3 text-center ${item.met ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
              <div className={`text-lg font-bold mb-0.5 ${item.met ? 'text-emerald-300' : 'text-white/70'}`}>{item.actual}</div>
              <div className="text-white/60 text-xs mb-1">{item.label}</div>
              <div className="text-white/40 text-xs">{item.target}</div>
              <div className={`text-xs font-bold mt-1 ${item.met ? 'text-emerald-300' : 'text-amber-300'}`}>{item.met ? '✓ 달성' : '△ 미달'}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { title: '단기 (즉시 반영)', items: ['멘토 수 확대 (최소 1팀당 1멘토)', '심사 기준 사전 공개', '야간 시설 담당자 확보'] },
            { title: '중기 (3개월 내)', items: ['수상팀 후속 창업 연계 프로그램 신설', '온라인 병행 참가 옵션 검토', '역량 진단 응답률 향상 인센티브'] },
            { title: '장기 (차기 행사 전)', items: ['타 대학 연합 해커톤 확대', '산업체 스폰서 모집 체계화', '6개월 팔로업 시스템 자동화'] },
          ].map(plan => (
            <div key={plan.title} className="bg-white/10 rounded-xl p-4">
              <div className="font-semibold text-white text-sm mb-3">{plan.title}</div>
              {plan.items.map(item => (
                <div key={item} className="flex items-start gap-2 text-white/70 text-xs mb-1.5">
                  <span className="text-white/40 mt-0.5">•</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const completionColorMap: Record<string, string> = {
  '매우 우수': 'bg-emerald-50 text-emerald-700',
  '우수': 'bg-blue-50 text-blue-700',
  '양호': 'bg-amber-50 text-amber-700',
  '개선 필요': 'bg-red-50 text-red-600',
};
