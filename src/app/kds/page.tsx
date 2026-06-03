import { AppShell } from "@/components/app-shell";
import { KdsBoard } from "@/components/kds-board";
import { requireRouteAccess } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import { listKdsItems } from "@/modules/kds/service";
import { getUserStationIds } from "@/modules/stations/service";
import { prisma } from "@/lib/prisma";

export default async function KdsPage() {
  const session = await requireRouteAccess("/kds");
  const tenantId = requireTenantId(session);
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const stationIds = await getUserStationIds(tenantId, session.userId);

  const itemsByStation = await Promise.all(
    stationIds.map(async (stationId) => {
      const station = await prisma.station.findFirst({ where: { id: stationId, tenantId } });
      const items = await listKdsItems(tenantId, stationId);
      return {
        stationId,
        stationName: station?.name ?? "Station",
        items: items.map((i) => ({
          id: i.id,
          table: i.order.table.name,
          waiter: i.order.waiter.name,
          name: i.menuItem.name,
          qty: i.quantity,
          notes: i.notes,
          createdAt: i.createdAt.toISOString(),
        })),
      };
    }),
  );

  return (
    <AppShell title="Kitchen Display" eyebrow={tenant.name} active="/kds" role={session.role} userName={session.name}>
      <KdsBoard tenantId={tenantId} stations={itemsByStation} />
    </AppShell>
  );
}
