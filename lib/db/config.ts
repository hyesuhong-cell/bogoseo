/**
 * Database Connection Configuration
 * 
 * Supports multiple database options:
 * 1. Vercel Postgres (Production - Recommended)
 * 2. Supabase (Alternative)
 * 3. PlanetScale (MySQL)
 * 4. Local PostgreSQL
 */

// Option 1: Vercel Postgres (가장 추천)
export const vercelPostgresConfig = {
  provider: 'vercel-postgres',
  connectionString: process.env.POSTGRES_URL,
  // .env.local에 추가:
  // POSTGRES_URL="postgres://username:password@host:port/database"
};

// Option 2: Supabase (무료 티어 있음)
export const supabaseConfig = {
  provider: 'supabase',
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // .env.local에 추가:
  // NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
  // NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
};

// Option 3: PlanetScale (MySQL, 무료 티어)
export const planetScaleConfig = {
  provider: 'planetscale',
  url: process.env.DATABASE_URL,
  // .env.local에 추가:
  // DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"
};

// Option 4: Local PostgreSQL (개발용)
export const localPostgresConfig = {
  provider: 'local-postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ai_hackathon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

// 환경별 설정 선택
export const dbConfig = process.env.NODE_ENV === 'production'
  ? vercelPostgresConfig
  : localPostgresConfig;

export type DbProvider = 'vercel-postgres' | 'supabase' | 'planetscale' | 'local-postgres';
