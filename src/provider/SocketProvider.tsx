"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

interface SocketContextType {
  socket: WebSocket | null;
  connect: (conversationId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const currentConversationId = useRef<number | null>(null); // ← track active ID

  const connect = useCallback((conversationId: number) => {
    // ← skip if already connected to this conversation
    if (currentConversationId.current === conversationId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Close previous socket cleanly
    setSocket((prev) => {
      if (prev) prev.close();
      return null;
    });

    currentConversationId.current = conversationId;

    console.log("inside provider", conversationId);

    const ws = new WebSocket(
      `wss://api.poolofcast.com/ws/chat/${conversationId}/?token=${token}`,
    );

    ws.onopen = () => console.log("WebSocket connected");

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      currentConversationId.current = null; // ← reset so reconnect is allowed
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message:", event.data);
    };

    setSocket(ws);
  }, []); // ← stable reference, no deps

  return (
    <SocketContext.Provider value={{ socket, connect }}>
      {children}
    </SocketContext.Provider>
  );
};
