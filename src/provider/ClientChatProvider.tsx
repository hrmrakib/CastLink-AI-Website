"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

interface MessagePayload {
  action?: string;
  type?: string;
  data?: any;
  [key: string]: any;
}

interface ClientChatContextType {
  socket: WebSocket | null;
  isAuthenticated: boolean;
  connect: (threadId: string, token: string, isGuest?: boolean) => void;
  sendMessage: (payload: MessagePayload) => void;
  disconnect: () => void;
}

const ClientChatContext = createContext<ClientChatContextType>({
  socket: null,
  isAuthenticated: false,
  connect: () => {},
  sendMessage: () => {},
  disconnect: () => {},
});

export const useClientChat = () => useContext(ClientChatContext);

export const ClientChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentThreadId = useRef<string | null>(null);

  const connect = useCallback((threadId: string, token: string, isGuest: boolean = false) => {
    if (currentThreadId.current === threadId && socket?.readyState === WebSocket.OPEN) return;

    if (!token || !threadId) return;

    setSocket((prev) => {
      if (prev) prev.close();
      return null;
    });

    currentThreadId.current = threadId;
    setIsAuthenticated(false);

    // Notice there is no token in the URL for this route
    const ws = new WebSocket(`wss://api.poolofcast.com/ws/client-chat/${threadId}/`);

    ws.onopen = () => {
      console.log("ClientChat WebSocket connected. Authenticating...");
      
      // The socket closes if we don't auth within 5 seconds
      const authPayload = isGuest 
        ? { action: "auth", guest_token: token }
        : { action: "auth", token: token };
        
      ws.send(JSON.stringify(authPayload));
    };

    ws.onclose = (event) => {
      console.log("ClientChat WebSocket disconnected", event.code);
      currentThreadId.current = null;
      setIsAuthenticated(false);
      setSocket(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "auth_ok") {
          console.log("ClientChat auth successful");
          setIsAuthenticated(true);
        } else if (message.type === "error") {
          console.error("ClientChat error:", message);
        } else {
          // Normal message handling can be picked up by components subscribing or via a global store
          console.log("ClientChat message:", message);
        }
      } catch (err) {
        console.error("Error parsing ClientChat message", err);
      }
    };

    setSocket(ws);
  }, [socket]);

  const sendMessage = useCallback((payload: MessagePayload) => {
    if (socket && socket.readyState === WebSocket.OPEN && isAuthenticated) {
      socket.send(JSON.stringify(payload));
    } else {
      console.warn("Socket is not open or not authenticated yet.");
    }
  }, [socket, isAuthenticated]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
  }, [socket]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <ClientChatContext.Provider value={{ socket, isAuthenticated, connect, sendMessage, disconnect }}>
      {children}
    </ClientChatContext.Provider>
  );
};
