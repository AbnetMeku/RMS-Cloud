import type { Permission } from "@prisma/client";
import { AppError } from "@/lib/errors";
import type { SessionData } from "@/lib/session-constants";

export function requireSession(session: SessionData | null): SessionData {
  if (!session) {
    throw new AppError("Not authenticated", "UNAUTHORIZED", 401);
  }
  return session;
}

export function requireTenantId(session: SessionData): string {
  if (!session.tenantId) {
    throw new AppError("Tenant context required", "TENANT_REQUIRED", 403);
  }
  return session.tenantId;
}

export function requireRole(session: SessionData, roles: SessionData["role"][]): void {
  if (!roles.includes(session.role)) {
    throw new AppError("Insufficient role", "FORBIDDEN", 403);
  }
}

export function requirePermission(session: SessionData, permission: Permission): void {
  if (session.role === "ADMIN" || session.role === "SUPER_ADMIN") return;
  if (!session.permissions.includes(permission)) {
    throw new AppError("Insufficient permission", "FORBIDDEN", 403);
  }
}

export function withTenantScope<T extends { tenantId?: string }>(
  session: SessionData,
  data: T,
): T & { tenantId: string } {
  const tenantId = requireTenantId(session);
  return { ...data, tenantId };
}
