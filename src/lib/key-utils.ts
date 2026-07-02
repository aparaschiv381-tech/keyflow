import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = 'kf_live_' + crypto.randomBytes(24).toString('base64url');
  const prefix = raw.slice(0, 16) + '...';
  const hash = bcrypt.hashSync(raw, 10);
  return { raw, prefix, hash };
}

export function verifyKey(raw: string, hash: string): boolean {
  return bcrypt.compareSync(raw, hash);
}
