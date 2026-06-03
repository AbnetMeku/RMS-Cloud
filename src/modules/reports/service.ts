import { prisma } from "@/lib/prisma";

export async function getSalesSummary(tenantId: string, from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      status: "PAID",
      paidAt: { gte: from, lte: to },
    },
    include: {
      waiter: true,
      payments: { include: { cashier: true } },
      items: { include: { menuItem: { include: { category: true } } } },
    },
  });

  const sales = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  const expenses = await prisma.expense.aggregate({
    where: { tenantId, expenseDate: { gte: from, lte: to } },
    _sum: { amount: true },
  });

  const inventoryPurchases = await prisma.inventoryPurchase.aggregate({
    where: { tenantId, purchaseDate: { gte: from, lte: to } },
    _sum: { quantity: true },
  });

  const purchaseCost = await prisma.inventoryPurchase.findMany({
    where: { tenantId, purchaseDate: { gte: from, lte: to } },
  });
  const inventoryTotal = purchaseCost.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.costPerUnit),
    0,
  );

  const expenseTotal = Number(expenses._sum.amount ?? 0);

  const byWaiter = new Map<string, { name: string; total: number; count: number }>();
  const byCashier = new Map<string, { name: string; total: number; count: number }>();
  const byPaymentMethod = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byMenuItem = new Map<string, number>();

  for (const order of orders) {
    const w = byWaiter.get(order.waiterId) ?? { name: order.waiter.name, total: 0, count: 0 };
    w.total += Number(order.grandTotal);
    w.count += 1;
    byWaiter.set(order.waiterId, w);

    for (const payment of order.payments) {
      const c = byCashier.get(payment.cashierId) ?? { name: payment.cashier.name, total: 0, count: 0 };
      c.total += Number(payment.amount);
      c.count += 1;
      byCashier.set(payment.cashierId, c);
      byPaymentMethod.set(payment.method, (byPaymentMethod.get(payment.method) ?? 0) + Number(payment.amount));
    }

    for (const item of order.items) {
      if (item.status === "CANCELLED") continue;
      const cat = item.menuItem.category.name;
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(item.totalPrice));
      byMenuItem.set(item.menuItem.name, (byMenuItem.get(item.menuItem.name) ?? 0) + Number(item.totalPrice));
    }
  }

  return {
    sales,
    expenseTotal,
    inventoryTotal,
    netProfit: sales - expenseTotal - inventoryTotal,
    orderCount: orders.length,
    byWaiter: Array.from(byWaiter.values()),
    byCashier: Array.from(byCashier.values()),
    byPaymentMethod: Array.from(byPaymentMethod.entries()).map(([method, total]) => ({ method, total })),
    byCategory: Array.from(byCategory.entries()).map(([category, total]) => ({ category, total })),
    byMenuItem: Array.from(byMenuItem.entries()).map(([item, total]) => ({ item, total })),
  };
}

export async function getDailySales(tenantId: string, date: Date) {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  return getSalesSummary(tenantId, from, to);
}

export async function getExpenseReport(tenantId: string, from: Date, to: Date) {
  return prisma.expense.findMany({
    where: { tenantId, expenseDate: { gte: from, lte: to } },
    include: { category: true, paidBy: true },
    orderBy: { expenseDate: "desc" },
  });
}

export async function getInventoryPurchaseReport(tenantId: string, from: Date, to: Date) {
  return prisma.inventoryPurchase.findMany({
    where: { tenantId, purchaseDate: { gte: from, lte: to } },
    include: { inventoryItem: true },
    orderBy: { purchaseDate: "desc" },
  });
}
