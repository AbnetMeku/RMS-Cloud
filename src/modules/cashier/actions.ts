"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import { requireAuth } from "@/lib/route-guard";
import { requirePermission, requireTenantId } from "@/lib/tenant";
import { Permission } from "@prisma/client";
import { applyDiscount, recordPayment } from "@/modules/cashier/service";
import { publishOrderEvent } from "@/lib/socket-publisher";

export async function recordPaymentAction(formData: FormData) {
  const session = await requireAuth(["CASHIER"]);
  const tenantId = requireTenantId(session);
  const orderId = String(formData.get("orderId"));
  await recordPayment({
    tenantId,
    orderId,
    cashierId: session.userId,
    amount: Number(formData.get("amount")),
    method: formData.get("method") as PaymentMethod,
    reference: String(formData.get("reference") || "") || undefined,
  });
  await publishOrderEvent(tenantId, "order:paid", { orderId });
  revalidatePath("/cashier");
}

export async function applyDiscountAction(orderId: string, amount: number) {
  const session = await requireAuth(["CASHIER", "ADMIN", "MANAGER"]);
  const tenantId = requireTenantId(session);
  if (session.role !== "ADMIN") {
    requirePermission(session, Permission.MANAGE_PAYMENTS);
  }
  await applyDiscount(tenantId, orderId, amount);
  revalidatePath("/cashier");
}
