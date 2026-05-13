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
import { useDispatch, useSelector } from "react-redux";
import {
  clearConversation,
  setConversation,
} from "@/redux/features/messages/conversationSlice";
import { RootState } from "@/redux/store";

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
        <div
          key={i}
          className='p-3 sm:p-4 flex items-start gap-3 animate-pulse'
        >
          {/* Avatar */}
          <div className='h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted shrink-0' />

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
    <div className='flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4'>
      {layout.map((item, i) => (
        <div
          key={i}
          className={`flex ${item.sent ? "justify-end" : "justify-start"} animate-pulse`}
        >
          <div
            className={`flex flex-col gap-1.5 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 ${
              item.wide ? "w-44 sm:w-56 md:w-64" : "w-28 sm:w-36 md:w-44"
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
                } ${li === item.lines - 1 && item.lines > 1 ? "w-3/4" : "w-full"}`}
              />
            ))}
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
  const selectedConversation = useSelector(
    (state: RootState) => state.conversation,
  );
  const isConversationSelected = selectedConversation.conversation_id !== 0;
  const [messages, setMessages] = useState<Message[]>();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [msgPage] = useState(1);
  const [msgLimit] = useState(1000);
  const { socket, connect } = useSocket();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUploadWithMessageMutation, { isLoading: isUploadingWithMessage }] =
    useFileUploadWithMessageMutation();
  const dispatch = useDispatch();

  const {
    data: messagesData,
    refetch: refetchMessages,
    isFetching: messagesFetching,
  } = useGetMessagesQuery(
    {
      conversationId: selectedConversation?.conversation_id,
      page: msgPage,
      limit: msgLimit,
    },
    {
      skip: !selectedConversation?.conversation_id,
    },
  );

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
        const merged = new Map<number, Message>();
        incoming.forEach((m: Message) => merged.set(m.message_id, m));
        (prev ?? []).forEach((m) => {
          if (!merged.has(m.message_id)) merged.set(m.message_id, m);
        });
        return Array.from(merged.values()).sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      });
    }
  }, [messagesData, selectedConversation?.conversation_id]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data);

        console.log("Incoming RAW:", raw);

        const payload = raw?.data ?? raw?.message ?? raw;

        if (!payload?.message_id) return;

        const incoming: Message = {
          message_id: payload.message_id,
          conversation: payload.conversation_id ?? payload.conversation,
          sender: payload.sender_id ?? payload.sender,
          receiver: payload.receiver_id ?? payload.receiver,
          sender_name: payload.sender_name ?? "",
          receiver_name: payload.receiver_name ?? "",
          message_type: payload.message_type ?? "text",
          text: payload.text ?? "",
          attachment: payload.attachment ?? null,
          attachment_url: payload.attachment_url ?? null,
          is_seen: payload.is_seen ?? false,
          seen_at: payload.seen_at ?? null,
          created_at: payload.created_at,
        };

        if (incoming.sender == null) return;

        setMessages((prev) => {
          if (!prev) return [incoming];

          const exists = prev.some((m) => m.message_id === incoming.message_id);
          if (exists) return prev;

          return [...prev, incoming].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
        });
      } catch (err) {
        console.error("WS parse error:", err);
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

    console.log(updated);

    dispatch(setConversation(updated));
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
    <div className='border-t border-border bg-background p-3 sm:p-4 shrink-0 safe-area-bottom'>
      {selectedFiles.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-3 max-h-28 overflow-y-auto'>
          {selectedFiles.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : null;
            return (
              <div
                key={index}
                className='relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-7 max-w-[160px] sm:max-w-40'
              >
                {isImage && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className='h-9 w-9 sm:h-10 sm:w-10 rounded object-cover shrink-0'
                  />
                ) : (
                  <div className='h-9 w-9 sm:h-10 sm:w-10 rounded bg-blue-100 flex items-center justify-center shrink-0'>
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
                  className='absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:bg-red-600 touch-manipulation'
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className='flex items-center gap-1.5 sm:gap-2'>
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
          className='h-10 w-10 sm:h-11 sm:w-11 shrink-0 touch-manipulation'
        >
          <PlusIcon className='h-4 w-4 sm:h-5 sm:w-5' />
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
          className='rounded-lg h-10 sm:h-11 text-sm sm:text-base'
        />
        <Button
          onClick={handleSendMessage}
          disabled={
            (!newMessage && selectedFiles.length === 0) ||
            !selectedConversation ||
            isUploadingWithMessage
          }
          className='w-10 h-10 sm:w-11 sm:h-11 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg disabled:bg-[#2563EB] disabled:text-white disabled:cursor-not-allowed shrink-0 touch-manipulation'
          size='icon'
        >
          <SendIcon className='h-4 w-4 sm:h-5 sm:w-5' />
        </Button>
      </div>
    </div>
  );

  // ── Shared: Message Bubbles ──────────────────────────────────────────────────
  const MessageList = (
    <div className='flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4'>
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
              className={`flex ${isImage ? "flex-col" : "items-center"} gap-1 max-w-[85%] sm:max-w-[75%] md:max-w-sm lg:max-w-xs rounded-lg overflow-hidden ${
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
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 ${
                    isSent ? "hover:bg-blue-700" : "hover:bg-muted"
                  } transition-colors`}
                >
                  <div className='h-9 w-9 rounded bg-white/20 flex items-center justify-center shrink-0'>
                    <span className='text-xs font-bold uppercase'>
                      {message.attachment_url?.split(".").pop()}
                    </span>
                  </div>
                  <p className='text-xs truncate max-w-[120px] sm:max-w-none'>
                    {message.attachment_url?.split("/").pop()}
                  </p>
                </a>
              )}

              {message.text && (
                <div className='px-3 sm:px-4 py-2'>
                  <p className='text-sm leading-relaxed'>{message.text}</p>
                </div>
              )}

              <div
                className={`px-2 pb-1.5 sm:pb-2 flex ${isSent ? "justify-end" : "justify-start"}`}
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
    <div className='h-[100dvh] sm:h-[85vh] md:h-[80vh] bg-background flex overflow-hidden'>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div
        className={`
          flex-col bg-background border-r border-border
          w-full md:w-72 lg:w-96 md:shrink-0
          ${isConversationSelected ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Search */}
        <div className='p-3 sm:p-4 border-b border-border shrink-0'>
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search messages...'
              className='pl-10 rounded-lg h-10 text-sm'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='flex border-b border-border px-3 sm:px-4 shrink-0'>
          {(["all", "unread", "read"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors touch-manipulation ${
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
                  className={`p-3 sm:p-4 cursor-pointer transition-colors border-l-4 touch-manipulation ${
                    selectedConversation?.conversation_id ===
                    conversation.conversation_id
                      ? "bg-blue-50 border-l-blue-600"
                      : "bg-background border-l-transparent hover:bg-muted active:bg-muted"
                  }`}
                >
                  <div className='flex items-start gap-2.5 sm:gap-3'>
                    <div className='relative shrink-0'>
                      <img
                        src={getImageUrl(conversation.other_user_profile_pic)}
                        alt={conversation?.other_user_name || "avatar"}
                        width={48}
                        height={48}
                        className='h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover'
                      />
                      <div className='absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 rounded-full border-2 border-background' />
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

                      <p className='text-xs text-muted-foreground truncate hidden sm:block'>
                        {conversation.other_user_email}
                      </p>

                      <p className='text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate'>
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
                      <div className='bg-[#2563EB] text-white text-xs font-semibold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shrink-0'>
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center h-64 text-muted-foreground'>
              <p className='text-sm'>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      <div
        className={`
          flex-col flex-1 bg-muted/30 min-w-0
          ${isConversationSelected ? "flex" : "hidden md:flex"}
        `}
      >
        {isConversationSelected ? (
          <>
            {/* Chat Header */}
            <div className='border-b border-border bg-background px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shrink-0'>
              {/* Back button — mobile & tablet only */}
              <button
                onClick={() => dispatch(clearConversation())}
                className='md:hidden text-blue-600 shrink-0 p-1 -ml-1 touch-manipulation'
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
                  className='h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover'
                />
                <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-background' />
              </div>

              <div className='flex-1 min-w-0'>
                <h2 className='font-semibold text-foreground truncate text-sm sm:text-base'>
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
          // Empty state — visible on desktop/tablet when no conversation is selected
          <div className='flex items-center justify-center h-full text-muted-foreground'>
            <p className='text-sm'>Select a conversation to start messaging</p>
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
