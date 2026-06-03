"use server";

import { revalidatePath } from "next/cache";
import { Permission, Role } from "@prisma/client";
import { requireAuth } from "@/lib/route-guard";
import { requirePermission, requireTenantId } from "@/lib/tenant";
import { createExpense, createExpenseCategory } from "@/modules/expenses/service";
import { adjustStock, createInventoryItem, recordPurchase } from "@/modules/inventory/service";
import { createMenuCategory, createMenuItem } from "@/modules/menu/service";
import { setUserPermissions } from "@/modules/permissions/service";
import { createDiningArea, createTable, updateTableStatus } from "@/modules/tables/service";
import { assignUserToStation, createStation } from "@/modules/stations/service";
import {
  assignWaiterToTable,
  createUser,
  resetUserPassword,
  resetUserPin,
  updateUserStatus,
} from "@/modules/users/service";

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

async function adminSession(permission?: Permission) {
  const session = await requireAuth(["ADMIN", "MANAGER"]);
  const tenantId = requireTenantId(session);
  if (permission && session.role === "MANAGER") {
    requirePermission(session, permission);
  }
  return { session, tenantId };
}

export async function createUserAction(formData: FormData) {
  const { session, tenantId } = await adminSession(Permission.MANAGE_USERS);

  await createUser({
    tenantId,
    name: String(formData.get("name")),
    username: String(formData.get("username")),
    email: String(formData.get("email") || "") || undefined,
    role: formData.get("role") as Role,
    password: String(formData.get("password") || "") || undefined,
    pin: String(formData.get("pin") || "") || undefined,
  });
  revalidateAdmin();
}

export async function toggleUserFormAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_USERS);
  await updateUserStatus(tenantId, String(formData.get("userId")), formData.get("isActive") === "true");
  revalidateAdmin();
}

export async function setPermissionsFormAction(formData: FormData) {
  const { tenantId, session } = await adminSession();
  if (session.role !== "ADMIN") return;

  const userId = String(formData.get("userId"));
  const permissions = (formData.getAll("permissions") as Permission[]).filter(Boolean);
  await setUserPermissions(tenantId, userId, permissions);
  revalidateAdmin();
}

export async function createAreaFormAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_TABLES);
  await createDiningArea(tenantId, String(formData.get("name")));
  revalidateAdmin();
}

export async function createTableAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_TABLES);
  await createTable({
    tenantId,
    areaId: String(formData.get("areaId") || "") || undefined,
    name: String(formData.get("name")),
    capacity: Number(formData.get("capacity") || 2),
    waiterId: String(formData.get("waiterId") || "") || undefined,
  });
  revalidateAdmin();
}

export async function assignWaiterFormAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_TABLES);
  const tableId = String(formData.get("tableId"));
  const waiterId = String(formData.get("waiterId") || "");
  await assignWaiterToTable(tenantId, tableId, waiterId || null);
  revalidateAdmin();
}

export async function createCategoryFormAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_MENU);
  await createMenuCategory(
    tenantId,
    String(formData.get("name")),
    String(formData.get("parentId") || "") || undefined,
  );
  revalidateAdmin();
}

export async function createMenuItemAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_MENU);
  await createMenuItem({
    tenantId,
    categoryId: String(formData.get("categoryId")),
    stationId: String(formData.get("stationId")),
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || undefined,
    price: Number(formData.get("price")),
    taxEnabled: formData.get("taxEnabled") === "on",
  });
  revalidateAdmin();
}

export async function createInventoryAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_INVENTORY);
  await createInventoryItem({
    tenantId,
    name: String(formData.get("name")),
    category: String(formData.get("category") || "") || undefined,
    unit: String(formData.get("unit")),
    quantity: Number(formData.get("quantity") || 0),
    costPerUnit: Number(formData.get("costPerUnit") || 0),
    supplier: String(formData.get("supplier") || "") || undefined,
  });
  revalidateAdmin();
}

export async function recordPurchaseAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_INVENTORY);
  await recordPurchase({
    tenantId,
    inventoryItemId: String(formData.get("inventoryItemId")),
    quantity: Number(formData.get("quantity")),
    costPerUnit: Number(formData.get("costPerUnit")),
    supplier: String(formData.get("supplier") || "") || undefined,
    purchaseDate: new Date(String(formData.get("purchaseDate") || new Date().toISOString())),
  });
  revalidateAdmin();
}

export async function adjustStockAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_INVENTORY);
  await adjustStock({
    tenantId,
    inventoryItemId: String(formData.get("inventoryItemId")),
    quantityDelta: Number(formData.get("quantityDelta")),
    reason: String(formData.get("reason")),
  });
  revalidateAdmin();
}

export async function createExpenseCategoryFormAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_EXPENSES);
  await createExpenseCategory(tenantId, String(formData.get("name")));
  revalidateAdmin();
}

export async function createExpenseAction(formData: FormData) {
  const { session, tenantId } = await adminSession(Permission.MANAGE_EXPENSES);
  await createExpense({
    tenantId,
    categoryId: String(formData.get("categoryId")),
    amount: Number(formData.get("amount")),
    description: String(formData.get("description") || "") || undefined,
    paidById: session.userId,
    expenseDate: new Date(String(formData.get("expenseDate") || new Date().toISOString())),
  });
  revalidateAdmin();
}

export async function updateTableStatusFormAction(formData: FormData) {
  const { tenantId } = await adminSession(Permission.MANAGE_TABLES);
  await updateTableStatus(
    tenantId,
    String(formData.get("tableId")),
    formData.get("status") as "AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE",
  );
  revalidateAdmin();
}

// Legacy exports kept for compatibility
export { resetUserPassword, resetUserPin };
