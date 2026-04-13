-- AI 역량 진단 결과 테이블
-- Supabase 대시보드 > SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS diagnosis_results (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  hackathon_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pre', 'post')),
  scores JSONB NOT NULL DEFAULT '{}',
  total_score NUMERIC(4,1) DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (participant_id, hackathon_id, type)
);

-- 만족도 설문 응답 테이블

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  hackathon_id TEXT NOT NULL,
  ratings JSONB NOT NULL DEFAULT '{}',
  nps INTEGER,
  positive TEXT DEFAULT '',
  improvement TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (participant_id, hackathon_id)
);
