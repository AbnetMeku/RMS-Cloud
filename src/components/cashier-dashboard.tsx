"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { money } from "@/lib/utils";
import { recordPaymentAction } from "@/modules/cashier/actions";
import { CreditCard } from "lucide-react";

type Order = {
  id: string;
  table: string;
  waiter: string;
  grandTotal: number;
  paid: number;
  due: number;
  items: Array<{ name: string; qty: number; price: number }>;
};

export function CashierDashboard({
  tenantId,
  currency,
  orders: initialOrders,
  shift,
}: {
  tenantId: string;
  currency: string;
  orders: Order[];
  shift: { totalCollected: number; paymentCount: number; byWaiter: Array<{ name: string; total: number; count: number }> };
}) {
  const [orders] = useState(initialOrders);
  const [selected, setSelected] = useState<Order | null>(initialOrders[0] ?? null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const online = useOnlineStatus();

  useOrderSocket(tenantId, () => {
    window.location.reload();
  });

  return (
    <>
      {!online && (
        <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">Offline — payments disabled.</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Queue" value={String(orders.length)} detail="Closed bills" icon={<CreditCard size={20} />} />
        <MetricCard label="Collected today" value={money(shift.totalCollected, currency)} detail={`${shift.paymentCount} payments`} />
        <MetricCard label="Due selected" value={selected ? money(selected.due, currency) : "—"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Awaiting Payment</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {orders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelected(o)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left ${selected?.id === o.id ? "border-emerald-600 bg-emerald-50" : ""}`}
              >
                <span>{o.table} · {o.waiter}</span>
                <span className="font-semibold">{money(o.due, currency)}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{selected ? `${selected.table} Bill` : "Select order"}</CardTitle></CardHeader>
          <CardContent>
            {selected && (
              <>
                <div className="mb-4 space-y-1 text-sm">
                  {selected.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between"><span>{i.qty}x {i.name}</span><span>{money(i.price, currency)}</span></div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span><span>{money(selected.grandTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Paid</span><span>{money(selected.paid, currency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Due</span><span>{money(selected.due, currency)}</span>
                  </div>
                </div>

                <form
                  action={async (fd) => {
                    fd.set("orderId", selected.id);
                    await recordPaymentAction(fd);
                    router.refresh();
                  }}
                  className="grid gap-2"
                >
                  <Input name="amount" type="number" defaultValue={selected.due} max={selected.due} min="0.01" step="0.01" required />
                  <Select name="method" defaultValue="CASH">
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE_MONEY">Mobile money</option>
                    <option value="SPLIT">Split</option>
                  </Select>
                  <Input name="reference" placeholder="Reference (optional)" />
                  <Button type="submit" disabled={pending || !online || selected.due <= 0}>
                    Record payment
                  </Button>
                </form>

                <Link href={`/cashier/receipt/${selected.id}`} className="mt-3 inline-block">
                  <Button variant="outline" className="w-full">Print receipt</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Shift by waiter</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {shift.byWaiter.map((w) => (
            <p key={w.name}>{w.name}: {money(w.total, currency)} ({w.count} payments)</p>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
