import { prisma } from "@/lib/prisma";

export async function listTenantOrders(tenantId: string) {
  return prisma.order.findMany({
    where: { tenantId },
    include: {
      table: true,
      waiter: true,
      items: { include: { menuItem: true, station: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listKdsItems(tenantId: string, stationId: string) {
  return prisma.orderItem.findMany({
    where: { tenantId, stationId, status: "PENDING" },
    include: {
      order: { include: { table: true, waiter: true } },
      menuItem: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function markOrderItemReady(tenantId: string, orderItemId: string) {
  return prisma.orderItem.updateMany({
    where: { id: orderItemId, tenantId },
    data: { status: "READY", readyAt: new Date() },
  });
}
