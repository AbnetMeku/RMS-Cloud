"use client";

import { useEffect, useState, useTransition } from "react";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { markReadyAction } from "@/modules/kds/actions";

type Station = {
  stationId: string;
  stationName: string;
  items: Array<{
    id: string;
    table: string;
    waiter: string;
    name: string;
    qty: number;
    notes: string | null;
    createdAt: string;
  }>;
};

export function KdsBoard({ tenantId, stations: initial }: { tenantId: string; stations: Station[] }) {
  const [stations, setStations] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useOrderSocket(tenantId, () => {
    window.location.reload();
  });

  function elapsed(iso: string) {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {stations.map((station) => (
        <Card key={station.stationId}>
          <CardHeader>
            <CardTitle>{station.stationName} · {station.items.length} pending</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {station.items.length === 0 && <p className="text-sm text-slate-500">No pending items.</p>}
            {station.items.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{item.qty}x {item.name}</p>
                    <p className="text-sm text-slate-500">{item.table} · {item.waiter}</p>
                    {item.notes && <p className="mt-1 text-sm text-amber-700">{item.notes}</p>}
                  </div>
                  <div className="text-right">
                    <StatusPill value="pending" />
                    <p className="mt-2 text-sm font-mono">{elapsed(item.createdAt)}</p>
                  </div>
                </div>
                <Button
                  className="mt-3 w-full"
                  disabled={pending}
                  onClick={() => startTransition(() => markReadyAction(item.id, station.stationId))}
                >
                  Mark ready
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
