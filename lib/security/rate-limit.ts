// In-memory sliding-window rate limiter keyed by an arbitrary string
// (typically a client IP). Lives in module scope so each warm
// serverless instance shares state for the duration of its lifetime;
// resets on cold start. Good enough for blunting drive-by bots on
// /api/leads. Swap to Upstash Redis (or similar) when traffic
// warrants distributed coordination.

type Entry = { hits: number[] };
const store = new Map<string, Entry>();

// Sweep every minute so the Map can't grow unbounded.
const SWEEP_MS = 60_000;
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_MS) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    entry.hits = entry.hits.filter(t => now - t < windowMs);
    if (entry.hits.length === 0) store.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Number of hits in the current window before this call. */
  count: number;
  /** Window cap. */
  limit: number;
  /** Milliseconds until the oldest hit drops out of the window. */
  retryAfterMs: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const entry = store.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter(t => now - t < windowMs);
  const count = entry.hits.length;
  const allowed = count < limit;
  if (allowed) {
    entry.hits.push(now);
    store.set(key, entry);
  }
  const retryAfterMs = entry.hits.length > 0
    ? Math.max(0, windowMs - (now - entry.hits[0]))
    : 0;
  return { allowed, count, limit, retryAfterMs };
}

// Test-only.
export function _resetRateLimit() {
  store.clear();
  lastSweep = 0;
}
