"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import { markOrderItemReady } from "@/modules/kds/service";
import { publishOrderEvent } from "@/lib/socket-publisher";

export async function markReadyAction(orderItemId: string, stationId: string) {
  const session = await requireAuth(["KITCHEN"]);
  const tenantId = requireTenantId(session);
  await markOrderItemReady(tenantId, orderItemId);
  await publishOrderEvent(tenantId, "order:item_ready", { orderItemId, stationId });
  revalidatePath("/kds");
}
