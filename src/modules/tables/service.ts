import { TableStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listDiningAreas(tenantId: string) {
  return prisma.diningArea.findMany({
    where: { tenantId },
    include: { tables: { include: { waiter: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createDiningArea(tenantId: string, name: string) {
  return prisma.diningArea.create({ data: { tenantId, name } });
}

export async function createTable(input: {
  tenantId: string;
  areaId?: string;
  name: string;
  capacity: number;
  waiterId?: string;
}) {
  return prisma.restaurantTable.create({
    data: {
      tenantId: input.tenantId,
      areaId: input.areaId,
      name: input.name,
      capacity: input.capacity,
      waiterId: input.waiterId,
      status: TableStatus.AVAILABLE,
    },
  });
}

export async function updateTableStatus(tenantId: string, tableId: string, status: TableStatus) {
  return prisma.restaurantTable.updateMany({ where: { id: tableId, tenantId }, data: { status } });
}

export async function listTables(tenantId: string) {
  return prisma.restaurantTable.findMany({
    where: { tenantId },
    include: { area: true, waiter: true, orders: { where: { status: { in: ["OPEN", "CLOSED"] } } } },
    orderBy: { name: "asc" },
  });
}

export async function listWaiterTables(tenantId: string, waiterId: string) {
  return prisma.restaurantTable.findMany({
    where: { tenantId, waiterId },
    include: {
      area: true,
      orders: {
        where: { status: { in: ["OPEN", "CLOSED"] } },
        include: { items: { include: { menuItem: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}
