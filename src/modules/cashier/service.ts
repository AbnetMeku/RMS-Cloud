import { PaymentMethod } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { applyOrderDiscount } from "@/modules/orders/service";

export async function listClosedOrdersForPayment(tenantId: string) {
  return prisma.order.findMany({
    where: { tenantId, status: "CLOSED" },
    include: { table: true, waiter: true, payments: true, items: { include: { menuItem: true } } },
    orderBy: { closedAt: "asc" },
  });
}

export async function recordPayment(input: {
  tenantId: string;
  orderId: string;
  cashierId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirstOrThrow({
      where: { id: input.orderId, tenantId: input.tenantId, status: "CLOSED" },
      include: { payments: true },
    });

    await tx.payment.create({
      data: {
        tenantId: input.tenantId,
        orderId: input.orderId,
        cashierId: input.cashierId,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
      },
    });

    const updated = await tx.order.findFirstOrThrow({
      where: { id: order.id },
      include: { payments: true },
    });

    const paidTotal = updated.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (paidTotal >= Number(updated.grandTotal)) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await tx.restaurantTable.updateMany({
        where: { id: order.tableId, tenantId: input.tenantId },
        data: { status: "AVAILABLE" },
      });
    }

    return updated;
  });
}

export async function applyDiscount(tenantId: string, orderId: string, amount: number) {
  return applyOrderDiscount(tenantId, orderId, amount);
}

export async function getOrderForReceipt(tenantId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, tenantId },
    include: {
      table: true,
      waiter: true,
      tenant: true,
      items: { include: { menuItem: true } },
      payments: { include: { cashier: true } },
    },
  });
}

export async function getCashierShiftSummary(tenantId: string, cashierId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const payments = await prisma.payment.findMany({
    where: { tenantId, cashierId, paidAt: { gte: start } },
    include: { order: { include: { waiter: true } } },
  });

  const byWaiter = new Map<string, { name: string; total: number; count: number }>();
  for (const p of payments) {
    const waiter = p.order.waiter;
    const key = waiter.id;
    const current = byWaiter.get(key) ?? { name: waiter.name, total: 0, count: 0 };
    current.total += Number(p.amount);
    current.count += 1;
    byWaiter.set(key, current);
  }

  return {
    totalCollected: payments.reduce((s, p) => s + Number(p.amount), 0),
    paymentCount: payments.length,
    byWaiter: Array.from(byWaiter.values()),
  };
}

export async function getOrderPaymentStatus(tenantId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId },
    include: { payments: true },
  });
  if (!order) throw new AppError("Order not found", "NOT_FOUND");
  const paid = order.payments.reduce((s, p) => s + Number(p.amount), 0);
  return { order, paid, due: Number(order.grandTotal) - paid };
}
