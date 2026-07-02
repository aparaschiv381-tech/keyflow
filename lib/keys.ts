import crypto from 'crypto'

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = 'kf_live_' + crypto.randomBytes(24).toString('base64url')
  const prefix = raw.substring(0, 16) + '...'
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, prefix, hash }
}

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}
