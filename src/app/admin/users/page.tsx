import { Permission } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { guardAdminSection } from "@/lib/admin-page";
import { createUserAction, setPermissionsFormAction, toggleUserFormAction } from "@/modules/admin/actions";
import { listTenantUsers } from "@/modules/users/service";

const allPermissions: Permission[] = [
  "MANAGE_USERS",
  "MANAGE_TABLES",
  "MANAGE_MENU",
  "MANAGE_STATIONS",
  "MANAGE_INVENTORY",
  "MANAGE_EXPENSES",
  "VIEW_REPORTS",
  "MANAGE_ORDERS",
  "MANAGE_PAYMENTS",
];

export default async function AdminUsersPage() {
  const { tenantId, session } = await guardAdminSection("MANAGE_USERS");
  const users = await listTenantUsers(tenantId);
  const managers = users.filter((u) => u.role === "MANAGER");

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Users</h2>

      <Card className="mb-6">
        <CardHeader><CardTitle>Add user</CardTitle></CardHeader>
        <CardContent>
          <form action={createUserAction} className="grid gap-3 md:grid-cols-2">
            <div><Label>Name</Label><Input name="name" required /></div>
            <div><Label>Username</Label><Input name="username" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" /></div>
            <div>
              <Label>Role</Label>
              <Select name="role" required defaultValue="WAITER">
                <option value="MANAGER">Manager</option>
                <option value="WAITER">Waiter</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="CASHIER">Cashier</option>
                {session.role === "ADMIN" && <option value="ADMIN">Admin</option>}
              </Select>
            </div>
            <div><Label>Password (staff roles)</Label><Input name="password" type="password" /></div>
            <div><Label>PIN (waiter/kitchen)</Label><Input name="pin" maxLength={4} /></div>
            <div className="md:col-span-2"><Button type="submit">Create user</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>All users</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{u.name}</span>
                <span className="text-slate-500"> · @{u.username}</span>
                {!u.isActive && <span className="ml-2 text-red-600">(inactive)</span>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{u.role}</Badge>
                <form action={toggleUserFormAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="isActive" value={String(!u.isActive)} />
                  <Button type="submit" size="sm" variant="outline">
                    {u.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {session.role === "ADMIN" && managers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Manager permissions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {managers.map((manager) => (
              <form key={manager.id} action={setPermissionsFormAction} className="rounded-lg border p-4">
                <input type="hidden" name="userId" value={manager.id} />
                <p className="mb-3 font-medium">{manager.name}</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {allPermissions.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="permissions"
                        value={perm}
                        defaultChecked={manager.permissions.some((p) => p.permission === perm)}
                      />
                      {perm.replace(/_/g, " ").toLowerCase()}
                    </label>
                  ))}
                </div>
                <Button type="submit" size="sm" className="mt-3">Save permissions</Button>
              </form>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
