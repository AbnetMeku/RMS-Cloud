"use server";

import { revalidatePath } from "next/cache";
import { TenantStatus } from "@prisma/client";
import { requireAuth } from "@/lib/route-guard";
import { createTenant, deleteTenant, setTenantStatus, updateTenant } from "@/modules/tenants/service";

export async function createTenantAction(formData: FormData) {
  await requireAuth(["SUPER_ADMIN"]);
  await createTenant({
    name: String(formData.get("name")),
    branchName: String(formData.get("branchName") || "") || undefined,
    address: String(formData.get("address") || "") || undefined,
    phone: String(formData.get("phone") || "") || undefined,
    email: String(formData.get("email") || "") || undefined,
    currency: String(formData.get("currency") || "ETB"),
    timezone: String(formData.get("timezone") || "Africa/Addis_Ababa"),
    taxRate: Number(formData.get("taxRate") || 0),
    serviceChargeRate: Number(formData.get("serviceChargeRate") || 0),
  });
  revalidatePath("/super-admin");
}

export async function updateTenantStatusAction(formData: FormData) {
  await requireAuth(["SUPER_ADMIN"]);
  const tenantId = String(formData.get("tenantId"));
  const status = formData.get("status") as TenantStatus;
  if (status === TenantStatus.DELETED) {
    await deleteTenant(tenantId);
  } else {
    await setTenantStatus(tenantId, status);
  }
  revalidatePath("/super-admin");
}

export async function updateTenantAction(tenantId: string, formData: FormData) {
  await requireAuth(["SUPER_ADMIN"]);
  await updateTenant(tenantId, {
    name: String(formData.get("name")),
    branchName: String(formData.get("branchName") || "") || undefined,
    address: String(formData.get("address") || "") || undefined,
    phone: String(formData.get("phone") || "") || undefined,
    email: String(formData.get("email") || "") || undefined,
    currency: String(formData.get("currency") || "ETB"),
    taxRate: Number(formData.get("taxRate") || 0),
    serviceChargeRate: Number(formData.get("serviceChargeRate") || 0),
  });
  revalidatePath("/super-admin");
}
