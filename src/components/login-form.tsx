"use client";

import { useState } from "react";
import { loginPinAction, loginStaffAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TenantOption = { id: string; name: string; branchName: string | null };

export function LoginForm({ tenants, error: initialError }: { tenants: TenantOption[]; error?: string }) {
  const [mode, setMode] = useState<"staff" | "pin">("staff");
  const [pin, setPin] = useState("");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>RMS Cloud Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs>
          <TabsList className="w-full">
            <TabsTrigger active={mode === "staff"} onClick={() => setMode("staff")} className="flex-1">
              Staff
            </TabsTrigger>
            <TabsTrigger active={mode === "pin"} onClick={() => setMode("pin")} className="flex-1">
              PIN
            </TabsTrigger>
          </TabsList>

          {initialError && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{initialError}</p>}

          <TabsContent hidden={mode !== "staff"}>
            <form action={loginStaffAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
              <p className="text-xs text-slate-500">For Super Admin, Admin, Manager, and Cashier.</p>
            </form>
          </TabsContent>

          <TabsContent hidden={mode !== "pin"}>
            <form action={loginPinAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantId">Restaurant</Label>
                <Select id="tenantId" name="tenantId" required defaultValue={tenants[0]?.id ?? ""}>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.branchName ? ` — ${t.branchName}` : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <input type="hidden" name="pin" value={pin} />
              <div className="space-y-2">
                <Label>PIN</Label>
                <PinPad value={pin} onChange={setPin} />
              </div>
              <Button type="submit" className="w-full" disabled={pin.length < 4}>
                Enter with PIN
              </Button>
              <p className="text-xs text-slate-500">For Waiter and Kitchen/KDS only.</p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PinPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

  return (
    <div>
      <div className="mb-3 flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="size-3 rounded-full border border-slate-300 bg-white"
            style={{ background: value[i] ? "#059669" : undefined }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <Button
            key={key}
            type="button"
            variant={key === "clear" ? "outline" : "secondary"}
            className="h-12"
            onClick={() => {
              if (key === "clear") onChange("");
              else if (key === "back") onChange(value.slice(0, -1));
              else if (value.length < 4) onChange(value + key);
            }}
          >
            {key === "back" ? "←" : key === "clear" ? "Clear" : key}
          </Button>
        ))}
      </div>
    </div>
  );
}
