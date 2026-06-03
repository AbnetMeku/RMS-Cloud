import { prisma } from "@/lib/prisma";

export async function listStations(tenantId: string) {
  return prisma.station.findMany({
    where: { tenantId },
    include: { users: { include: { user: true } }, menuItems: true },
    orderBy: { name: "asc" },
  });
}

export async function createStation(tenantId: string, name: string) {
  return prisma.station.create({ data: { tenantId, name } });
}

export async function assignUserToStation(tenantId: string, stationId: string, userId: string) {
  return prisma.stationUser.upsert({
    where: { stationId_userId: { stationId, userId } },
    create: { tenantId, stationId, userId },
    update: {},
  });
}

export async function getUserStationIds(tenantId: string, userId: string) {
  const rows = await prisma.stationUser.findMany({ where: { tenantId, userId } });
  return rows.map((r) => r.stationId);
}
