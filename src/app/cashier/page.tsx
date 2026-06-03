import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CashierDashboard } from "@/components/cashier-dashboard";
import { requireRouteAccess } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import { getCashierShiftSummary, listClosedOrdersForPayment } from "@/modules/cashier/service";
import { prisma } from "@/lib/prisma";

export default async function CashierPage() {
  const session = await requireRouteAccess("/cashier");
  const tenantId = requireTenantId(session);
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  const orders = await listClosedOrdersForPayment(tenantId);
  const shift = await getCashierShiftSummary(tenantId, session.userId);

  return (
    <AppShell title="Cashier Desk" eyebrow={tenant.name} active="/cashier" role={session.role} userName={session.name}>
      <CashierDashboard
        tenantId={tenantId}
        currency={tenant.currency}
        shift={shift}
        orders={orders.map((o) => {
          const paid = o.payments.reduce((s, p) => s + Number(p.amount), 0);
          return {
            id: o.id,
            table: o.table.name,
            waiter: o.waiter.name,
            grandTotal: Number(o.grandTotal),
            paid,
            due: Number(o.grandTotal) - paid,
            items: o.items.map((i) => ({ name: i.menuItem.name, qty: i.quantity, price: Number(i.totalPrice) })),
          };
        })}
      />
    </AppShell>
  );
}
