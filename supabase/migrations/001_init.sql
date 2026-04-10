-- 어드민 계정 (슈퍼어드민이 생성한 대학 담당자)
CREATE TABLE IF NOT EXISTS admin_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  university TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- 초대 링크로 가입한 참가자
CREATE TABLE IF NOT EXISTS registered_participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  student_id TEXT UNIQUE NOT NULL,
  hackathon_id TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  department TEXT,
  grade INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security 비활성화 (서버에서 service_role로만 접근)
ALTER TABLE admin_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE registered_participants DISABLE ROW LEVEL SECURITY;
