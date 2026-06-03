"use client";

import { useState } from "react";
import { Check, ChefHat, Clock3, Flame } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { kdsItems } from "@/lib/demo-data";

export default function KdsPage() {
  const [items, setItems] = useState(kdsItems);

  function markReady(index: number) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: "ready" } : item));
  }

  const pending = items.filter((item) => item.status === "pending").length;
  const ready = items.filter((item) => item.status === "ready").length;

  return (
    <AppShell title="Kitchen Display System" eyebrow="Station / Kitchen" active="/kds">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending items" value={`${pending}`} detail="Need preparation" icon={<Flame size={20} />} />
        <MetricCard label="Ready items" value={`${ready}`} detail="Waiters notified" icon={<Check size={20} />} />
        <MetricCard label="Station" value="Kitchen" detail="PIN session active" icon={<ChefHat size={20} />} />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">Incoming Items</h2>
          <p className="text-sm text-slate-500">Only items routed to this station appear here.</p>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={`${item.table}-${item.item}-${index}`} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.table} / {item.waiter}</p>
                  <h3 className="mt-1 text-xl font-semibold">{item.qty}x {item.item}</h3>
                </div>
                <StatusPill value={item.status} />
              </div>
              <p className="mt-3 min-h-6 text-sm text-slate-600">{item.notes || "No notes"}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                  <Clock3 size={16} /> {item.elapsed}
                </span>
                <button
                  onClick={() => markReady(index)}
                  disabled={item.status === "ready"}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Check size={16} /> Ready
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
