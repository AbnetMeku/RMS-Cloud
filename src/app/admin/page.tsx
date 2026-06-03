import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminContext } from "@/lib/admin-page";
import { money } from "@/lib/utils";
import { getSalesSummary } from "@/modules/reports/service";
import { listTables } from "@/modules/tables/service";
import { listTenantUsers } from "@/modules/users/service";

export default async function AdminDashboardPage() {
  const { tenantId, tenant } = await getAdminContext();

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  const [report, tables, users] = await Promise.all([
    getSalesSummary(tenantId, from, to),
    listTables(tenantId),
    listTenantUsers(tenantId),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Overview</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Sales today</p><p className="text-2xl font-bold">{money(report.sales, tenant.currency)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Net profit</p><p className="text-2xl font-bold">{money(report.netProfit, tenant.currency)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Paid orders</p><p className="text-2xl font-bold">{report.orderCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Staff</p><p className="text-2xl font-bold">{users.length}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Quick links</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/admin/users"><Button size="sm" variant="outline">Manage users</Button></Link>
              <Link href="/admin/tables"><Button size="sm" variant="outline">Manage tables</Button></Link>
              <Link href="/admin/menu"><Button size="sm" variant="outline">Manage menu</Button></Link>
              <Link href="/admin/reports"><Button size="sm" variant="outline">View reports</Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Table status</p>
            <p className="mt-2 text-sm text-slate-600">
              {tables.filter((t) => t.status === "AVAILABLE").length} available ·{" "}
              {tables.filter((t) => t.status === "OCCUPIED").length} occupied ·{" "}
              {tables.length} total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
