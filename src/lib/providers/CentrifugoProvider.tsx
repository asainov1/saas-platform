"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Centrifuge } from "centrifuge";
import { useOrganization } from "./OrganizationProvider";
import { notificationsApi } from "@/lib/api";

interface CentrifugoContextValue {
  connected: boolean;
}

const CentrifugoContext = createContext<CentrifugoContextValue>({
  connected: false,
});

const CENTRIFUGO_URL = process.env.NEXT_PUBLIC_CENTRIFUGO_URL || "wss://centrifugo.flowlyai.kz/connection/websocket";

export function CentrifugoProvider({ children }: { children: ReactNode }) {
  const { currentOrg } = useOrganization();
  const [connected, setConnected] = useState(false);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    if (!currentOrg) return;

    const getToken = async () => {
      try {
        const res = await notificationsApi.centrifugoToken(currentOrg.id);
        return res.token;
      } catch {
        return "";
      }
    };

    const centrifuge = new Centrifuge(CENTRIFUGO_URL, {
      getToken,
    });

    centrifuge.on("connected", () => setConnected(true));
    centrifuge.on("disconnected", () => setConnected(false));

    const sub = centrifuge.newSubscription(`org:${currentOrg.id}`);
    sub.on("publication", (ctx) => {
      const event = new CustomEvent("flowly:notification", { detail: ctx.data });
      window.dispatchEvent(event);
    });
    sub.subscribe();

    centrifuge.connect();
    centrifugeRef.current = centrifuge;

    return () => {
      centrifuge.disconnect();
      centrifugeRef.current = null;
    };
  }, [currentOrg]);

  return (
    <CentrifugoContext.Provider value={{ connected }}>
      {children}
    </CentrifugoContext.Provider>
  );
}

export function useCentrifugo() {
  return useContext(CentrifugoContext);
}
