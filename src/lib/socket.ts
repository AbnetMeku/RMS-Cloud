/**
 * Realtime transport: Redis pub/sub → SSE (/api/events).
 * Socket.io is listed in dependencies for future custom-server deployment;
 * the MVP uses SSE + Redis which satisfies the same event contract.
 */
export { publishOrderEvent } from "@/lib/socket-publisher";

export const ORDER_EVENTS = [
  "order:opened",
  "order:item_sent",
  "order:item_ready",
  "order:closed",
  "order:paid",
] as const;
