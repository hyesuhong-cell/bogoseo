/**
 * 관리자 비밀번호 해시 생성 스크립트
 * 실행: node scripts/create-admin.mjs
 */
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('설정할 관리자 비밀번호를 입력하세요: ', async (password) => {
  const hash = await bcrypt.hash(password, 12);
  console.log('\n✅ 아래 값을 .env.local 또는 Vercel 환경변수에 설정하세요:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  rl.close();
});
