"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginWithPassword, loginWithPin } from "@/lib/auth";
import { isAppError } from "@/lib/errors";
import { clearServerSession } from "@/lib/server-session";
import { getRoleHomePath, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/session-constants";
import { getSession } from "@/lib/session";

async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function loginStaffAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const sessionId = await loginWithPassword(username, password);
    await setSessionCookie(sessionId);
    const session = await getSession(sessionId);
    redirect(getRoleHomePath(session!.role));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = isAppError(error) ? error.message : "Login failed";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
}

export async function loginPinAction(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  try {
    const sessionId = await loginWithPin(tenantId, pin);
    await setSessionCookie(sessionId);
    const session = await getSession(sessionId);
    redirect(getRoleHomePath(session!.role));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = isAppError(error) ? error.message : "Login failed";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}

export async function logoutAction() {
  await clearServerSession();
  redirect("/login");
}
