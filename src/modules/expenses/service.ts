import { prisma } from "@/lib/prisma";

export async function listExpenseCategories(tenantId: string) {
  return prisma.expenseCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
}

export async function createExpenseCategory(tenantId: string, name: string) {
  return prisma.expenseCategory.create({ data: { tenantId, name } });
}

export async function createExpense(input: {
  tenantId: string;
  categoryId: string;
  amount: number;
  description?: string;
  paidById?: string;
  expenseDate: Date;
  receiptUrl?: string;
}) {
  return prisma.expense.create({ data: input });
}

export async function listExpenses(tenantId: string) {
  return prisma.expense.findMany({
    where: { tenantId },
    include: { category: true, paidBy: true },
    orderBy: { expenseDate: "desc" },
    take: 50,
  });
}
