-- 팀 관리 테이블 생성
-- Supabase 대시보드 > SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  hackathon_id TEXT NOT NULL,
  name TEXT NOT NULL,
  track_id TEXT,
  leader_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  PRIMARY KEY (team_id, participant_id)
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  completion_level TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  creativity INTEGER DEFAULT 0,
  tech_completion INTEGER DEFAULT 0,
  feasibility INTEGER DEFAULT 0,
  teamwork INTEGER DEFAULT 0,
  ux INTEGER DEFAULT 0,
  award TEXT,
  judge_comment TEXT,
  evaluated_at TIMESTAMPTZ DEFAULT now()
);
