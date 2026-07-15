export const RATE_LIMIT_CONFIG = {
  AUTH_MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS || '5', 10),
  AUTH_BASE_DELAY_MS: parseInt(process.env.RATE_LIMIT_AUTH_DELAY_MS || '1000', 10),
  AUTH_DECAY_MS: 60 * 60 * 1000, // 1 hour without attempts to reset
  PUBLIC_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || '10', 10),
  PUBLIC_WINDOW_MS: 60 * 1000, // 1 minute
  AUTHED_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_AUTHED_MAX || '60', 10),
  AUTHED_WINDOW_MS: 60 * 1000, // 1 minute
};

interface RateLimitInfo {
  timestamps: number[];
  attempts: number;
  blockedUntil: number;
  expiresAt: number;
}

const store = new Map<string, RateLimitInfo>();

// Simple cleanup interval to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, info] of store.entries()) {
      if (now > info.expiresAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}

function getInfo(key: string): RateLimitInfo {
  if (!store.has(key)) {
    store.set(key, { timestamps: [], attempts: 0, blockedUntil: 0, expiresAt: Date.now() + 60000 });
  }
  return store.get(key)!;
}

export function checkExponentialBackoff(ip: string, account: string) {
  const ipKey = `ip_${ip}`;
  const accountKey = `acc_${account}`;
  
  const ipInfo = getInfo(ipKey);
  const accountInfo = getInfo(accountKey);
  
  const now = Date.now();
  
  // Update expiries
  ipInfo.expiresAt = now + RATE_LIMIT_CONFIG.AUTH_DECAY_MS;
  accountInfo.expiresAt = now + RATE_LIMIT_CONFIG.AUTH_DECAY_MS;
  
  const maxBlockedUntil = Math.max(ipInfo.blockedUntil, accountInfo.blockedUntil);
  if (now < maxBlockedUntil) {
    return { success: false, retryAfterMs: maxBlockedUntil - now };
  }
  
  // Record attempt
  ipInfo.attempts++;
  accountInfo.attempts++;
  
  let ipDelay = 0;
  if (ipInfo.attempts > RATE_LIMIT_CONFIG.AUTH_MAX_ATTEMPTS) {
    ipDelay = RATE_LIMIT_CONFIG.AUTH_BASE_DELAY_MS * Math.pow(2, ipInfo.attempts - RATE_LIMIT_CONFIG.AUTH_MAX_ATTEMPTS);
  }
  
  let accDelay = 0;
  if (accountInfo.attempts > RATE_LIMIT_CONFIG.AUTH_MAX_ATTEMPTS) {
    accDelay = RATE_LIMIT_CONFIG.AUTH_BASE_DELAY_MS * Math.pow(2, accountInfo.attempts - RATE_LIMIT_CONFIG.AUTH_MAX_ATTEMPTS);
  }
  
  const nextDelay = Math.max(ipDelay, accDelay);
  if (nextDelay > 0) {
    ipInfo.blockedUntil = now + nextDelay;
    accountInfo.blockedUntil = now + nextDelay;
  }
  
  return { success: true };
}

export function resetExponentialBackoff(ip: string, account: string) {
   store.delete(`ip_${ip}`);
   store.delete(`acc_${account}`);
}

export function checkFixedWindow(ip: string, maxRequests: number, windowMs: number) {
  const key = `fw_${ip}`;
  const info = getInfo(key);
  const now = Date.now();
  
  // Clean up old timestamps
  info.timestamps = info.timestamps.filter(t => now - t < windowMs);
  
  if (info.timestamps.length >= maxRequests) {
    info.expiresAt = now + windowMs;
    return { success: false, retryAfterMs: windowMs - (now - info.timestamps[0]) };
  }
  
  info.timestamps.push(now);
  info.expiresAt = now + windowMs;
  return { success: true };
}
