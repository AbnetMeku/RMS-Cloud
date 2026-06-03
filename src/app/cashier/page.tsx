"use client";

import { useMemo, useState } from "react";
import { Banknote, CreditCard, Printer, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { cashierOrders, reports } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function CashierPage() {
  const [orders, setOrders] = useState(cashierOrders);

  const dueTotal = useMemo(() => orders.reduce((sum, order) => sum + order.due, 0), [orders]);
  const paidCount = orders.filter((order) => order.status === "paid").length;

  function markPaid(index: number) {
    setOrders((current) =>
      current.map((order, orderIndex) =>
        orderIndex === index ? { ...order, status: "paid", paid: order.total, due: 0 } : order,
      ),
    );
  }

  return (
    <AppShell title="Cashier Billing" eyebrow="Cashier / Sara Cashier" active="/cashier">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Closed bills" value={`${orders.length - paidCount}`} detail="Waiting payment" icon={<ReceiptText size={20} />} />
        <MetricCard label="Paid bills" value={`${paidCount}`} detail="Current queue" icon={<CreditCard size={20} />} />
        <MetricCard label="Amount due" value={money(dueTotal)} detail="Unpaid balance" icon={<Banknote size={20} />} />
        <MetricCard label="Sales today" value={money(reports.sales)} detail="All waiters" icon={<Printer size={20} />} />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">Payment Queue</h2>
          <p className="text-sm text-slate-500">Closed orders appear here when the customer asks for the bill.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.map((order, index) => (
            <div key={`${order.table}-${index}`} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div>
                <p className="font-medium">{order.table} / {order.waiter}</p>
                <p className="text-sm text-slate-500">
                  Total {money(order.total)} / paid {money(order.paid)} / due {money(order.due)}
                </p>
              </div>
              <StatusPill value={order.status} />
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold">
                  <Printer size={16} /> Receipt
                </button>
                <button
                  onClick={() => markPaid(index)}
                  disabled={order.status === "paid"}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <CreditCard size={16} /> Mark paid
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Sales By Waiter</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {reports.byWaiter.map((waiter) => (
            <div key={waiter.name} className="rounded-lg border border-slate-200 p-4">
              <p className="font-medium">{waiter.name}</p>
              <p className="mt-1 text-sm text-slate-500">{waiter.orders} orders</p>
              <p className="mt-3 text-xl font-semibold">{money(waiter.sales)}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
