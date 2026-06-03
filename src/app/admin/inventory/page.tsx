import { guardAdminSection } from "@/lib/admin-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adjustStockAction, createInventoryAction, recordPurchaseAction } from "@/modules/admin/actions";
import { listInventoryItems } from "@/modules/inventory/service";

export default async function AdminInventoryPage() {
  const { tenantId } = await guardAdminSection("MANAGE_INVENTORY");
  const inventory = await listInventoryItems(tenantId);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Inventory</h2>

      <Card className="mb-6">
        <CardHeader><CardTitle>Add inventory item</CardTitle></CardHeader>
        <CardContent>
          <form action={createInventoryAction} className="grid gap-3 md:grid-cols-2">
            <div><Label>Name</Label><Input name="name" required /></div>
            <div><Label>Category</Label><Input name="category" /></div>
            <div><Label>Unit</Label><Input name="unit" placeholder="kg, L, pcs" required /></div>
            <div><Label>Quantity</Label><Input name="quantity" type="number" step="0.001" defaultValue="0" /></div>
            <div><Label>Cost per unit</Label><Input name="costPerUnit" type="number" defaultValue="0" /></div>
            <div><Label>Supplier</Label><Input name="supplier" /></div>
            <div className="md:col-span-2"><Button type="submit">Add item</Button></div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm">
                Stock: <strong>{Number(item.quantity)}</strong> {item.unit}
                {item.category && <span className="text-slate-500"> · {item.category}</span>}
              </p>

              <form action={recordPurchaseAction} className="mb-3 grid gap-2 rounded border p-3">
                <input type="hidden" name="inventoryItemId" value={item.id} />
                <Label className="text-xs font-semibold uppercase text-slate-500">Record purchase</Label>
                <Input name="quantity" type="number" step="0.001" placeholder="Qty" required />
                <Input name="costPerUnit" type="number" placeholder="Cost/unit" required />
                <Input name="supplier" placeholder="Supplier" />
                <Input name="purchaseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                <Button type="submit" size="sm">Record</Button>
              </form>

              <form action={adjustStockAction} className="grid gap-2 rounded border p-3">
                <input type="hidden" name="inventoryItemId" value={item.id} />
                <Label className="text-xs font-semibold uppercase text-slate-500">Adjust stock</Label>
                <Input name="quantityDelta" type="number" step="0.001" placeholder="+/-" required />
                <Input name="reason" placeholder="Reason" required />
                <Button type="submit" size="sm" variant="outline">Adjust</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
