"use client";

import { useMemo, useState } from "react";
import { Plus, ReceiptText, Send, Table2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { menuItems, openOrder, tables } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function WaiterPage() {
  const [orderStatus, setOrderStatus] = useState<"open" | "closed">("open");
  const [items, setItems] = useState(openOrder.items);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const tax = Math.round(total * 0.15);
  const service = Math.round(total * 0.1);
  const grandTotal = total + tax + service;

  function addItem() {
    if (orderStatus === "closed") return;
    const item = menuItems.find((entry) => entry.name === "Tibs Plate") ?? menuItems[0];
    setItems((current) => [
      ...current,
      {
        name: item.name,
        qty: 1,
        station: item.station,
        status: "pending",
        notes: "",
        price: item.price,
      },
    ]);
  }

  return (
    <AppShell title="Waiter Ordering" eyebrow="PIN session / Miki Waiter" active="/waiter">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned tables" value="2" detail="Main Floor" icon={<Table2 size={20} />} />
        <MetricCard label="Open orders" value="1" detail="Can add items" icon={<Plus size={20} />} />
        <MetricCard label="Closed orders" value="3" detail="Waiting cashier review" icon={<ReceiptText size={20} />} />
        <MetricCard label="Daily sales" value={money(15350)} detail="14 orders today" icon={<Send size={20} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Assigned Tables</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {tables.filter((table) => table.waiter === "Miki").map((table) => (
              <div key={table.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-medium">{table.name}</p>
                  <p className="text-sm text-slate-500">{table.area} / {table.total ? money(table.total) : "No active bill"}</p>
                </div>
                <StatusPill value={table.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Order / {openOrder.table}</h2>
              <p className="text-sm text-slate-500">Items can be added while the order is open.</p>
            </div>
            <StatusPill value={orderStatus} />
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-medium">{item.qty}x {item.name}</p>
                  <p className="text-sm text-slate-500">{item.station}{item.notes ? ` / ${item.notes}` : ""}</p>
                </div>
                <StatusPill value={item.status} />
                <span className="text-sm font-semibold">{money(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-4 border-t border-slate-200 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-medium">{money(total)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax</dt><dd className="font-medium">{money(tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Service</dt><dd className="font-medium">{money(service)}</dd></div>
              <div className="flex justify-between text-base"><dt className="font-semibold">Grand total</dt><dd className="font-semibold">{money(grandTotal)}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <button onClick={addItem} disabled={orderStatus === "closed"} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                <Plus size={16} /> Add item
              </button>
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">
                <Send size={16} /> Send
              </button>
              <button onClick={() => setOrderStatus("closed")} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                <ReceiptText size={16} /> Close bill
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
