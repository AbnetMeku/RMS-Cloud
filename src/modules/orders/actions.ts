"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import {
  addOrderItem,
  closeOrder,
  getOpenOrderForTable,
  openOrder,
} from "@/modules/orders/service";
import { publishOrderEvent } from "@/lib/socket-publisher";

export async function openOrderAction(tableId: string) {
  const session = await requireAuth(["WAITER"]);
  const tenantId = requireTenantId(session);
  const order = await openOrder(tenantId, tableId, session.userId);
  await publishOrderEvent(tenantId, "order:opened", { orderId: order.id, tableId });
  revalidatePath("/waiter");
  return order.id;
}

export async function addItemAction(formData: FormData) {
  const session = await requireAuth(["WAITER"]);
  const tenantId = requireTenantId(session);
  const orderId = String(formData.get("orderId"));
  const item = await addOrderItem({
    tenantId,
    orderId,
    menuItemId: String(formData.get("menuItemId")),
    quantity: Number(formData.get("quantity") || 1),
    notes: String(formData.get("notes") || "") || undefined,
  });
  await publishOrderEvent(tenantId, "order:item_sent", { orderId, itemId: item.id, stationId: item.stationId });
  revalidatePath("/waiter");
}

export async function closeOrderAction(orderId: string) {
  const session = await requireAuth(["WAITER"]);
  const tenantId = requireTenantId(session);
  await closeOrder(tenantId, orderId);
  await publishOrderEvent(tenantId, "order:closed", { orderId });
  revalidatePath("/waiter");
}

export async function loadTableOrderAction(tableId: string) {
  const session = await requireAuth(["WAITER"]);
  const tenantId = requireTenantId(session);
  return getOpenOrderForTable(tenantId, tableId);
}
