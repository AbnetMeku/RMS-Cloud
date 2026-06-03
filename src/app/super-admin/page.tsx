import { TenantStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRouteAccess } from "@/lib/route-guard";
import { createTenantAction, updateTenantStatusAction } from "@/modules/tenants/actions";
import { listTenants } from "@/modules/tenants/service";

export default async function SuperAdminPage() {
  const session = await requireRouteAccess("/super-admin");
  const tenants = await listTenants();

  return (
    <AppShell title="Tenant Management" eyebrow="Platform" active="/super-admin" role={session.role} userName={session.name}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTenantAction} className="space-y-3">
              <div><Label>Name</Label><Input name="name" required /></div>
              <div><Label>Branch</Label><Input name="branchName" /></div>
              <div><Label>Address</Label><Input name="address" /></div>
              <div><Label>Phone</Label><Input name="phone" /></div>
              <div><Label>Email</Label><Input name="email" type="email" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Currency</Label><Input name="currency" defaultValue="ETB" /></div>
                <div><Label>Timezone</Label><Input name="timezone" defaultValue="Africa/Addis_Ababa" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tax rate</Label><Input name="taxRate" type="number" step="0.01" defaultValue="0.15" /></div>
                <div><Label>Service charge</Label><Input name="serviceChargeRate" type="number" step="0.01" defaultValue="0.1" /></div>
              </div>
              <Button type="submit">Create tenant</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurants ({tenants.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{tenant.name}</p>
                    <p className="text-sm text-slate-500">{tenant.branchName ?? "—"} · {tenant.currency}</p>
                    <p className="text-xs text-slate-400">{tenant.address ?? "No address"}</p>
                  </div>
                  <Badge variant={tenant.subscriptionStatus === "ACTIVE" ? "success" : "warning"}>
                    {tenant.subscriptionStatus}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tenant.subscriptionStatus !== TenantStatus.ACTIVE && (
                    <form action={updateTenantStatusAction}>
                      <input type="hidden" name="tenantId" value={tenant.id} />
                      <input type="hidden" name="status" value={TenantStatus.ACTIVE} />
                      <Button type="submit" size="sm" variant="outline">Activate</Button>
                    </form>
                  )}
                  {tenant.subscriptionStatus === TenantStatus.ACTIVE && (
                    <form action={updateTenantStatusAction}>
                      <input type="hidden" name="tenantId" value={tenant.id} />
                      <input type="hidden" name="status" value={TenantStatus.SUSPENDED} />
                      <Button type="submit" size="sm" variant="outline">Suspend</Button>
                    </form>
                  )}
                  <form action={updateTenantStatusAction}>
                    <input type="hidden" name="tenantId" value={tenant.id} />
                    <input type="hidden" name="status" value={TenantStatus.DELETED} />
                    <Button type="submit" size="sm" variant="destructive">Delete</Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
