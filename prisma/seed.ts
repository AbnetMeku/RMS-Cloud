import { PrismaClient, Role, Permission, TableStatus, OrderStatus, OrderItemStatus, PaymentMethod } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://rms:rms_password@localhost:5444/rms?schema=public",
});

const prisma = new PrismaClient({ adapter });

async function upsertUser(data: {
  tenantId: string | null;
  username: string;
  name: string;
  email?: string;
  passwordHash?: string;
  pinHash?: string;
  role: Role;
}) {
  if (data.tenantId === null) {
    const existing = await prisma.user.findFirst({
      where: { tenantId: null, username: data.username },
    });
    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          pinHash: data.pinHash,
          role: data.role,
          isActive: true,
        },
      });
    }
    return prisma.user.create({ data });
  }

  return prisma.user.upsert({
    where: { tenantId_username: { tenantId: data.tenantId, username: data.username } },
    update: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      pinHash: data.pinHash,
      role: data.role,
      isActive: true,
    },
    create: data,
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const pinHash = await bcrypt.hash("1234", 10);

  const tenant = await prisma.tenant.upsert({
    where: { id: "demo-tenant" },
    update: {},
    create: {
      id: "demo-tenant",
      name: "Cloud Bistro",
      branchName: "Main Branch",
      address: "Addis Ababa",
      phone: "+251900000000",
      email: "admin@cloudbistro.local",
      currency: "ETB",
      timezone: "Africa/Addis_Ababa",
      taxRate: 0.15,
      serviceChargeRate: 0.1,
    },
  });

  await upsertUser({
    tenantId: null,
    username: "superadmin",
    name: "Platform Owner",
    email: "super@rms.local",
    passwordHash,
    role: Role.SUPER_ADMIN,
  });

  const admin = await upsertUser({
    tenantId: tenant.id,
    username: "admin",
    name: "Aster Admin",
    email: "admin@cloudbistro.local",
    passwordHash,
    role: Role.ADMIN,
  });

  const manager = await upsertUser({
    tenantId: tenant.id,
    username: "manager",
    name: "Dawit Manager",
    email: "manager@cloudbistro.local",
    passwordHash,
    role: Role.MANAGER,
  });

  await prisma.userPermission.createMany({
    data: [
      Permission.MANAGE_TABLES,
      Permission.MANAGE_MENU,
      Permission.MANAGE_STATIONS,
      Permission.MANAGE_ORDERS,
      Permission.VIEW_REPORTS,
    ].map((permission) => ({ tenantId: tenant.id, userId: manager.id, permission })),
    skipDuplicates: true,
  });

  const waiter = await upsertUser({
    tenantId: tenant.id,
    username: "waiter",
    name: "Miki Waiter",
    pinHash,
    role: Role.WAITER,
  });

  const kitchenUser = await upsertUser({
    tenantId: tenant.id,
    username: "kitchen",
    name: "Kitchen Screen",
    pinHash,
    role: Role.KITCHEN,
  });

  const cashier = await upsertUser({
    tenantId: tenant.id,
    username: "cashier",
    name: "Sara Cashier",
    email: "cashier@cloudbistro.local",
    passwordHash,
    role: Role.CASHIER,
  });

  const area = await prisma.diningArea.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Main Floor" } },
    update: {},
    create: { tenantId: tenant.id, name: "Main Floor" },
  });

  const tableOne = await prisma.restaurantTable.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "T-01" } },
    update: { waiterId: waiter.id },
    create: {
      tenantId: tenant.id,
      areaId: area.id,
      name: "T-01",
      capacity: 4,
      status: TableStatus.AVAILABLE,
      waiterId: waiter.id,
    },
  });

  await prisma.restaurantTable.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "T-02" } },
    update: { waiterId: waiter.id },
    create: {
      tenantId: tenant.id,
      areaId: area.id,
      name: "T-02",
      capacity: 2,
      status: TableStatus.AVAILABLE,
      waiterId: waiter.id,
    },
  });

  const kitchen = await prisma.station.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Kitchen" } },
    update: {},
    create: { tenantId: tenant.id, name: "Kitchen" },
  });

  const bar = await prisma.station.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Bar" } },
    update: {},
    create: { tenantId: tenant.id, name: "Bar" },
  });

  await prisma.stationUser.createMany({
    data: [
      { tenantId: tenant.id, stationId: kitchen.id, userId: kitchenUser.id },
      { tenantId: tenant.id, stationId: bar.id, userId: kitchenUser.id },
    ],
    skipDuplicates: true,
  });

  const mains =
    (await prisma.menuCategory.findFirst({ where: { tenantId: tenant.id, name: "Mains", parentId: null } })) ??
    (await prisma.menuCategory.create({ data: { tenantId: tenant.id, name: "Mains" } }));

  const drinks =
    (await prisma.menuCategory.findFirst({ where: { tenantId: tenant.id, name: "Drinks", parentId: null } })) ??
    (await prisma.menuCategory.create({ data: { tenantId: tenant.id, name: "Drinks" } }));

  const burger = await prisma.menuItem.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "House Burger" } },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: mains.id,
      stationId: kitchen.id,
      name: "House Burger",
      description: "Beef patty, cheese, fries",
      price: 420,
    },
  });

  const juice = await prisma.menuItem.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Mango Juice" } },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: drinks.id,
      stationId: bar.id,
      name: "Mango Juice",
      price: 160,
    },
  });

  const existingClosed = await prisma.order.findFirst({
    where: { tenantId: tenant.id, status: OrderStatus.CLOSED },
  });

  if (!existingClosed) {
    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        tableId: tableOne.id,
        waiterId: waiter.id,
        status: OrderStatus.CLOSED,
        subtotal: 580,
        taxTotal: 87,
        serviceChargeTotal: 58,
        grandTotal: 725,
        closedAt: new Date(),
        items: {
          create: [
            {
              tenantId: tenant.id,
              menuItemId: burger.id,
              stationId: kitchen.id,
              quantity: 1,
              unitPrice: 420,
              totalPrice: 420,
              status: OrderItemStatus.READY,
              notes: "No onions",
            },
            {
              tenantId: tenant.id,
              menuItemId: juice.id,
              stationId: bar.id,
              quantity: 1,
              unitPrice: 160,
              totalPrice: 160,
              status: OrderItemStatus.READY,
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        orderId: order.id,
        cashierId: cashier.id,
        amount: 300,
        method: PaymentMethod.CASH,
        reference: "partial-demo",
      },
    });
  }

  const teff = await prisma.inventoryItem.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Teff Flour" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Teff Flour",
      category: "Dry Goods",
      unit: "kg",
      quantity: 25,
      costPerUnit: 95,
      supplier: "Merkato Supplier",
    },
  });

  const purchaseExists = await prisma.inventoryPurchase.findFirst({
    where: { tenantId: tenant.id, inventoryItemId: teff.id },
  });
  if (!purchaseExists) {
    await prisma.inventoryPurchase.create({
      data: {
        tenantId: tenant.id,
        inventoryItemId: teff.id,
        quantity: 25,
        costPerUnit: 95,
        supplier: "Merkato Supplier",
        purchaseDate: new Date(),
      },
    });
  }

  const utilities = await prisma.expenseCategory.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Utilities" } },
    update: {},
    create: { tenantId: tenant.id, name: "Utilities" },
  });

  const expenseExists = await prisma.expense.findFirst({
    where: { tenantId: tenant.id, categoryId: utilities.id },
  });
  if (!expenseExists) {
    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        categoryId: utilities.id,
        amount: 1800,
        description: "Electricity",
        paidById: admin.id,
        expenseDate: new Date(),
      },
    });
  }

  console.log("Seeded demo tenant:");
  console.log("  superadmin / password123");
  console.log("  admin / password123");
  console.log("  manager / password123");
  console.log("  cashier / password123");
  console.log("  waiter PIN: 1234 (tenant: Cloud Bistro)");
  console.log("  kitchen PIN: 1234 (tenant: Cloud Bistro)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
