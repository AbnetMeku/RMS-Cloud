import "server-only";

import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId) {
    return new Response("tenantId required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const channel = `tenant:${tenantId}:orders`;

  const stream = new ReadableStream({
    async start(controller) {
      const redis = getRedis();
      const subscriber = redis.duplicate();
      await subscriber.connect().catch(() => undefined);

      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ event: "connected" }));

      await subscriber.subscribe(channel);
      subscriber.on("message", (_ch, message) => {
        send(message);
      });

      const heartbeat = setInterval(() => send(JSON.stringify({ event: "ping" })), 25000);

      request.signal.addEventListener("abort", async () => {
        clearInterval(heartbeat);
        await subscriber.unsubscribe(channel);
        subscriber.disconnect();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
