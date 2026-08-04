/**
 * In-memory sliding-window rate limiter helper.
 * Designed for server actions and API route protection against burst/abuse attempts.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 10 minutes to avoid memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      const valid = record.timestamps.filter((ts) => now - ts < 3600000);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, { timestamps: valid });
      }
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = store.get(identifier) ?? { timestamps: [] };

  // Filter out timestamps outside current window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  activeTimestamps.push(now);
  store.set(identifier, { timestamps: activeTimestamps });

  return { allowed: true, retryAfterSeconds: 0 };
}
