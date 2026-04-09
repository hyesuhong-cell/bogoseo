export interface ReportData {
  hackathon: {
    id: string;
    name: string;
    university: string;
    startDate: string;
    endDate: string;
    venue: string;
    host: string;
    organizer: string;
    theme: string;
  };
  metrics: {
    participantCount: number;
    teamCount: number;
    submitRate: number;
    growthRate: number;
    satisfaction: number;
    nps: number;
    preAvg: number;
    postAvg: number;
  };
  competency: {
    pre: {
      understanding: number;
      toolUsage: number;
      problemSolving: number;
      collaboration: number;
      ethics: number;
    };
    post: {
      understanding: number;
      toolUsage: number;
      problemSolving: number;
      collaboration: number;
      ethics: number;
    };
  };
  awards: {
    teamName: string;
    projectName: string;
    award: string;
    score: number;
  }[];
  followUps: {
    continuedDev: number;
    startup: number;
    externalAward: number;
  };
}

/**
 * Generate a print-optimized version of the report
 * This function triggers the browser's print dialog with optimized styles
 */
export function generatePrintReport() {
  window.print();
}

/**
 * Export report data as JSON for external processing
 */
export function exportReportJSON(data: ReportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.hackathon.name}_report_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export report data as CSV for spreadsheet analysis
 */
export function exportReportCSV(data: ReportData): void {
  const rows = [
    ['구분', '항목', '값'],
    ['행사 정보', '행사명', data.hackathon.name],
    ['행사 정보', '대학', data.hackathon.university],
    ['행사 정보', '기간', `${data.hackathon.startDate} ~ ${data.hackathon.endDate}`],
    ['', '', ''],
    ['핵심 지표', '참가자 수', data.metrics.participantCount],
    ['핵심 지표', '팀 수', data.metrics.teamCount],
    ['핵심 지표', '제출률', `${data.metrics.submitRate}%`],
    ['핵심 지표', '성장률', `${data.metrics.growthRate}%`],
    ['핵심 지표', '만족도', `${data.metrics.satisfaction}/5.0`],
    ['핵심 지표', 'NPS', data.metrics.nps],
    ['', '', ''],
    ['사전 역량', 'AI 이해도', data.competency.pre.understanding],
    ['사전 역량', '도구 활용', data.competency.pre.toolUsage],
    ['사전 역량', '문제 해결', data.competency.pre.problemSolving],
    ['사전 역량', '협업', data.competency.pre.collaboration],
    ['사전 역량', '윤리 판단', data.competency.pre.ethics],
    ['', '', ''],
    ['사후 역량', 'AI 이해도', data.competency.post.understanding],
    ['사후 역량', '도구 활용', data.competency.post.toolUsage],
    ['사후 역량', '문제 해결', data.competency.post.problemSolving],
    ['사후 역량', '협업', data.competency.post.collaboration],
    ['사후 역량', '윤리 판단', data.competency.post.ethics],
  ];

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.hackathon.name}_data_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share report via email (opens default email client)
 */
export function shareReportViaEmail(data: ReportData): void {
  const subject = encodeURIComponent(`[성과 리포트] ${data.hackathon.name}`);
  const body = encodeURIComponent(`
${data.hackathon.name} 성과 리포트

📊 핵심 지표
- 참가자 수: ${data.metrics.participantCount}명
- AI 역량 성장률: +${data.metrics.growthRate}%
- 참가자 만족도: ${data.metrics.satisfaction}/5.0
- NPS 점수: ${data.metrics.nps}점

자세한 내용은 첨부된 리포트를 확인해주세요.
  `.trim());

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Copy report summary to clipboard
 */
export async function copyReportSummary(data: ReportData): Promise<boolean> {
  const summary = `
📊 ${data.hackathon.name} 성과 리포트

🏫 ${data.hackathon.university}
📅 ${data.hackathon.startDate} ~ ${data.hackathon.endDate}

핵심 지표:
• 참가자 수: ${data.metrics.participantCount}명
• AI 역량 성장률: +${data.metrics.growthRate}%
• 참가자 만족도: ${data.metrics.satisfaction}/5.0
• NPS 점수: ${data.metrics.nps}점
• 프로젝트 제출률: ${data.metrics.submitRate}%

AI 역량 변화:
• 사전 평균: ${data.metrics.preAvg}/5.0
• 사후 평균: ${data.metrics.postAvg}/5.0
• 향상: +${(data.metrics.postAvg - data.metrics.preAvg).toFixed(2)}점

후속 성과:
• 프로젝트 지속 개발: ${data.followUps.continuedDev}팀
• 창업 연계: ${data.followUps.startup}팀
• 대외 수상: ${data.followUps.externalAward}팀
  `.trim();

  try {
    await navigator.clipboard.writeText(summary);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
