import "server-only";

import { cookies } from "next/headers";
import { destroySession, getSession } from "@/lib/session";
import { SESSION_COOKIE, type SessionData } from "@/lib/session-constants";

export async function getServerSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  return getSession(sessionId);
}

export async function clearServerSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  await destroySession(sessionId);
  cookieStore.delete(SESSION_COOKIE);
}
