import { prisma } from "@/lib/prisma";

export async function getSalesSummary(tenantId: string, from: Date, to: Date) {
  const [paidOrders, expenses, inventoryPurchases] = await Promise.all([
    prisma.order.aggregate({
      where: { tenantId, status: "PAID", paidAt: { gte: from, lte: to } },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { tenantId, expenseDate: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
    prisma.inventoryPurchase.findMany({
      where: { tenantId, purchaseDate: { gte: from, lte: to } },
      select: { quantity: true, costPerUnit: true },
    }),
  ]);

  const salesTotal = Number(paidOrders._sum.grandTotal ?? 0);
  const expensesTotal = Number(expenses._sum.amount ?? 0);
  const inventoryTotal = inventoryPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.quantity) * Number(purchase.costPerUnit),
    0,
  );

  return {
    orderCount: paidOrders._count,
    salesTotal,
    expensesTotal,
    inventoryTotal,
    netProfit: salesTotal - expensesTotal - inventoryTotal,
  };
}
