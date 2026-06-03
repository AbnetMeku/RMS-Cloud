import { AppShell } from "@/components/app-shell";
import { WaiterDashboard } from "@/components/waiter-dashboard";
import { requireRouteAccess } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import { listAvailableMenuItems } from "@/modules/menu/service";
import { getWaiterDailySummary } from "@/modules/orders/service";
import { listWaiterTables } from "@/modules/tables/service";
import { prisma } from "@/lib/prisma";

export default async function WaiterPage() {
  const session = await requireRouteAccess("/waiter");
  const tenantId = requireTenantId(session);
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const tables = await listWaiterTables(tenantId, session.userId);
  const menuItems = await listAvailableMenuItems(tenantId);
  const summary = await getWaiterDailySummary(tenantId, session.userId);

  return (
    <AppShell title="Waiter Floor" eyebrow={tenant.name} active="/waiter" role={session.role} userName={session.name}>
      <WaiterDashboard
        tenantId={tenantId}
        currency={tenant.currency}
        tables={tables.map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          order: t.orders[0]
            ? {
                id: t.orders[0].id,
                status: t.orders[0].status,
                grandTotal: Number(t.orders[0].grandTotal),
                items: t.orders[0].items.map((i) => ({
                  id: i.id,
                  name: i.menuItem.name,
                  qty: i.quantity,
                  status: i.status,
                  price: Number(i.totalPrice),
                })),
              }
            : null,
        }))}
        menuItems={menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          price: Number(m.price),
          station: m.station.name,
        }))}
        summary={summary}
      />
    </AppShell>
  );
}
