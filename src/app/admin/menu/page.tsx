import { guardAdminSection } from "@/lib/admin-page";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCategoryFormAction, createMenuItemAction } from "@/modules/admin/actions";
import { listMenuCategories } from "@/modules/menu/service";
import { listStations } from "@/modules/stations/service";

export default async function AdminMenuPage() {
  const { tenantId, tenant } = await guardAdminSection("MANAGE_MENU");
  const [categories, stations] = await Promise.all([
    listMenuCategories(tenantId),
    listStations(tenantId),
  ]);
  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Menu</h2>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
          <CardContent>
            <form action={createCategoryFormAction} className="grid gap-3">
              <div><Label>Name</Label><Input name="name" required /></div>
              <div>
                <Label>Parent (optional)</Label>
                <Select name="parentId" defaultValue="">
                  <option value="">Top level</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <Button type="submit">Add category</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Add menu item</CardTitle></CardHeader>
          <CardContent>
            <form action={createMenuItemAction} className="grid gap-3">
              <div><Label>Name</Label><Input name="name" required /></div>
              <div><Label>Price</Label><Input name="price" type="number" required /></div>
              <div><Label>Description</Label><Input name="description" /></div>
              <div>
                <Label>Category</Label>
                <Select name="categoryId" required>
                  {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Station</Label>
                <Select name="stationId" required>
                  {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="taxEnabled" defaultChecked />
                Tax enabled
              </label>
              <Button type="submit">Add item</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Menu catalog</CardTitle></CardHeader>
        <CardContent>
          {categories.map((cat) => (
            <div key={cat.id} className="mb-6">
              <p className="font-semibold">{cat.name}</p>
              {cat.children.map((sub) => (
                <p key={sub.id} className="ml-2 text-sm text-slate-500">↳ {sub.name}</p>
              ))}
              <div className="mt-2 space-y-1">
                {cat.items.map((item) => (
                  <p key={item.id} className="text-sm">
                    {item.name} — {money(Number(item.price), tenant.currency)} → {item.station.name}
                    {!item.isAvailable && <span className="text-red-600"> (unavailable)</span>}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
