import { redirect } from "next/navigation";
import type { Permission } from "@prisma/client";
import { requireRouteAccess } from "@/lib/route-guard";
import { requirePermission, requireTenantId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export async function getAdminContext() {
  const session = await requireRouteAccess("/admin");
  const tenantId = requireTenantId(session);
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  return { session, tenantId, tenant };
}

export async function requireAdminPermission(permission?: Permission) {
  const ctx = await getAdminContext();
  if (permission && ctx.session.role === "MANAGER") {
    requirePermission(ctx.session, permission);
  }
  return ctx;
}

export async function guardAdminSection(permission?: Permission) {
  const ctx = await getAdminContext();
  if (ctx.session.role === "ADMIN") return ctx;
  if (!permission) return ctx;
  if (!ctx.session.permissions.includes(permission)) {
    redirect("/admin");
  }
  return ctx;
}
