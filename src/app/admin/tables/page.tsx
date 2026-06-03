import { guardAdminSection } from "@/lib/admin-page";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  assignWaiterFormAction,
  createAreaFormAction,
  createTableAction,
  updateTableStatusFormAction,
} from "@/modules/admin/actions";
import { listDiningAreas, listTables } from "@/modules/tables/service";
import { listWaiters } from "@/modules/users/service";

export default async function AdminTablesPage() {
  const { tenantId } = await guardAdminSection("MANAGE_TABLES");
  const [tables, areas, waiters] = await Promise.all([
    listTables(tenantId),
    listDiningAreas(tenantId),
    listWaiters(tenantId),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Tables</h2>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add dining area</CardTitle></CardHeader>
          <CardContent>
            <form action={createAreaFormAction} className="flex gap-2">
              <Input name="name" placeholder="Area name" required />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Add table</CardTitle></CardHeader>
          <CardContent>
            <form action={createTableAction} className="grid gap-3">
              <div><Label>Name</Label><Input name="name" placeholder="T-01" required /></div>
              <div><Label>Capacity</Label><Input name="capacity" type="number" defaultValue="4" /></div>
              <div>
                <Label>Area</Label>
                <Select name="areaId" defaultValue="">
                  <option value="">No area</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Waiter</Label>
                <Select name="waiterId" defaultValue="">
                  <option value="">Unassigned</option>
                  {waiters.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              </div>
              <Button type="submit">Add table</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All tables ({tables.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {tables.map((t) => (
            <div key={t.id} className="rounded-md border px-3 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{t.name} · seats {t.capacity}</p>
                  <p className="text-slate-500">{t.area?.name ?? "No area"} · {t.waiter?.name ?? "Unassigned"}</p>
                </div>
                <StatusPill value={t.status.toLowerCase()} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={assignWaiterFormAction} className="flex gap-2">
                  <input type="hidden" name="tableId" value={t.id} />
                  <Select name="waiterId" defaultValue={t.waiterId ?? ""}>
                    <option value="">Unassigned</option>
                    {waiters.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </Select>
                  <Button type="submit" size="sm" variant="outline">Assign waiter</Button>
                </form>
                <form action={updateTableStatusFormAction} className="flex gap-2">
                  <input type="hidden" name="tableId" value={t.id} />
                  <Select name="status" defaultValue={t.status}>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                  <Button type="submit" size="sm" variant="outline">Set status</Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
