"use client";

import { useEffect, useRef } from "react";

export function useOrderSocket(tenantId: string, onEvent: () => void) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!tenantId) return;
    const source = new EventSource(`/api/events?tenantId=${tenantId}`);
    source.onmessage = () => callbackRef.current();
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, [tenantId]);
}
