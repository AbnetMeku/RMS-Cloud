import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getServerSession } from "@/lib/server-session";
import { getRoleHomePath } from "@/lib/session-constants";

const routeRoles: Record<string, Role[]> = {
  "/super-admin": ["SUPER_ADMIN"],
  "/admin": ["ADMIN", "MANAGER"],
  "/waiter": ["WAITER"],
  "/kds": ["KITCHEN"],
  "/cashier": ["CASHIER"],
};

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(getRoleHomePath(session.role));
  }
  return session;
}

export async function requireRouteAccess(pathPrefix: string) {
  const session = await requireAuth();
  const allowed = routeRoles[pathPrefix];
  if (allowed && !allowed.includes(session.role)) {
    redirect(getRoleHomePath(session.role));
  }
  // Allow /admin/* subroutes for ADMIN and MANAGER
  if (pathPrefix.startsWith("/admin") && !["ADMIN", "MANAGER"].includes(session.role)) {
    redirect(getRoleHomePath(session.role));
  }
  return session;
}
