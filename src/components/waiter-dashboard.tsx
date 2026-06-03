"use client";

import { useState, useTransition } from "react";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { money } from "@/lib/utils";
import { addItemAction, closeOrderAction, loadTableOrderAction, openOrderAction } from "@/modules/orders/actions";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

type Props = {
  tenantId: string;
  currency: string;
  tables: Array<{
    id: string;
    name: string;
    status: string;
    order: {
      id: string;
      status: string;
      grandTotal: number;
      items: Array<{ id: string; name: string; qty: number; status: string; price: number }>;
    } | null;
  }>;
  menuItems: Array<{ id: string; name: string; price: number; station: string }>;
  summary: { totalOrders: number; openOrders: number; closedOrders: number; paidOrders: number; totalSales: number };
};

export function WaiterDashboard({ tenantId, currency, tables: initialTables, menuItems, summary }: Props) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [selectedTable, setSelectedTable] = useState(initialTables[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const online = useOnlineStatus();

  function applyOrderToTable(tableId: string, order: Awaited<ReturnType<typeof loadTableOrderAction>>) {
    setTables((prev) =>
      prev.map((row) =>
        row.id === tableId
          ? {
              ...row,
              order: order
                ? {
                    id: order.id,
                    status: order.status,
                    grandTotal: Number(order.grandTotal),
                    items: order.items.map((i) => ({
                      id: i.id,
                      name: i.menuItem.name,
                      qty: i.quantity,
                      status: i.status,
                      price: Number(i.totalPrice),
                    })),
                  }
                : null,
            }
          : row,
      ),
    );
  }

  function refreshTable(tableId: string) {
    startTransition(async () => {
      const order = await loadTableOrderAction(tableId);
      applyOrderToTable(tableId, order);
    });
  }

  useOrderSocket(tenantId, () => {
    if (selectedTable) refreshTable(selectedTable);
  });

  const table = tables.find((t) => t.id === selectedTable);
  const order = table?.order;
  const canAddItems = online && order?.status === "OPEN";

  return (
    <>
      {!online && (
        <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Offline — new orders cannot be submitted until connection is restored.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total orders" value={String(summary.totalOrders)} icon={<ClipboardList size={20} />} />
        <MetricCard label="Open" value={String(summary.openOrders)} detail="Active tables" />
        <MetricCard label="Closed" value={String(summary.closedOrders)} detail="Awaiting payment" />
        <MetricCard label="Sales today" value={money(summary.totalSales, currency)} detail={`${summary.paidOrders} paid`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle>Assigned Tables</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTable(t.id);
                  refreshTable(t.id);
                }}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left ${selectedTable === t.id ? "border-emerald-600 bg-emerald-50" : ""}`}
              >
                <span className="font-medium">{t.name}</span>
                <StatusPill value={t.status.toLowerCase()} />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{table?.name ?? "Order"} · {order ? money(order.grandTotal, currency) : "No order"}</CardTitle>
          </CardHeader>
          <CardContent>
            {order ? (
              <>
                <div className="mb-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{item.qty}x {item.name}</span>
                      <div className="flex items-center gap-2">
                        <StatusPill value={item.status.toLowerCase()} />
                        <span>{money(item.price, currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {canAddItems && (
                  <form
                    action={async (fd) => {
                      fd.set("orderId", order.id);
                      await addItemAction(fd);
                      refreshTable(selectedTable);
                      router.refresh();
                    }}
                    className="mb-4 grid gap-2 rounded-lg border p-3"
                  >
                    <Select name="menuItemId" required>
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} — {money(m.price, currency)} ({m.station})</option>
                      ))}
                    </Select>
                    <Input name="quantity" type="number" defaultValue="1" min="1" />
                    <Input name="notes" placeholder="Notes" />
                    <Button type="submit" disabled={pending || !online}>Send to kitchen</Button>
                  </form>
                )}

                {order.status === "OPEN" && (
                  <Button
                    variant="secondary"
                    disabled={pending || !online}
                    onClick={() =>
                      startTransition(async () => {
                        await closeOrderAction(order.id);
                        refreshTable(selectedTable);
                        router.refresh();
                      })
                    }
                  >
                    Close bill
                  </Button>
                )}
                {order.status === "CLOSED" && (
                  <p className="text-sm text-slate-500">Bill closed — sent to cashier.</p>
                )}
              </>
            ) : selectedTable ? (
              <div>
                <p className="mb-3 text-sm text-slate-500">No active order for this table.</p>
                <Button
                  disabled={pending || !online}
                  onClick={() =>
                    startTransition(async () => {
                      await openOrderAction(selectedTable);
                      refreshTable(selectedTable);
                      router.refresh();
                    })
                  }
                >
                  Open order
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a table to start.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
