"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/route-guard";
import { createStation as createStationService } from "@/modules/stations/service";

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

export async function createStationFormAction(formData: FormData) {
  const session = await requireAuth(["ADMIN", "MANAGER"]);
  if (!session.tenantId) throw new Error("Tenant required");
  await createStationService(session.tenantId, String(formData.get("name")));
  revalidateAdmin();
}

export async function assignKitchenFormAction(formData: FormData) {
  const session = await requireAuth(["ADMIN", "MANAGER"]);
  if (!session.tenantId) throw new Error("Tenant required");
  const { assignUserToStation } = await import("@/modules/stations/service");
  await assignUserToStation(
    session.tenantId,
    String(formData.get("stationId")),
    String(formData.get("userId")),
  );
  revalidateAdmin();
}
