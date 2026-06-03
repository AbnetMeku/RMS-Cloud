import "server-only";

import { getRedis } from "@/lib/redis";

export async function publishOrderEvent(tenantId: string, event: string, payload: Record<string, unknown>) {
  try {
    const redis = getRedis();
    await redis.connect().catch(() => undefined);
    await redis.publish(`tenant:${tenantId}:orders`, JSON.stringify({ event, payload, at: Date.now() }));
    if (payload.stationId && typeof payload.stationId === "string") {
      await redis.publish(
        `tenant:${tenantId}:kds:${payload.stationId}`,
        JSON.stringify({ event, payload, at: Date.now() }),
      );
    }
  } catch {
    // Realtime is best-effort when Redis is unavailable
  }
}
