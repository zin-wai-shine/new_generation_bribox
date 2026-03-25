import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url) {
  const ws = useRef(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = url || `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setConnected(true);
      console.log('🔌 WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch {
        console.warn('Invalid WS message:', event.data);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log('🔌 WebSocket disconnected. Reconnecting in 3s...');
      setTimeout(connect, 3000);
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.current?.close();
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);

  return { lastMessage, connected };
}
