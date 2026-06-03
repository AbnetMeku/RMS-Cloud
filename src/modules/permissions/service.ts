import { Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getUserPermissions(tenantId: string, userId: string) {
  return prisma.userPermission.findMany({ where: { tenantId, userId } });
}

export async function setUserPermissions(tenantId: string, userId: string, permissions: Permission[]) {
  await prisma.$transaction([
    prisma.userPermission.deleteMany({ where: { tenantId, userId } }),
    prisma.userPermission.createMany({
      data: permissions.map((permission) => ({ tenantId, userId, permission })),
    }),
  ]);
}

export async function grantPermission(tenantId: string, userId: string, permission: Permission) {
  return prisma.userPermission.upsert({
    where: { userId_permission: { userId, permission } },
    create: { tenantId, userId, permission },
    update: {},
  });
}

export async function revokePermission(tenantId: string, userId: string, permission: Permission) {
  return prisma.userPermission.deleteMany({ where: { tenantId, userId, permission } });
}

export { Permission };
