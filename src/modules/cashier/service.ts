import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
    const payment = await tx.payment.create({
      data: {
        tenantId: input.tenantId,
        orderId: input.orderId,
        cashierId: input.cashierId,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
      },
    });

    const order = await tx.order.findFirstOrThrow({
      where: { id: input.orderId, tenantId: input.tenantId },
      include: { payments: true },
    });

    const paidTotal = order.payments.reduce((sum, current) => sum + Number(current.amount), Number(payment.amount));
    if (paidTotal >= Number(order.grandTotal)) {
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date() } });
    }

    return payment;
  });
}
