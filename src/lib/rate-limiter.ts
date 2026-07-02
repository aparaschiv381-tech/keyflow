/**
 * In-memory sliding window rate limiter using a Map.
 * For production scale, swap this for Upstash Redis.
 * Tracks calls per (keyId, minute) window.
 */
const store = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  keyId: string,
  limitPerMinute: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60_000;
  const entry = store.get(keyId);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(keyId, { count: 1, windowStart: now });
    return { allowed: true, remaining: limitPerMinute - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, limitPerMinute - entry.count);
  return { allowed: entry.count <= limitPerMinute, remaining };
}
