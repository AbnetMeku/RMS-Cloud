import { Boxes, ChefHat, CircleDollarSign, ClipboardList, Table2, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { expenses, inventory, menuItems, reports, stations, tables, users } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function AdminPage() {
  return (
    <AppShell title="Admin And Manager Dashboard" eyebrow="Cloud Bistro / tenant controls" active="/admin">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={`${users.length}`} detail="Role and PIN access" icon={<Users size={20} />} />
        <MetricCard label="Tables" value={`${tables.length}`} detail="Assigned waiter coverage" icon={<Table2 size={20} />} />
        <MetricCard label="Stations" value={`${stations.length}`} detail="Menu item routing" icon={<ChefHat size={20} />} />
        <MetricCard label="Net profit" value={money(reports.netProfit)} detail="Sales minus expenses and purchases" icon={<CircleDollarSign size={20} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Users And Permissions" icon={<Users size={20} />}>
          {users.map((user) => (
            <Row key={user.name} primary={user.name} secondary={`${user.role} / ${user.access}`} right={<StatusPill value={user.status} />} />
          ))}
        </Panel>

        <Panel title="Tables" icon={<Table2 size={20} />}>
          {tables.map((table) => (
            <Row key={table.name} primary={table.name} secondary={`${table.area} / waiter ${table.waiter}`} right={<StatusPill value={table.status} />} />
          ))}
        </Panel>

        <Panel title="Menu Routing" icon={<ClipboardList size={20} />}>
          {menuItems.map((item) => (
            <Row
              key={item.name}
              primary={item.name}
              secondary={`${item.category} / ${item.station}`}
              right={<span className="text-sm font-semibold">{money(item.price)}</span>}
            />
          ))}
        </Panel>

        <Panel title="Stations" icon={<ChefHat size={20} />}>
          {stations.map((station) => (
            <Row
              key={station.name}
              primary={station.name}
              secondary={`${station.staff} / ${station.activeItems} pending`}
              right={<span className="text-sm font-semibold">{station.readyItems} ready</span>}
            />
          ))}
        </Panel>

        <Panel title="Inventory" icon={<Boxes size={20} />}>
          {inventory.map((item) => (
            <Row
              key={item.name}
              primary={item.name}
              secondary={`${item.category} / ${item.qty} / ${item.supplier}`}
              right={<span className="text-sm font-semibold">{money(item.cost)}</span>}
            />
          ))}
        </Panel>

        <Panel title="Expenses" icon={<CircleDollarSign size={20} />}>
          {expenses.map((expense) => (
            <Row
              key={`${expense.category}-${expense.description}`}
              primary={expense.category}
              secondary={`${expense.description} / ${expense.date}`}
              right={<span className="text-sm font-semibold">{money(expense.amount)}</span>}
            />
          ))}
        </Panel>
      </div>
    </AppShell>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function Row({ primary, secondary, right }: { primary: string; secondary: string; right: React.ReactNode }) {
  return (
    <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-medium">{primary}</p>
        <p className="text-sm text-slate-500">{secondary}</p>
      </div>
      {right}
    </div>
  );
}
