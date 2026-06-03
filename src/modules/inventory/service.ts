import { prisma } from "@/lib/prisma";

export async function listInventoryItems(tenantId: string) {
  return prisma.inventoryItem.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
}

export async function createInventoryItem(input: {
  tenantId: string;
  name: string;
  category?: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
  supplier?: string;
  notes?: string;
}) {
  return prisma.inventoryItem.create({ data: input });
}

export async function recordPurchase(input: {
  tenantId: string;
  inventoryItemId: string;
  quantity: number;
  costPerUnit: number;
  supplier?: string;
  purchaseDate: Date;
  notes?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.inventoryPurchase.create({ data: input });
    await tx.inventoryItem.update({
      where: { id: input.inventoryItemId },
      data: { quantity: { increment: input.quantity } },
    });
    return purchase;
  });
}

export async function adjustStock(input: {
  tenantId: string;
  inventoryItemId: string;
  quantityDelta: number;
  reason: string;
}) {
  return prisma.$transaction(async (tx) => {
    const adjustment = await tx.inventoryAdjustment.create({ data: input });
    await tx.inventoryItem.update({
      where: { id: input.inventoryItemId },
      data: { quantity: { increment: input.quantityDelta } },
    });
    return adjustment;
  });
}
