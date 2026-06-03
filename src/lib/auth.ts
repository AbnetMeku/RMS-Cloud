import "server-only";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import type { SessionData } from "@/lib/session-constants";

const PASSWORD_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.CASHIER];
const PIN_ROLES: Role[] = [Role.WAITER, Role.KITCHEN];

async function buildSession(user: {
  id: string;
  tenantId: string | null;
  role: Role;
  name: string;
  username: string;
  permissions: { permission: import("@prisma/client").Permission }[];
}): Promise<string> {
  const data: SessionData = {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    name: user.name,
    username: user.username,
    permissions: user.permissions.map((p) => p.permission),
  };
  return createSession(data);
}

export async function loginWithPassword(username: string, password: string): Promise<string> {
  const user = await prisma.user.findFirst({
    where: {
      username,
      isActive: true,
      role: { in: PASSWORD_ROLES },
    },
    include: { permissions: true },
  });

  if (!user?.passwordHash) {
    throw new AppError("Invalid username or password", "INVALID_CREDENTIALS", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid username or password", "INVALID_CREDENTIALS", 401);
  }

  return buildSession(user);
}

export async function loginWithPin(tenantId: string, pin: string): Promise<string> {
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      isActive: true,
      role: { in: PIN_ROLES },
      pinHash: { not: null },
    },
    include: { permissions: true },
  });

  for (const user of users) {
    if (user.pinHash && (await bcrypt.compare(pin, user.pinHash))) {
      return buildSession(user);
    }
  }

  throw new AppError("Invalid PIN", "INVALID_CREDENTIALS", 401);
}

export async function listActiveTenantsForPinLogin() {
  return prisma.tenant.findMany({
    where: { subscriptionStatus: "ACTIVE" },
    select: { id: true, name: true, branchName: true },
    orderBy: { name: "asc" },
  });
}
