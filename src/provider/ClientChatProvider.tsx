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
  messages: any[];
  unreadCount: number;
  connect: (threadId: string, token: string, isGuest?: boolean) => void;
  sendMessage: (payload: MessagePayload) => void;
  markSeen: () => void;
  disconnect: () => void;
}

const ClientChatContext = createContext<ClientChatContextType>({
  socket: null,
  isAuthenticated: false,
  messages: [],
  unreadCount: 0,
  connect: () => { },
  sendMessage: () => { },
  markSeen: () => { },
  disconnect: () => { },
});

export const useClientChat = () => useContext(ClientChatContext);

export const ClientChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentThreadId = useRef<string | null>(null);
  const messageQueue = useRef<MessagePayload[]>([]);

  const connect = useCallback((threadId: string, token: string, isGuest: boolean = false) => {
    const currentSocket = socketRef.current;
    if (
      currentThreadId.current === threadId &&
      (currentSocket?.readyState === WebSocket.OPEN || currentSocket?.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (!token || !threadId) return;

    if (currentSocket) {
      currentSocket.close();
    }

    setSocket(null);
    socketRef.current = null;

    currentThreadId.current = threadId;
    setIsAuthenticated(false);

    // Dynamic protocol to avoid SSL errors in local dev
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//10.10.29.50:8050/ws/client-chat/${threadId}/`);
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
          // Hydrate history immediately upon authentication
          ws.send(JSON.stringify({ action: "fetch_chat" }));

          // Flush any queued messages
          if (messageQueue.current.length > 0) {
            messageQueue.current.forEach((payload) => {
              ws.send(JSON.stringify(payload));
            });
            messageQueue.current = [];
          }
        } else if (message.type === "fetch_chat") {
          // Received hydrated history, merge with any optimistic messages we already have
          const serverMsgs = Array.isArray(message.data) ? message.data : (message.data?.messages || []);
          
          // Calculate initial unread count based on role
          const initialUnread = serverMsgs.reduce((acc: number, msg: any) => {
            if (isGuest) {
               if ((msg.sender === "agent" || msg.sender_type === "agent") && !msg.is_seen_by_client) return acc + 1;
            } else {
               if ((msg.sender === "client" || msg.sender_type === "client") && !msg.is_seen_by_agent) return acc + 1;
            }
            return acc;
          }, 0);
          
          setUnreadCount(initialUnread);

          setMessages((prev) => {
            const optimisticMsgs = prev.filter((m) => m.isOptimistic);
            return [...serverMsgs, ...optimisticMsgs];
          });
        } else if (message.type === "message") {
          // Received a new live message
          const newMsg = message.data;
          setMessages((prev) => {
            // Deduplicate server echo of our own optimistic message
            const lastMsg = prev[prev.length - 1];
            if (
              lastMsg &&
              lastMsg.isOptimistic &&
              (lastMsg.sender === "client" || lastMsg.sender_type === "client") &&
              (lastMsg.text === newMsg.text || lastMsg.content === newMsg.text || lastMsg.text === newMsg.content)
            ) {
              const updated = [...prev];
              updated[updated.length - 1] = newMsg;
              return updated;
            }
            return [...prev, newMsg];
          });

          if (newMsg.sender_type === "agent" || newMsg.sender === "agent") {
            setUnreadCount((prev) => prev + 1);
          }
        } else if (message.type === "seen") {
          console.log("ClientChat messages seen by", message.data?.seen_by);
          const seenBy = message.data?.seen_by;
          setMessages((prev) => prev.map(m => {
            if (seenBy === "agent" && (m.sender === "client" || m.sender_type === "client")) {
              return { ...m, is_seen_by_agent: true };
            }
            if (seenBy === "client" && (m.sender === "agent" || m.sender_type === "agent")) {
              return { ...m, is_seen_by_client: true };
            }
            return m;
          }));
        } else if (message.type === "error") {
          console.error("ClientChat error:", message);
        } else {
          console.log("ClientChat unknown message:", message);
        }
      } catch (err) {
        console.error("Error parsing ClientChat message", err);
      }
    };

    setSocket(ws);
    socketRef.current = ws;
  }, []);

  const markSeen = useCallback(() => {
    setUnreadCount(0);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isAuthenticated) {
      socketRef.current.send(JSON.stringify({ action: "seen" }));
    }
  }, [isAuthenticated]);

  const sendMessage = useCallback((payload: MessagePayload) => {
    // Optimistic UI update (always fire so UI stays responsive)
    if (payload.action === "send_message" && payload.text) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "client",
          sender_type: "client",
          text: payload.text,
          isOptimistic: true,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isAuthenticated) {
      const payloadString = JSON.stringify(payload);
      console.log("ClientChat sending message:", payloadString);
      try {
        socketRef.current.send(payloadString);
      } catch (err) {
        console.error("ClientChat send error:", err);
      }
    } else {
      console.warn("Socket is not open or not authenticated yet. Queuing message...");
      messageQueue.current.push(payload);
    }
  }, [isAuthenticated]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <ClientChatContext.Provider value={{ socket, isAuthenticated, messages, unreadCount, connect, sendMessage, markSeen, disconnect }}>
      {children}
    </ClientChatContext.Provider>
  );
};
