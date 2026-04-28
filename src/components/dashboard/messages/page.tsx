/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { SearchIcon, SendIcon, PlusIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useFileUploadWithMessageMutation,
  useGetMessagesQuery,
  useGetMyConversationsQuery,
} from "@/redux/features/messages/messagesAPI";
import { SocketProvider, useSocket } from "@/provider/SocketProvider";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type TConversation = {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_email: string;
  other_user_profile_pic: string;
  last_message: LastMessage;
  unread_count: number;
  updated_at: string;
  created_at: string;
};

type LastMessage = {
  message_id: number;
  text: string;
  message_type: string;
  attachment: string | null;
  sender_id: number;
  created_at: string;
};

type Message = {
  message_id: number;
  conversation: number;
  sender: number;
  sender_name: string;
  receiver: number;
  receiver_name: string;
  message_type: "text" | "image" | "video" | "file";
  text: string;
  attachment: string | null;
  attachment_url: string | null;
  is_seen: boolean;
  seen_at: string | null;
  created_at: string;
};

type FilterTab = "unread" | "read" | "all";

// ── Skeleton: Sidebar Conversation Items ─────────────────────────────────────
function ConversationSkeleton() {
  return (
    <div className='divide-y divide-border'>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className='p-4 flex items-start gap-3 animate-pulse'>
          {/* Avatar */}
          <div className='h-12 w-12 rounded-full bg-muted shrink-0' />

          <div className='flex-1 min-w-0 space-y-2'>
            {/* Name + timestamp row */}
            <div className='flex items-center justify-between gap-2'>
              <div className='h-3.5 w-28 rounded bg-muted' />
              <div className='h-3 w-10 rounded bg-muted shrink-0' />
            </div>
            {/* Email */}
            <div className='h-3 w-36 rounded bg-muted' />
            {/* Last message */}
            <div className='h-3 w-44 rounded bg-muted' />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton: Chat Message Bubbles ────────────────────────────────────────────
function MessagesSkeleton() {
  // Alternate sent / received to mimic a real conversation
  const layout = [
    { sent: false, lines: 2, wide: false },
    { sent: true, lines: 1, wide: false },
    { sent: false, lines: 3, wide: true },
    { sent: true, lines: 2, wide: false },
    { sent: false, lines: 1, wide: false },
    { sent: true, lines: 3, wide: true },
    { sent: false, lines: 2, wide: false },
    { sent: true, lines: 1, wide: false },
  ];

  return (
    <div className='flex-1 overflow-y-auto p-4 lg:p-6 space-y-4'>
      {layout.map((item, i) => (
        <div
          key={i}
          className={`flex ${item.sent ? "justify-end" : "justify-start"} animate-pulse`}
        >
          <div
            className={`flex flex-col gap-1.5 rounded-lg px-4 py-3 ${
              item.wide ? "w-56 sm:w-64" : "w-36 sm:w-44"
            } ${
              item.sent
                ? "bg-blue-100 rounded-br-none"
                : "bg-muted rounded-bl-none border border-border"
            }`}
          >
            {Array.from({ length: item.lines }).map((_, li) => (
              <div
                key={li}
                className={`h-3 rounded ${
                  item.sent ? "bg-blue-200" : "bg-muted-foreground/20"
                } ${
                  li === item.lines - 1 && item.lines > 1
                    ? "w-3/4" // last line shorter → natural text look
                    : "w-full"
                }`}
              />
            ))}
            {/* Timestamp placeholder */}
            <div
              className={`h-2.5 w-10 rounded mt-1 self-end ${
                item.sent ? "bg-blue-200" : "bg-muted-foreground/20"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagingComponent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<TConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [msgPage] = useState(1);
  const [msgLimit] = useState(100);
  const { socket, connect } = useSocket();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUploadWithMessageMutation, { isLoading: isUploadingWithMessage }] =
    useFileUploadWithMessageMutation();

  const {
    data: messagesData,
    refetch: refetchMessages,
    isFetching: messagesFetching,
  } = useGetMessagesQuery({
    conversationId: selectedConversation?.conversation_id || 2,
    page: msgPage,
    limit: msgLimit,
  });

  const { data: conversations, isFetching: conversationsFetching } =
    useGetMyConversationsQuery({
      page: 1,
      limit: 100,
      search: searchQuery,
      message_status: activeFilter,
    });

  const myConversations = conversations?.data?.results || [];
  const lastConversationId = useRef<number | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation) return;
    connect(selectedConversation.conversation_id);
  }, [selectedConversation, connect]);

  useEffect(() => {
    const incoming = messagesData?.data?.messages;
    if (!Array.isArray(incoming) || incoming.length === 0) return;

    const currentId = selectedConversation?.conversation_id ?? null;

    if (currentId !== lastConversationId.current) {
      lastConversationId.current = currentId;
      setMessages(incoming);
    } else {
      setMessages((prev) => {
        const existingIds = new Set((prev ?? []).map((m) => m.message_id));
        const newOnes = incoming.filter(
          (m: Message) => !existingIds.has(m.message_id),
        );
        if (!newOnes.length) return prev ?? [];
        return [...newOnes, ...(prev ?? [])];
      });
    }
  }, [messagesData, selectedConversation?.conversation_id]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        console.log("Incoming RAW:", data);

        const incoming: Message = data.message || data.data || data;

        if (!incoming) return;

        setMessages((prev) => {
          if (!prev) return [incoming];

          const exists = prev.some((m) => m.message_id === incoming.message_id);
          if (exists) return prev;

          return [...prev, incoming];
        });
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const handleSendMessage = async () => {
    const hasText = newMessage.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;

    if (!hasText && !hasFiles) return;
    if (!selectedConversation) return;

    const conversationId = selectedConversation.conversation_id;

    if (!conversationId) {
      toast.error("Conversation not found");
      return;
    }

    if (hasFiles) {
      for (const file of selectedFiles) {
        const isImage = file.type.startsWith("image/");
        const formData = new FormData();
        formData.append("message_type", isImage ? "image" : "file");
        formData.append("text", hasText ? newMessage : "Here is the file");
        formData.append("attachment", file);

        const res = await fileUploadWithMessageMutation({
          conversationId,
          body: formData,
        }).unwrap();

        if (res?.status) {
          refetchMessages();
          toast.success("Message sent successfully!");
        }
      }

      setSelectedFiles([]);
      setNewMessage("");
      return;
    }

    if (!socket) return;

    const optimistic: Message = {
      message_id: Date.now(),
      conversation: conversationId,
      sender: user?.user_id as number,
      sender_name: "You",
      receiver: selectedConversation.other_user_id,
      receiver_name: selectedConversation.other_user_name,
      message_type: "text",
      text: newMessage,
      attachment: null,
      attachment_url: null,
      is_seen: false,
      seen_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...(prev ?? []), optimistic]);

    socket?.send(
      JSON.stringify({
        action: "send_message",
        text: newMessage,
      }),
    );

    setNewMessage("");
  };

  const handleSelectConversation = (conversation: TConversation) => {
    const updated = { ...conversation, unread_count: 0 };
    setSelectedConversation(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg";
    const base = (process.env.NEXT_PUBLIC_IMAGE_URL || "").replace(/\/$/, "");
    const filePath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${filePath}`;
  };

  // ── Shared: Message Input ────────────────────────────────────────────────────
  const MessageInput = (
    <div className='border-t border-border bg-background p-4 shrink-0'>
      {selectedFiles.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-3'>
          {selectedFiles.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : null;
            return (
              <div
                key={index}
                className='relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-7 max-w-40'
              >
                {isImage && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className='h-10 w-10 rounded object-cover shrink-0'
                  />
                ) : (
                  <div className='h-10 w-10 rounded bg-blue-100 flex items-center justify-center shrink-0'>
                    <span className='text-xs text-blue-600 font-bold uppercase'>
                      {file.name.split(".").pop()}
                    </span>
                  </div>
                )}
                <p className='text-xs text-muted-foreground truncate'>
                  {file.name}
                </p>
                <button
                  onClick={() => removeFile(index)}
                  className='absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:bg-red-600'
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className='flex items-center gap-2'>
        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          accept='image/*,.pdf,.doc,.docx,.txt'
          multiple
          onChange={handleFileChange}
        />
        <Button
          variant='ghost'
          size='icon'
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon className='h-5 w-5' />
        </Button>
        <Input
          placeholder='Write your message...'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className='rounded-lg h-11'
        />
        <Button
          onClick={handleSendMessage}
          disabled={
            (!newMessage && selectedFiles.length === 0) ||
            !selectedConversation ||
            isUploadingWithMessage
          }
          className='w-11 h-11 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg disabled:bg-[#2563EB] disabled:text-white disabled:cursor-not-allowed shrink-0'
          size='icon'
        >
          <SendIcon className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );

  // ── Shared: Message Bubbles ──────────────────────────────────────────────────
  const MessageList = (
    <div className='flex-1 overflow-y-auto p-4 lg:p-6 space-y-4'>
      {messages?.map((message) => {
        const isSent = message.sender === user?.user_id;
        const isImage = message.message_type === "image";
        const isFile = message.message_type === "file";
        const attachmentUrl = message.attachment_url
          ? getImageUrl(message.attachment_url)
          : null;

        return (
          <div
            key={message.message_id}
            className={`flex ${isSent ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex ${isImage ? "flex-col" : "items-center"} gap-1 max-w-[75%] sm:max-w-xs rounded-lg overflow-hidden ${
                isSent
                  ? "bg-[#2563EB] text-white rounded-br-none"
                  : "bg-background text-foreground border border-border rounded-bl-none"
              }`}
            >
              {isImage && attachmentUrl && (
                <a
                  href={attachmentUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <img
                    src={attachmentUrl}
                    alt='attachment'
                    className='w-full max-w-xs object-cover rounded-t-lg'
                  />
                </a>
              )}

              {isFile && attachmentUrl && (
                <a
                  href={attachmentUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`flex items-center gap-2 px-4 py-3 ${
                    isSent ? "hover:bg-blue-700" : "hover:bg-muted"
                  } transition-colors`}
                >
                  <div className='h-9 w-9 rounded bg-white/20 flex items-center justify-center shrink-0'>
                    <span className='text-xs font-bold uppercase'>
                      {message.attachment_url?.split(".").pop()}
                    </span>
                  </div>
                  <p className='text-xs truncate'>
                    {message.attachment_url?.split("/").pop()}
                  </p>
                </a>
              )}

              {message.text && (
                <div className='px-4 py-2'>
                  <p className='text-sm'>{message.text}</p>
                </div>
              )}

              <div
                className={`px-2 pb-2 flex ${isSent ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`text-xs ${
                    isSent ? "text-blue-100" : "text-muted-foreground"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isSent && " ✓"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <div className='h-[80vh] bg-background flex overflow-hidden'>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div
        className={`
          flex-col bg-background border-r border-border
          w-full lg:w-96 lg:shrink-0
          ${selectedConversation ? "hidden lg:flex" : "flex"}
        `}
      >
        {/* Search */}
        <div className='p-4 border-b border-border shrink-0'>
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search messages or contacts...'
              className='pl-10 rounded-lg'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='flex border-b border-border px-4 shrink-0'>
          {(["all", "unread", "read"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeFilter === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className='flex-1 overflow-y-auto'>
          {conversationsFetching ? (
            <ConversationSkeleton />
          ) : myConversations?.length > 0 ? (
            <div className='divide-y divide-border'>
              {myConversations.map((conversation: TConversation) => (
                <div
                  key={conversation.conversation_id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors border-l-4 ${
                    selectedConversation?.conversation_id ===
                    conversation.conversation_id
                      ? "bg-blue-50 border-l-blue-600"
                      : "bg-background border-l-transparent hover:bg-muted"
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div className='relative shrink-0'>
                      <img
                        src={getImageUrl(conversation.other_user_profile_pic)}
                        alt={conversation?.other_user_name || "avatar"}
                        width={48}
                        height={48}
                        className='h-12 w-12 rounded-full object-cover'
                      />
                      <div className='absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <h3 className='font-semibold text-foreground text-sm truncate'>
                          {conversation.other_user_name}
                        </h3>
                        <span className='text-xs text-muted-foreground shrink-0'>
                          {new Date(conversation.updated_at).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>

                      <p className='text-xs text-muted-foreground'>
                        {conversation.other_user_email}
                      </p>

                      <p className='text-xs text-muted-foreground mt-1 truncate'>
                        {conversation.last_message?.message_type === "text"
                          ? conversation.last_message?.text
                          : conversation.last_message?.message_type === "image"
                            ? "📷 Image"
                            : conversation.last_message?.message_type === "file"
                              ? "📎 File"
                              : "No messages yet"}
                      </p>
                    </div>

                    {conversation.unread_count > 0 && (
                      <div className='bg-[#2563EB] text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center shrink-0'>
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center h-64 text-muted-foreground'>
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      <div
        className={`
          flex-col flex-1 bg-muted/30 min-w-0
          ${selectedConversation ? "flex" : "hidden lg:flex"}
        `}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className='border-b border-border bg-background p-4 flex items-center gap-3 shrink-0'>
              {/* Back button — mobile only */}
              <button
                onClick={() => setSelectedConversation(null)}
                className='lg:hidden text-blue-600 shrink-0'
                aria-label='Back to conversations'
              >
                <ArrowLeft className='h-5 w-5' />
              </button>

              <div className='relative shrink-0'>
                <img
                  src={getImageUrl(selectedConversation.other_user_profile_pic)}
                  alt={selectedConversation.other_user_name || "avatar"}
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-full object-cover'
                />
                <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-background' />
              </div>

              <div className='flex-1 min-w-0'>
                <h2 className='font-semibold text-foreground truncate'>
                  {selectedConversation.other_user_name}
                </h2>
                <p className='text-xs text-muted-foreground truncate'>
                  {selectedConversation.other_user_email}
                </p>
              </div>
            </div>

            {/* Messages — skeleton while fetching, real list once loaded */}
            {messagesFetching ? <MessagesSkeleton /> : MessageList}

            {/* Input */}
            {MessageInput}
          </>
        ) : (
          // Empty state — visible on desktop when no conversation is selected
          <div className='flex items-center justify-center h-full text-muted-foreground'>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <SocketProvider>
      <MessagingComponent />
    </SocketProvider>
  );
}

// /* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable @next/next/no-img-element */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useRef, useEffect } from "react";
// import {
//   SearchIcon,
//   SendIcon,
//   PlusIcon,
//   Loader2,
//   ArrowLeft,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   useFileUploadWithMessageMutation,
//   useGetMessagesQuery,
//   useGetMyConversationsQuery,
// } from "@/redux/features/messages/messagesAPI";
// import { SocketProvider, useSocket } from "@/provider/SocketProvider";
// import { useAuth } from "@/hooks/useAuth";
// import { toast } from "sonner";

// type TConversation = {
//   conversation_id: number;
//   other_user_id: number;
//   other_user_name: string;
//   other_user_email: string;
//   other_user_profile_pic: string;
//   last_message: LastMessage;
//   unread_count: number;
//   updated_at: string;
//   created_at: string;
// };

// type LastMessage = {
//   message_id: number;
//   text: string;
//   message_type: string;
//   attachment: string | null;
//   sender_id: number;
//   created_at: string;
// };

// type Message = {
//   message_id: number;
//   conversation: number;
//   sender: number;
//   sender_name: string;
//   receiver: number;
//   receiver_name: string;
//   message_type: "text" | "image" | "video" | "file";
//   text: string;
//   attachment: string | null;
//   attachment_url: string | null;
//   is_seen: boolean;
//   seen_at: string | null;
//   created_at: string;
// };

// type FilterTab = "unread" | "read" | "all";

// function MessagingComponent() {
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [selectedConversation, setSelectedConversation] =
//     useState<TConversation | null>(null);
//   const [messages, setMessages] = useState<Message[]>();
//   const [newMessage, setNewMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [msgPage] = useState(1);
//   const [msgLimit] = useState(100);
//   const { socket, connect } = useSocket();
//   const { user } = useAuth();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [fileUploadWithMessageMutation, { isLoading: isUploadingWithMessage }] =
//     useFileUploadWithMessageMutation();

//   const { data: messagesData, refetch: refetchMessages } = useGetMessagesQuery({
//     conversationId: selectedConversation?.conversation_id || 2,
//     page: msgPage,
//     limit: msgLimit,
//   });

//   const { data: conversations, isFetching: conversationsFetching } =
//     useGetMyConversationsQuery({
//       page: 1,
//       limit: 100,
//       search: searchQuery,
//       message_status: activeFilter,
//     });

//   const myConversations = conversations?.data?.results || [];
//   const lastConversationId = useRef<number | null>(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!selectedConversation) return;
//     connect(selectedConversation.conversation_id);
//   }, [selectedConversation, connect]);

//   useEffect(() => {
//     const incoming = messagesData?.data?.messages;
//     if (!Array.isArray(incoming) || incoming.length === 0) return;

//     const currentId = selectedConversation?.conversation_id ?? null;

//     if (currentId !== lastConversationId.current) {
//       lastConversationId.current = currentId;
//       setMessages(incoming);
//     } else {
//       setMessages((prev) => {
//         const existingIds = new Set((prev ?? []).map((m) => m.message_id));
//         const newOnes = incoming.filter(
//           (m: Message) => !existingIds.has(m.message_id),
//         );
//         if (!newOnes.length) return prev ?? [];
//         return [...newOnes, ...(prev ?? [])];
//       });
//     }
//   }, [messagesData, selectedConversation?.conversation_id]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);

//         console.log("Incoming RAW:", data);

//         const incoming: Message = data.message || data.data || data;

//         if (!incoming) return;

//         setMessages((prev) => {
//           if (!prev) return [incoming];

//           const exists = prev.some((m) => m.message_id === incoming.message_id);
//           if (exists) return prev;

//           return [...prev, incoming];
//         });
//       } catch (err) {
//         console.error("WS error:", err);
//       }
//     };

//     socket.addEventListener("message", handleMessage);

//     return () => {
//       socket.removeEventListener("message", handleMessage);
//     };
//   }, [socket]);

//   const handleSendMessage = async () => {
//     const hasText = newMessage.trim().length > 0;
//     const hasFiles = selectedFiles.length > 0;

//     if (!hasText && !hasFiles) return;
//     if (!selectedConversation) return;

//     const conversationId = selectedConversation.conversation_id;

//     if (!conversationId) {
//       toast.error("Conversation not found");
//       return;
//     }

//     if (hasFiles) {
//       for (const file of selectedFiles) {
//         const isImage = file.type.startsWith("image/");
//         const formData = new FormData();
//         formData.append("message_type", isImage ? "image" : "file");
//         formData.append("text", hasText ? newMessage : "Here is the file");
//         formData.append("attachment", file);

//         const res = await fileUploadWithMessageMutation({
//           conversationId,
//           body: formData,
//         }).unwrap();

//         if (res?.status) {
//           refetchMessages();
//           toast.success("Message sent successfully!");
//         }
//       }

//       setSelectedFiles([]);
//       setNewMessage("");
//       return;
//     }

//     if (!socket) return;

//     const optimistic: Message = {
//       message_id: Date.now(),
//       conversation: conversationId,
//       sender: user?.user_id as number,
//       sender_name: "You",
//       receiver: selectedConversation.other_user_id,
//       receiver_name: selectedConversation.other_user_name,
//       message_type: "text",
//       text: newMessage,
//       attachment: null,
//       attachment_url: null,
//       is_seen: false,
//       seen_at: null,
//       created_at: new Date().toISOString(),
//     };

//     setMessages((prev) => [...(prev ?? []), optimistic]);

//     socket?.send(
//       JSON.stringify({
//         action: "send_message",
//         text: newMessage,
//       }),
//     );

//     setNewMessage("");
//   };

//   const handleSelectConversation = (conversation: TConversation) => {
//     const updated = { ...conversation, unread_count: 0 };
//     setSelectedConversation(updated);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length) {
//       setSelectedFiles((prev) => [...prev, ...files]);
//     }
//     e.target.value = "";
//   };

//   const removeFile = (index: number) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const getImageUrl = (path: string | null | undefined) => {
//     if (!path) return "/placeholder.svg";
//     const base = (process.env.NEXT_PUBLIC_IMAGE_URL || "").replace(/\/$/, "");
//     const filePath = path.startsWith("/") ? path : `/${path}`;
//     return `${base}${filePath}`;
//   };

//   // ── Shared: Message Input ────────────────────────────────────────────────────
//   const MessageInput = (
//     <div className='border-t border-border bg-background p-4 shrink-0'>
//       {selectedFiles.length > 0 && (
//         <div className='flex flex-wrap gap-2 mb-3'>
//           {selectedFiles.map((file, index) => {
//             const isImage = file.type.startsWith("image/");
//             const previewUrl = isImage ? URL.createObjectURL(file) : null;
//             return (
//               <div
//                 key={index}
//                 className='relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-7 max-w-40'
//               >
//                 {isImage && previewUrl ? (
//                   <img
//                     src={previewUrl}
//                     alt={file.name}
//                     className='h-10 w-10 rounded object-cover shrink-0'
//                   />
//                 ) : (
//                   <div className='h-10 w-10 rounded bg-blue-100 flex items-center justify-center shrink-0'>
//                     <span className='text-xs text-blue-600 font-bold uppercase'>
//                       {file.name.split(".").pop()}
//                     </span>
//                   </div>
//                 )}
//                 <p className='text-xs text-muted-foreground truncate'>
//                   {file.name}
//                 </p>
//                 <button
//                   onClick={() => removeFile(index)}
//                   className='absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:bg-red-600'
//                 >
//                   ×
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <div className='flex items-center gap-2'>
//         <input
//           type='file'
//           ref={fileInputRef}
//           className='hidden'
//           accept='image/*,.pdf,.doc,.docx,.txt'
//           multiple
//           onChange={handleFileChange}
//         />
//         <Button
//           variant='ghost'
//           size='icon'
//           onClick={() => fileInputRef.current?.click()}
//         >
//           <PlusIcon className='h-5 w-5' />
//         </Button>
//         <Input
//           placeholder='Write your message...'
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault();
//               handleSendMessage();
//             }
//           }}
//           className='rounded-lg h-11'
//         />
//         <Button
//           onClick={handleSendMessage}
//           disabled={
//             (!newMessage && selectedFiles.length === 0) ||
//             !selectedConversation ||
//             isUploadingWithMessage
//           }
//           className='w-11 h-11 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg disabled:bg-[#2563EB] disabled:text-white disabled:cursor-not-allowed shrink-0'
//           size='icon'
//         >
//           <SendIcon className='h-5 w-5' />
//         </Button>
//       </div>
//     </div>
//   );

//   // ── Shared: Message Bubbles ──────────────────────────────────────────────────
//   const MessageList = (
//     <div className='flex-1 overflow-y-auto p-4 lg:p-6 space-y-4'>
//       {messages?.map((message) => {
//         const isSent = message.sender === user?.user_id;
//         const isImage = message.message_type === "image";
//         const isFile = message.message_type === "file";
//         const attachmentUrl = message.attachment_url
//           ? getImageUrl(message.attachment_url)
//           : null;

//         return (
//           <div
//             key={message.message_id}
//             className={`flex ${isSent ? "justify-end" : "justify-start"}`}
//           >
//             <div
//               className={`flex ${isImage ? "flex-col" : "items-center"} gap-1 max-w-[75%] sm:max-w-xs rounded-lg overflow-hidden ${
//                 isSent
//                   ? "bg-[#2563EB] text-white rounded-br-none"
//                   : "bg-background text-foreground border border-border rounded-bl-none"
//               }`}
//             >
//               {isImage && attachmentUrl && (
//                 <a
//                   href={attachmentUrl}
//                   target='_blank'
//                   rel='noopener noreferrer'
//                 >
//                   <img
//                     src={attachmentUrl}
//                     alt='attachment'
//                     className='w-full max-w-xs object-cover rounded-t-lg'
//                   />
//                 </a>
//               )}

//               {isFile && attachmentUrl && (
//                 <a
//                   href={attachmentUrl}
//                   target='_blank'
//                   rel='noopener noreferrer'
//                   className={`flex items-center gap-2 px-4 py-3 ${
//                     isSent ? "hover:bg-blue-700" : "hover:bg-muted"
//                   } transition-colors`}
//                 >
//                   <div className='h-9 w-9 rounded bg-white/20 flex items-center justify-center shrink-0'>
//                     <span className='text-xs font-bold uppercase'>
//                       {message.attachment_url?.split(".").pop()}
//                     </span>
//                   </div>
//                   <p className='text-xs truncate'>
//                     {message.attachment_url?.split("/").pop()}
//                   </p>
//                 </a>
//               )}

//               {message.text && (
//                 <div className='px-4 py-2'>
//                   <p className='text-sm'>{message.text}</p>
//                 </div>
//               )}

//               <div
//                 className={`px-2 pb-2 flex ${isSent ? "justify-end" : "justify-start"}`}
//               >
//                 <p
//                   className={`text-xs ${
//                     isSent ? "text-blue-100" : "text-muted-foreground"
//                   }`}
//                 >
//                   {new Date(message.created_at).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                   {isSent && " ✓"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//       <div ref={messagesEndRef} />
//     </div>
//   );

//   return (
//     <div className='h-[80vh] bg-background flex overflow-hidden'>
//       {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
//       <div
//         className={`
//           flex-col bg-background border-r border-border
//           w-full lg:w-96 lg:shrink-0
//           ${selectedConversation ? "hidden lg:flex" : "flex"}
//         `}
//       >
//         {/* Search */}
//         <div className='p-4 border-b border-border shrink-0'>
//           <div className='relative'>
//             <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
//             <Input
//               placeholder='Search messages or contacts...'
//               className='pl-10 rounded-lg'
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Filter Tabs */}
//         <div className='flex border-b border-border px-4 shrink-0'>
//           {(["all", "unread", "read"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveFilter(tab)}
//               className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
//                 activeFilter === tab
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Conversations List */}
//         <div className='flex-1 overflow-y-auto'>
//           {conversationsFetching ? (
//             <div className='flex items-center justify-center h-full'>
//               <Loader2 className='mr-2 h-8 w-8 animate-spin' />
//             </div>
//           ) : myConversations?.length > 0 ? (
//             <div className='divide-y divide-border'>
//               {myConversations.map((conversation: TConversation) => (
//                 <div
//                   key={conversation.conversation_id}
//                   onClick={() => handleSelectConversation(conversation)}
//                   className={`p-4 cursor-pointer transition-colors border-l-4 ${
//                     selectedConversation?.conversation_id ===
//                     conversation.conversation_id
//                       ? "bg-blue-50 border-l-blue-600"
//                       : "bg-background border-l-transparent hover:bg-muted"
//                   }`}
//                 >
//                   <div className='flex items-start gap-3'>
//                     <div className='relative shrink-0'>
//                       <img
//                         src={getImageUrl(conversation.other_user_profile_pic)}
//                         alt={conversation?.other_user_name || "avatar"}
//                         width={48}
//                         height={48}
//                         className='h-12 w-12 rounded-full object-cover'
//                       />
//                       <div className='absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background' />
//                     </div>

//                     <div className='flex-1 min-w-0'>
//                       <div className='flex items-center justify-between gap-2'>
//                         <h3 className='font-semibold text-foreground text-sm truncate'>
//                           {conversation.other_user_name}
//                         </h3>
//                         <span className='text-xs text-muted-foreground shrink-0'>
//                           {new Date(conversation.updated_at).toLocaleTimeString(
//                             [],
//                             { hour: "2-digit", minute: "2-digit" },
//                           )}
//                         </span>
//                       </div>

//                       <p className='text-xs text-muted-foreground'>
//                         {conversation.other_user_email}
//                       </p>

//                       <p className='text-xs text-muted-foreground mt-1 truncate'>
//                         {conversation.last_message?.message_type === "text"
//                           ? conversation.last_message?.text
//                           : conversation.last_message?.message_type === "image"
//                             ? "📷 Image"
//                             : conversation.last_message?.message_type === "file"
//                               ? "📎 File"
//                               : "No messages yet"}
//                       </p>
//                     </div>

//                     {conversation.unread_count > 0 && (
//                       <div className='bg-[#2563EB] text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center shrink-0'>
//                         {conversation.unread_count}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className='flex items-center justify-center h-64 text-muted-foreground'>
//               <p>No conversations found</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
//       <div
//         className={`
//           flex-col flex-1 bg-muted/30 min-w-0
//           ${selectedConversation ? "flex" : "hidden lg:flex"}
//         `}
//       >
//         {selectedConversation ? (
//           <>
//             {/* Chat Header */}
//             <div className='border-b border-border bg-background p-4 flex items-center gap-3 shrink-0'>
//               {/* Back button — mobile only */}
//               <button
//                 onClick={() => setSelectedConversation(null)}
//                 className='lg:hidden text-blue-600 shrink-0'
//                 aria-label='Back to conversations'
//               >
//                 <ArrowLeft className='h-5 w-5' />
//               </button>

//               <div className='relative shrink-0'>
//                 <img
//                   src={getImageUrl(selectedConversation.other_user_profile_pic)}
//                   alt={selectedConversation.other_user_name || "avatar"}
//                   width={40}
//                   height={40}
//                   className='h-10 w-10 rounded-full object-cover'
//                 />
//                 <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-background' />
//               </div>

//               <div className='flex-1 min-w-0'>
//                 <h2 className='font-semibold text-foreground truncate'>
//                   {selectedConversation.other_user_name}
//                 </h2>
//                 <p className='text-xs text-muted-foreground truncate'>
//                   {selectedConversation.other_user_email}
//                 </p>
//               </div>
//             </div>

//             {/* Messages */}
//             {MessageList}

//             {/* Input */}
//             {MessageInput}
//           </>
//         ) : (
//           // Empty state — visible on desktop when no conversation is selected
//           <div className='flex items-center justify-center h-full text-muted-foreground'>
//             <p>Select a conversation to start messaging</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function MessagingPage() {
//   return (
//     <SocketProvider>
//       <MessagingComponent />
//     </SocketProvider>
//   );
// }
