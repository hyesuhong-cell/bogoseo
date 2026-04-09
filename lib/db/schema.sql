-- AI Hackathon Platform Database Schema
-- PostgreSQL / MySQL / SQLite 호환

-- 1. 해커톤 기본 정보
CREATE TABLE hackathons (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    university VARCHAR(100) NOT NULL,
    theme TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    venue VARCHAR(255),
    host VARCHAR(100),
    organizer VARCHAR(100),
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, ongoing, completed
    description TEXT,
    max_teams INTEGER,
    max_members_per_team INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 트랙 정보
CREATE TABLE tracks (
    id VARCHAR(50) PRIMARY KEY,
    hackathon_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
);

-- 3. 참가자 정보
CREATE TABLE participants (
    id VARCHAR(50) PRIMARY KEY,
    hackathon_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    major VARCHAR(100),
    major_category VARCHAR(50),
    grade INTEGER,
    gender VARCHAR(10),
    is_external BOOLEAN DEFAULT FALSE,
    team_id VARCHAR(50),
    survey_completed BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
);

-- 4. AI 역량 진단 (사전)
CREATE TABLE competency_assessments_pre (
    id VARCHAR(50) PRIMARY KEY,
    participant_id VARCHAR(50) NOT NULL,
    understanding DECIMAL(3,2) NOT NULL, -- 1.00 ~ 5.00
    tool_usage DECIMAL(3,2) NOT NULL,
    problem_solving DECIMAL(3,2) NOT NULL,
    collaboration DECIMAL(3,2) NOT NULL,
    ethics DECIMAL(3,2) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- 5. AI 역량 진단 (사후)
CREATE TABLE competency_assessments_post (
    id VARCHAR(50) PRIMARY KEY,
    participant_id VARCHAR(50) NOT NULL,
    understanding DECIMAL(3,2) NOT NULL,
    tool_usage DECIMAL(3,2) NOT NULL,
    problem_solving DECIMAL(3,2) NOT NULL,
    collaboration DECIMAL(3,2) NOT NULL,
    ethics DECIMAL(3,2) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- 6. 팀 정보
CREATE TABLE teams (
    id VARCHAR(50) PRIMARY KEY,
    hackathon_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    track_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

-- 7. 프로젝트 정보
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tech_stack TEXT, -- JSON array
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    presentation_url VARCHAR(500),
    completion_level VARCHAR(50),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 8. 프로젝트 평가
CREATE TABLE evaluations (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    creativity INTEGER, -- 0-25
    tech_completion INTEGER, -- 0-30
    feasibility INTEGER, -- 0-20
    teamwork INTEGER, -- 0-15
    ux INTEGER, -- 0-10
    award VARCHAR(50), -- 대상, 최우수상, 우수상, 장려상, 특별상
    judge_comment TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 9. 만족도 설문
CREATE TABLE satisfaction_surveys (
    id VARCHAR(50) PRIMARY KEY,
    participant_id VARCHAR(50) NOT NULL,
    hackathon_id VARCHAR(50) NOT NULL,
    overall INTEGER, -- 1-5
    theme INTEGER,
    mentoring INTEGER,
    venue INTEGER,
    fairness INTEGER,
    rewillingness INTEGER,
    nps INTEGER, -- 0-10
    positive_comment TEXT,
    improvement_comment TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
);

-- 10. 후속 추적
CREATE TABLE follow_ups (
    id VARCHAR(50) PRIMARY KEY,
    participant_id VARCHAR(50) NOT NULL,
    hackathon_id VARCHAR(50) NOT NULL,
    current_status TEXT,
    continued_development BOOLEAN DEFAULT FALSE,
    startup_connected BOOLEAN DEFAULT FALSE,
    external_award BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    notes TEXT,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
);

-- 11. 벤치마크 데이터 (집계된 데이터)
CREATE TABLE university_benchmarks (
    id VARCHAR(50) PRIMARY KEY,
    university VARCHAR(100) NOT NULL,
    hackathon_id VARCHAR(50),
    participant_count INTEGER,
    avg_pre_score DECIMAL(3,2),
    avg_post_score DECIMAL(3,2),
    growth_rate DECIMAL(5,2),
    satisfaction DECIMAL(3,2),
    nps INTEGER,
    project_submit_rate INTEGER,
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX idx_participants_hackathon ON participants(hackathon_id);
CREATE INDEX idx_participants_team ON participants(team_id);
CREATE INDEX idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_surveys_hackathon ON satisfaction_surveys(hackathon_id);
CREATE INDEX idx_follow_ups_hackathon ON follow_ups(hackathon_id);
CREATE INDEX idx_competency_pre_participant ON competency_assessments_pre(participant_id);
CREATE INDEX idx_competency_post_participant ON competency_assessments_post(participant_id);
