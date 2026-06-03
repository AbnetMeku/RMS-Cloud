import { TenantStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TenantInput = {
  name: string;
  branchName?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  currency?: string;
  timezone?: string;
  taxRate?: number;
  serviceChargeRate?: number;
  subscriptionStatus?: TenantStatus;
};

export async function listTenants() {
  return prisma.tenant.findMany({
    where: { subscriptionStatus: { not: TenantStatus.DELETED } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTenant(tenantId: string) {
  return prisma.tenant.findFirst({
    where: { id: tenantId, subscriptionStatus: { not: TenantStatus.DELETED } },
  });
}

export async function createTenant(input: TenantInput) {
  return prisma.tenant.create({
    data: {
      name: input.name,
      branchName: input.branchName,
      address: input.address,
      phone: input.phone,
      email: input.email,
      logoUrl: input.logoUrl,
      currency: input.currency ?? "ETB",
      timezone: input.timezone ?? "Africa/Addis_Ababa",
      taxRate: input.taxRate ?? 0,
      serviceChargeRate: input.serviceChargeRate ?? 0,
      subscriptionStatus: input.subscriptionStatus ?? TenantStatus.ACTIVE,
    },
  });
}

export async function updateTenant(tenantId: string, input: Partial<TenantInput>) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: input,
  });
}

export async function setTenantStatus(tenantId: string, subscriptionStatus: TenantStatus) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { subscriptionStatus },
  });
}

export async function deleteTenant(tenantId: string) {
  return setTenantStatus(tenantId, TenantStatus.DELETED);
}
