import "server-only";

import { randomBytes } from "crypto";
import { getRedis, SESSION_PREFIX, SESSION_TTL_SECONDS } from "@/lib/redis";
import type { SessionData } from "@/lib/session-constants";

export { SESSION_COOKIE, SESSION_TTL_SECONDS, getRoleHomePath } from "@/lib/session-constants";
export type { SessionData };

export async function createSession(data: SessionData): Promise<string> {
  const sessionId = randomBytes(32).toString("hex");
  const redis = getRedis();
  await redis.connect().catch(() => undefined);
  await redis.setex(`${SESSION_PREFIX}${sessionId}`, SESSION_TTL_SECONDS, JSON.stringify(data));
  return sessionId;
}

export async function getSession(sessionId: string | undefined): Promise<SessionData | null> {
  if (!sessionId) return null;
  const redis = getRedis();
  await redis.connect().catch(() => undefined);
  const raw = await redis.get(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) return null;
  return JSON.parse(raw) as SessionData;
}

export async function destroySession(sessionId: string | undefined): Promise<void> {
  if (!sessionId) return;
  const redis = getRedis();
  await redis.connect().catch(() => undefined);
  await redis.del(`${SESSION_PREFIX}${sessionId}`);
}
