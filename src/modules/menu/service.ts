import { prisma } from "@/lib/prisma";

export async function listMenuCategories(tenantId: string) {
  return prisma.menuCategory.findMany({
    where: { tenantId, parentId: null },
    include: { children: true, items: { include: { station: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createMenuCategory(tenantId: string, name: string, parentId?: string) {
  return prisma.menuCategory.create({ data: { tenantId, name, parentId } });
}

export async function createMenuItem(input: {
  tenantId: string;
  categoryId: string;
  stationId: string;
  name: string;
  description?: string;
  price: number;
  taxEnabled?: boolean;
}) {
  return prisma.menuItem.create({
    data: {
      tenantId: input.tenantId,
      categoryId: input.categoryId,
      stationId: input.stationId,
      name: input.name,
      description: input.description,
      price: input.price,
      taxEnabled: input.taxEnabled ?? true,
    },
  });
}

export async function listAvailableMenuItems(tenantId: string) {
  return prisma.menuItem.findMany({
    where: { tenantId, isAvailable: true },
    include: { category: true, station: true },
    orderBy: { name: "asc" },
  });
}

export async function updateMenuItemAvailability(tenantId: string, itemId: string, isAvailable: boolean) {
  return prisma.menuItem.updateMany({ where: { id: itemId, tenantId }, data: { isAvailable } });
}
