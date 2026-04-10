import crypto from 'crypto';

function getSecret() {
  return process.env.AUTH_SECRET || 'dev-secret-change-in-production';
}

/** 해커톤 ID로 초대 토큰 생성 */
export function generateInviteToken(hackathonId: string): string {
  const ts = Date.now().toString();
  const payload = `${hackathonId}.${ts}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 16);
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

/** 초대 토큰 검증 후 hackathonId 반환, 실패 시 null */
export function verifyInviteToken(token: string): { hackathonId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('.');
    if (parts.length !== 3) return null;
    const [hackathonId, ts, sig] = parts;
    const payload = `${hackathonId}.${ts}`;
    const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 16);
    if (sig !== expected) return null;
    return { hackathonId };
  } catch {
    return null;
  }
}
