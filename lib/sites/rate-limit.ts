// Pembatas laju sederhana di memori (per instance). Cukup untuk mencegah spam ringan ke chat publik.

export function createRateLimiter({ windowMs, max, maxKeys = 5000 }: { windowMs: number; max: number; maxKeys?: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  /** true bila key sudah melewati batas pada jendela waktu ini. */
  return function limited(key: string, now = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= maxKeys) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      if (hits.size >= maxKeys) hits.clear();
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > max;
  };
}

/** IP klien dari header proxy (Vercel/NGINX). */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "anon";
}
