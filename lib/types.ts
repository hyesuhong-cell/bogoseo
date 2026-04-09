// ========== 타입 정의 ==========

export type UserRole = 'admin' | 'participant';

export interface Hackathon {
  id: string;
  name: string;
  university: string;
  theme: string;
  startDate: string;
  endDate: string;
  venue: string;
  host: string;
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  maxTeams: number;
  maxMembersPerTeam: number;
  tracks: Track[];
}

export interface Track {
  id: string;
  name: string;
  description: string;
}

export interface Participant {
  id: string;
  hackathonId: string;
  name: string;
  studentId: string;
  email: string;
  major: string;
  majorCategory: '공학(컴퓨터·전자)' | '공학(기타)' | '인문·사회' | '예술·디자인' | '기타';
  grade: 1 | 2 | 3 | 4;
  gender: '남성' | '여성';
  isExternal: boolean;
  teamId?: string;
  preScore?: DiagnosisScore;
  postScore?: DiagnosisScore;
  surveyCompleted: boolean;
  registeredAt: string;
}

export interface DiagnosisScore {
  understanding: number;   // AI 이해도 (1-5)
  toolUsage: number;       // 도구 활용능력 (1-5)
  problemSolving: number;  // 문제 해결력 (1-5)
  collaboration: number;   // 협업/커뮤니케이션 (1-5)
  ethics: number;          // 윤리적 판단력 (1-5)
  completedAt: string;
}

export interface Team {
  id: string;
  hackathonId: string;
  name: string;
  trackId: string;
  members: string[]; // participant IDs
  leaderId: string;
  project?: Project;
}

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string;
  problemStatement: string;
  coreFeatures: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  submittedAt: string;
  evaluationScore?: EvaluationScore;
  completionLevel?: '매우 우수' | '우수' | '양호' | '개선 필요';
}

export interface EvaluationScore {
  creativity: number;      // 창의성 및 아이디어 독창성 (25점)
  techCompletion: number;  // 기술 완성도 및 구현력 (30점)
  feasibility: number;     // 실현 가능성 및 비즈니스 가치 (20점)
  teamwork: number;        // 팀워크 및 발표 능력 (15점)
  ux: number;              // 사용자 경험(UX) 설계 (10점)
  judgeComment: string;
  award?: '대상' | '최우수상' | '우수상' | '장려상' | '특별상';
}

export interface SatisfactionSurvey {
  participantId: string;
  hackathonId: string;
  overall: number;
  theme: number;
  mentoring: number;
  venue: number;
  fairness: number;
  rewillingness: number;
  positiveComment: string;
  improvementComment: string;
  nps: number; // 0-10
  completedAt: string;
}

export interface FollowUp {
  participantId: string;
  hackathonId: string;
  period: '3개월' | '6개월';
  continuedDevelopment: boolean;
  startupConnected: boolean;
  patentFiled: boolean;
  externalAward: boolean;
  currentStatus: string;
  completedAt: string;
}

// ========== 진단 문항 타입 ==========
export interface DiagnosisQuestion {
  id: string;
  category: keyof DiagnosisScore;
  categoryLabel: string;
  question: string;
  options: string[];
}
