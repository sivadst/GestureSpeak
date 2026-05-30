"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createWebSocket } from "@/lib/api";

interface GestureResult {
  gesture: string;
  confidence: number;
  text: string;
  language: string;
  landmarks: any[];
  handedness?: string[];
  timestamp: number;
  simulated?: boolean;
}

interface UseGestureWebSocketOptions {
  language?: string;
  enabled?: boolean;
  onResult?: (result: GestureResult) => void;
}

export function useGestureWebSocket({
  language = "en",
  enabled = true,
  onResult,
}: UseGestureWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastResult, setLastResult] = useState<GestureResult | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ws = createWebSocket(clientId);

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "gesture_result") {
          setLastResult(msg.data);
          onResult?.(msg.data);
        }
      } catch {}
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (enabled) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, [enabled, onResult]);

  const sendFrame = useCallback(
    (frameBase64: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "frame", frame: frameBase64, language })
        );
      }
    },
    [language]
  );

  const simulate = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "simulate", language }));
    }
  }, [language]);

  useEffect(() => {
    if (enabled) connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [enabled, connect]);

  return { isConnected, lastResult, sendFrame, simulate };
}
