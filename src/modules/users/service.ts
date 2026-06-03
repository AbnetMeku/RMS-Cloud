import bcrypt from "bcryptjs";
import { Permission, Role } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function listTenantUsers(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId },
    include: { permissions: true, assignedStations: { include: { station: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createUser(input: {
  tenantId: string;
  name: string;
  username: string;
  email?: string;
  role: Role;
  password?: string;
  pin?: string;
}) {
  if (input.role === Role.SUPER_ADMIN) {
    throw new AppError("Cannot create super admin from tenant", "FORBIDDEN");
  }

  const data: Parameters<typeof prisma.user.create>[0]["data"] = {
    tenantId: input.tenantId,
    name: input.name,
    username: input.username,
    email: input.email,
    role: input.role,
  };

  if (input.role === Role.WAITER || input.role === Role.KITCHEN) {
    if (!input.pin) throw new AppError("PIN required for this role", "VALIDATION");
    data.pinHash = await bcrypt.hash(input.pin, 10);
  } else {
    if (!input.password) throw new AppError("Password required for this role", "VALIDATION");
    data.passwordHash = await bcrypt.hash(input.password, 10);
  }

  return prisma.user.create({ data });
}

export async function updateUserStatus(tenantId: string, userId: string, isActive: boolean) {
  return prisma.user.updateMany({ where: { id: userId, tenantId }, data: { isActive } });
}

export async function resetUserPassword(tenantId: string, userId: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.updateMany({
    where: { id: userId, tenantId, role: { notIn: [Role.WAITER, Role.KITCHEN] } },
    data: { passwordHash },
  });
}

export async function resetUserPin(tenantId: string, userId: string, pin: string) {
  const pinHash = await bcrypt.hash(pin, 10);
  return prisma.user.updateMany({
    where: { id: userId, tenantId, role: { in: [Role.WAITER, Role.KITCHEN] } },
    data: { pinHash },
  });
}

export async function assignWaiterToTable(tenantId: string, tableId: string, waiterId: string | null) {
  return prisma.restaurantTable.updateMany({
    where: { id: tableId, tenantId },
    data: { waiterId },
  });
}

export async function assignKitchenToStation(tenantId: string, stationId: string, userId: string) {
  return prisma.stationUser.upsert({
    where: { stationId_userId: { stationId, userId } },
    create: { tenantId, stationId, userId },
    update: {},
  });
}

export async function listWaiters(tenantId: string) {
  return prisma.user.findMany({ where: { tenantId, role: Role.WAITER, isActive: true } });
}

export async function listKitchenUsers(tenantId: string) {
  return prisma.user.findMany({ where: { tenantId, role: Role.KITCHEN, isActive: true } });
}

export type UserUpdateRole = Role;

export { Permission };
