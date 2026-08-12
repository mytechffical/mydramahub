type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const old = buckets.get(key);

  if (!old || old.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (old.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((old.resetAt - now) / 1000) };
  }

  old.count += 1;
  return { ok: true, retryAfter: 0 };
}
