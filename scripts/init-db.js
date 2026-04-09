/**
 * Database initialization script
 * Run this to set up the database with sample data
 */

const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Check if tables exist
    const tablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'hackathons'
      );
    `;

    if (tablesExist.rows[0].exists) {
      console.log('✅ Tables already exist. Skipping schema creation.');
    } else {
      console.log('📝 Creating schema...');
      // Read and execute schema.sql
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, '../lib/db/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons and execute each statement
      const statements = schema.split(';').filter(s => s.trim());
      for (const statement of statements) {
        await sql.query(statement);
      }
      console.log('✅ Schema created successfully.');
    }

    // Insert sample data (if not exists)
    const hackathonExists = await sql`
      SELECT EXISTS (
        SELECT FROM hackathons WHERE id = 'hack-2025-001'
      );
    `;

    if (!hackathonExists.rows[0].exists) {
      console.log('📝 Inserting sample data...');
      
      // Insert hackathon
      await sql`
        INSERT INTO hackathons (
          id, name, university, theme, start_date, end_date,
          venue, host, organizer, status, max_teams, max_members_per_team
        ) VALUES (
          'hack-2025-001',
          'AI 기반 사회문제 해결 해커톤 2025',
          '한국대학교',
          'AI 기반 사회문제 해결 솔루션 개발',
          '2025-03-13',
          '2025-03-15',
          '한국대학교 공학관 B1 창업카페',
          'SW중심대학사업단',
          '컴퓨터공학과 학생회',
          'completed',
          25,
          5
        )
      `;

      // Insert tracks
      await sql`
        INSERT INTO tracks (id, hackathon_id, name, description) VALUES
        ('t1', 'hack-2025-001', 'AI·데이터 활용', 'AI 모델 및 데이터 분석 기반 솔루션'),
        ('t2', 'hack-2025-001', '헬스케어·복지', '의료 및 사회복지 분야 기술 솔루션'),
        ('t3', 'hack-2025-001', '환경·지속가능성', '환경 보호 및 지속 가능한 발전 솔루션'),
        ('t4', 'hack-2025-001', '교육·사회', '교육 혁신 및 사회 문제 해결 솔루션')
      `;

      console.log('✅ Sample data inserted successfully.');
    } else {
      console.log('✅ Sample data already exists.');
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
