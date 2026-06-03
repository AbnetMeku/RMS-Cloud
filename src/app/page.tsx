import Link from "next/link";
import { Activity, ChefHat, Clock3, CreditCard, Table2, Wifi } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { cashierOrders, kdsItems, openOrder, reports, tables } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function Home() {
  return (
    <AppShell title="Restaurant Command Center" eyebrow="Cloud Bistro / Main Branch" active="/">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sales today" value={money(reports.sales)} detail="Across all cashiers" icon={<CreditCard size={20} />} />
        <MetricCard label="Open tables" value="3" detail="2 active, 1 reserved" icon={<Table2 size={20} />} />
        <MetricCard label="Kitchen queue" value={`${kdsItems.length}`} detail="Pending preparation items" icon={<ChefHat size={20} />} />
        <MetricCard label="System status" value="Online" detail="Realtime channel connected" icon={<Wifi size={20} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">Live Order Tracker</h2>
              <p className="text-sm text-slate-500">Open, pending, ready, closed, and paid states at a glance.</p>
            </div>
            <Activity className="text-emerald-600" size={20} />
          </div>
          <div className="divide-y divide-slate-100">
            {openOrder.items.map((item) => (
              <div key={item.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-medium">{item.qty}x {item.name}</p>
                  <p className="text-sm text-slate-500">{openOrder.table} / {openOrder.waiter} / {item.station}</p>
                </div>
                <StatusPill value={item.status} />
                <span className="text-sm font-semibold">{money(item.price)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">MVP Flow</h2>
          <div className="mt-4 space-y-3">
            {[
              "Create tenant and users",
              "Create tables, stations, menu items",
              "Waiter opens order and sends items",
              "KDS marks pending items ready",
              "Cashier receives payment and closes bill",
              "Admin views sales report",
            ].map((step, index) => (
              <div key={step} className="flex gap-3 rounded-md border border-slate-200 p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-emerald-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Tables</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {tables.map((table) => (
              <div key={table.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-medium">{table.name}</p>
                  <p className="text-sm text-slate-500">{table.area} / {table.waiter}</p>
                </div>
                <StatusPill value={table.status} />
                <span className="text-sm font-semibold">{table.total ? money(table.total) : "-"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Cashier Queue</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {cashierOrders.map((order) => (
              <div key={`${order.table}-${order.status}`} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-medium">{order.table}</p>
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock3 size={14} /> {order.waiter} / due {money(order.due)}
                  </p>
                </div>
                <StatusPill value={order.status} />
                <Link href="/cashier" className="rounded-md bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
                  Open bill
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
