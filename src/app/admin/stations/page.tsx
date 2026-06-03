import { guardAdminSection } from "@/lib/admin-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { assignKitchenFormAction, createStationFormAction } from "@/modules/stations/actions";
import { listStations } from "@/modules/stations/service";
import { listKitchenUsers } from "@/modules/users/service";

export default async function AdminStationsPage() {
  const { tenantId } = await guardAdminSection("MANAGE_STATIONS");
  const [stations, kitchenUsers] = await Promise.all([
    listStations(tenantId),
    listKitchenUsers(tenantId),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Stations</h2>

      <Card className="mb-6">
        <CardHeader><CardTitle>Add station</CardTitle></CardHeader>
        <CardContent>
          <form action={createStationFormAction} className="flex gap-2">
            <Input name="name" placeholder="Kitchen, Bar, Grill..." required />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {stations.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-slate-500">
                {s.menuItems.length} menu items · {s.users.length} kitchen staff
              </p>
              {kitchenUsers.length > 0 ? (
                <form action={assignKitchenFormAction} className="flex gap-2">
                  <input type="hidden" name="stationId" value={s.id} />
                  <Select name="userId" defaultValue={s.users[0]?.userId ?? kitchenUsers[0]?.id ?? ""}>
                    {kitchenUsers.map((k) => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </Select>
                  <Button type="submit" size="sm" variant="outline">Assign</Button>
                </form>
              ) : (
                <p className="text-sm text-amber-700">Create a kitchen user first.</p>
              )}
              {s.users.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {s.users.map((su) => (
                    <li key={su.userId}>· {su.user.name}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
