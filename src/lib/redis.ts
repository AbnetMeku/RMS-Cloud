import "server-only";

import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return globalForRedis.redis;
}

export const SESSION_PREFIX = "rms:session:";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
