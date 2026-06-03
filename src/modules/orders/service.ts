import { OrderStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

async function recalcOrderTotals(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirstOrThrow({
    where: { id: orderId, tenantId },
    include: { items: { include: { menuItem: true } }, tenant: true },
  });

  const activeItems = order.items.filter((i) => i.status !== "CANCELLED");
  const subtotal = activeItems.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const taxable = activeItems
    .filter((i) => i.menuItem.taxEnabled)
    .reduce((sum, i) => sum + Number(i.totalPrice), 0);

  const taxRate = Number(order.tenant.taxRate);
  const serviceRate = Number(order.tenant.serviceChargeRate);
  const taxTotal = taxable * taxRate;
  const serviceChargeTotal = subtotal * serviceRate;
  const discountTotal = Number(order.discountTotal);
  const grandTotal = Math.max(0, subtotal + taxTotal + serviceChargeTotal - discountTotal);

  return prisma.order.update({
    where: { id: orderId },
    data: { subtotal, taxTotal, serviceChargeTotal, grandTotal },
  });
}

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

export async function openOrder(tenantId: string, tableId: string, waiterId: string) {
  const existing = await prisma.order.findFirst({
    where: { tenantId, tableId, status: { in: ["OPEN", "CLOSED"] } },
  });
  if (existing) throw new AppError("Table already has an active order", "ORDER_EXISTS");

  const order = await prisma.order.create({
    data: { tenantId, tableId, waiterId, status: OrderStatus.OPEN },
  });

  await prisma.restaurantTable.updateMany({
    where: { id: tableId, tenantId },
    data: { status: "OCCUPIED" },
  });

  return order;
}

export async function addOrderItem(input: {
  tenantId: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
}) {
  const order = await prisma.order.findFirst({ where: { id: input.orderId, tenantId: input.tenantId } });
  if (!order) throw new AppError("Order not found", "NOT_FOUND");
  if (order.status !== "OPEN") throw new AppError("Cannot add items to a closed order", "ORDER_CLOSED");

  const menuItem = await prisma.menuItem.findFirst({
    where: { id: input.menuItemId, tenantId: input.tenantId, isAvailable: true },
  });
  if (!menuItem) throw new AppError("Menu item not available", "NOT_FOUND");

  const unitPrice = Number(menuItem.price);
  const totalPrice = unitPrice * input.quantity;

  const item = await prisma.orderItem.create({
    data: {
      tenantId: input.tenantId,
      orderId: input.orderId,
      menuItemId: menuItem.id,
      stationId: menuItem.stationId,
      quantity: input.quantity,
      unitPrice,
      totalPrice,
      notes: input.notes,
      status: "PENDING",
    },
  });

  await recalcOrderTotals(input.tenantId, input.orderId);
  return item;
}

export async function closeOrder(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
  if (!order) throw new AppError("Order not found", "NOT_FOUND");
  if (order.status !== "OPEN") throw new AppError("Order is not open", "INVALID_STATUS");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CLOSED, closedAt: new Date() },
  });
}

export async function reopenOrder(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
  if (!order) throw new AppError("Order not found", "NOT_FOUND");
  if (order.status !== "CLOSED") throw new AppError("Only closed orders can be reopened", "INVALID_STATUS");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.OPEN, closedAt: null },
  });
}

export async function getWaiterDailySummary(tenantId: string, waiterId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { tenantId, waiterId, createdAt: { gte: start } },
  });

  const open = orders.filter((o) => o.status === "OPEN").length;
  const closed = orders.filter((o) => o.status === "CLOSED").length;
  const paid = orders.filter((o) => o.status === "PAID").length;
  const totalSales = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + Number(o.grandTotal), 0);

  return {
    totalOrders: orders.length,
    openOrders: open,
    closedOrders: closed,
    paidOrders: paid,
    totalSales,
  };
}

export async function getOpenOrderForTable(tenantId: string, tableId: string) {
  return prisma.order.findFirst({
    where: { tenantId, tableId, status: { in: ["OPEN", "CLOSED"] } },
    include: { items: { include: { menuItem: true, station: true } }, table: true },
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

export async function applyOrderDiscount(tenantId: string, orderId: string, discountTotal: number) {
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
  if (!order) throw new AppError("Order not found", "NOT_FOUND");
  if (order.status !== "CLOSED") throw new AppError("Discount only on closed orders", "INVALID_STATUS");

  await prisma.order.update({
    where: { id: orderId },
    data: { discountTotal },
  });
  return recalcOrderTotals(tenantId, orderId);
}

export { recalcOrderTotals };
