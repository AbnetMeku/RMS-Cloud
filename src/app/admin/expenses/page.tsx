import { guardAdminSection } from "@/lib/admin-page";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createExpenseAction, createExpenseCategoryFormAction } from "@/modules/admin/actions";
import { listExpenses, listExpenseCategories } from "@/modules/expenses/service";

export default async function AdminExpensesPage() {
  const { tenantId, tenant } = await guardAdminSection("MANAGE_EXPENSES");
  const [categories, expenses] = await Promise.all([
    listExpenseCategories(tenantId),
    listExpenses(tenantId),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Expenses</h2>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add category</CardTitle></CardHeader>
          <CardContent>
            <form action={createExpenseCategoryFormAction} className="flex gap-2">
              <Input name="name" placeholder="Utilities, Rent..." required />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Record expense</CardTitle></CardHeader>
          <CardContent>
            <form action={createExpenseAction} className="grid gap-3">
              <div>
                <Label>Category</Label>
                <Select name="categoryId" required>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div><Label>Amount</Label><Input name="amount" type="number" required /></div>
              <div><Label>Description</Label><Input name="description" /></div>
              <div><Label>Date</Label><Input name="expenseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
              <Button type="submit">Add expense</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent expenses</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {expenses.length === 0 && <p className="text-sm text-slate-500">No expenses recorded.</p>}
          {expenses.map((e) => (
            <div key={e.id} className="flex justify-between rounded-md border px-3 py-2 text-sm">
              <span>{e.category.name}{e.description ? ` — ${e.description}` : ""}</span>
              <span className="font-medium">{money(Number(e.amount), tenant.currency)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
