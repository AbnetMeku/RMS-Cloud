import { Building2, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { tenants } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function SuperAdminPage() {
  return (
    <AppShell title="Tenant Management" eyebrow="Super Admin" active="/super-admin">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Restaurants" value={`${tenants.length}`} detail="Across the platform" icon={<Building2 size={20} />} />
        <MetricCard label="Active tenants" value="2" detail="1 suspended" icon={<ShieldCheck size={20} />} />
        <MetricCard label="Platform users" value="37" detail="All tenant roles" icon={<Users size={20} />} />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Restaurants</h2>
            <p className="text-sm text-slate-500">Create, activate, suspend, or review tenant restaurants.</p>
          </div>
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">New tenant</button>
        </div>
        <div className="divide-y divide-slate-100">
          {tenants.map((tenant) => (
            <div key={tenant.name} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div>
                <p className="font-medium">{tenant.name}</p>
                <p className="text-sm text-slate-500">{tenant.branch} / {tenant.users} users</p>
              </div>
              <StatusPill value={tenant.status} />
              <span className="text-sm font-semibold">{money(tenant.salesToday)}</span>
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold">Manage</button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
