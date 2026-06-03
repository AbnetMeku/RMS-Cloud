import { AppShell } from "@/components/app-shell";
import { AdminShell } from "@/components/admin-shell";
import { getAdminNav } from "@/lib/admin-nav";
import { requireRouteAccess } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRouteAccess("/admin");
  const tenantId = requireTenantId(session);
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const nav = getAdminNav(session);

  return (
    <AppShell
      title="Restaurant Admin"
      eyebrow={`${tenant.name}${tenant.branchName ? ` / ${tenant.branchName}` : ""}`}
      active="/admin"
      role={session.role}
      userName={session.name}
    >
      <AdminShell nav={nav}>{children}</AdminShell>
    </AppShell>
  );
}
