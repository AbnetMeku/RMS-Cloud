import { guardAdminSection } from "@/lib/admin-page";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSalesSummary } from "@/modules/reports/service";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { tenantId, tenant } = await guardAdminSection("VIEW_REPORTS");
  const params = await searchParams;

  const from = params.from ? new Date(params.from) : new Date(new Date().setDate(1));
  from.setHours(0, 0, 0, 0);
  const to = params.to ? new Date(params.to) : new Date();
  to.setHours(23, 59, 59, 999);

  const report = await getSalesSummary(tenantId, from, to);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Reports</h2>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div>
              <Label>From</Label>
              <Input name="from" type="date" defaultValue={fromStr} />
            </div>
            <div>
              <Label>To</Label>
              <Input name="to" type="date" defaultValue={toStr} />
            </div>
            <Button type="submit">Apply filter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Sales</p><p className="text-xl font-bold">{money(report.sales, tenant.currency)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Expenses</p><p className="text-xl font-bold">{money(report.expenseTotal, tenant.currency)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Inventory purchases</p><p className="text-xl font-bold">{money(report.inventoryTotal, tenant.currency)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Net profit</p><p className="text-xl font-bold">{money(report.netProfit, tenant.currency)}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportSection title="Sales by waiter" rows={report.byWaiter.map((w) => ({ label: w.name, value: money(w.total, tenant.currency), sub: `${w.count} orders` }))} />
        <ReportSection title="Sales by payment method" rows={report.byPaymentMethod.map((p) => ({ label: p.method, value: money(p.total, tenant.currency) }))} />
        <ReportSection title="Sales by category" rows={report.byCategory.map((c) => ({ label: c.category, value: money(c.total, tenant.currency) }))} />
        <ReportSection title="Top menu items" rows={report.byMenuItem.slice(0, 10).map((i) => ({ label: i.item, value: money(i.total, tenant.currency) }))} />
      </div>
    </div>
  );
}

function ReportSection({ title, rows }: { title: string; rows: Array<{ label: string; value: string; sub?: string }> }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && <p className="text-sm text-slate-500">No data for this period.</p>}
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span>{row.label}{row.sub && <span className="text-slate-400"> · {row.sub}</span>}</span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
