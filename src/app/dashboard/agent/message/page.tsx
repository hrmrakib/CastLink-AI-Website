/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { SearchIcon, SendIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Message {
  id: number;
  sender: string;
  role: "Agent" | "Client";
  content: string;
  timestamp: string;
  isSent: boolean;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unread?: number;
  isOnline: boolean;
  role: "Agent" | "Client";
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "X-AE-A-13b",
    lastMessage: "Enter your message description here...",
    timestamp: "12:25",
    avatar: "/man.png",
    unread: 8,
    isOnline: true,
    role: "Agent",
  },
  {
    id: 2,
    name: "X-AE-A-13b",
    lastMessage: "Please call me back on 08193843...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: true,
    role: "Client",
  },
  {
    id: 3,
    name: "X-AE-A-13b",
    lastMessage: "Enter your message description here...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: true,
    role: "Agent",
  },
  {
    id: 4,
    name: "X-AE-A-13b",
    lastMessage: "Please call me back on 08193843...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: false,
    role: "Agent",
  },
  {
    id: 5,
    name: "X-AE-A-13b",
    lastMessage: "Please call me back on 08193843...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: true,
    role: "Agent",
  },
  {
    id: 6,
    name: "X-AE-A-13b",
    lastMessage: "Please call me back on 08193843...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: true,
    role: "Agent",
  },
  {
    id: 7,
    name: "X-AE-A-13b",
    lastMessage: "Please call me back on 08193843...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: true,
    role: "Agent",
  },
  {
    id: 8,
    name: "X-AE-A-13b",
    lastMessage: "Please call me back on 08193843...",
    timestamp: "12:25",
    avatar: "/man.png",
    isOnline: false,
    role: "Agent",
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    sender: "X-AE-A-13b",
    role: "Agent",
    content: "You viewed X_AE_A-13b  12:25",
    timestamp: "12:25",
    isSent: false,
  },
  {
    id: 2,
    sender: "You",
    role: "Agent",
    content:
      "Hey, what's up? How are you doing? am looking to make a deal with you.",
    timestamp: "11:25",
    isSent: true,
  },
];

type FilterTab = "all" | "unread" | "unresolved";

export default function MessagingPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) => {
    let matches: any = true;

    // Filter by search query
    if (searchQuery) {
      matches =
        matches &&
        (conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by tab
    if (activeFilter === "unread") {
      matches = matches && conv.unread && conv.unread > 0;
    } else if (activeFilter === "unresolved") {
      matches = matches && conv.unread && conv.unread > 0;
    }

    return matches;
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: messages.length + 1,
        sender: "You",
        role: "Agent",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Clear unread count
    const updated = { ...conversation, unread: 0 };
    setSelectedConversation(updated);
  };

  const ROLE_COLORS = {
    Agent: "bg-blue-100 text-blue-800",
    Client: "bg-purple-100 text-purple-800",
  };

  return (
    <div className='h-[80vh] bg-transparent flex flex-col lg:flex-row overflow-hidden'>
      {/* Sidebar - Conversations List */}
      <div className='w-full lg:w-96 border-r border-border flex flex-col bg-background'>
        {/* Search */}
        <div className='p-4 border-b border-border'>
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
        <div className='flex border-b border-border px-4'>
          {(["all", "unread", "unresolved"] as const).map((tab) => (
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
          {filteredConversations.length > 0 ? (
            <div className='divide-y divide-border'>
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors border-l-4 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50 border-l-blue-600"
                      : "bg-background border-l-transparent hover:bg-muted"
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    {/* Avatar with Online Status */}
                    <div className='relative shrink-0'>
                      <Image
                        src={conversation.avatar || "/placeholder.svg"}
                        alt={conversation.name}
                        width={48}
                        height={48}
                        className='h-12 w-12 rounded-full object-cover'
                      />
                      {conversation.isOnline && (
                        <div className='absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background'></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <h3 className='font-semibold text-foreground text-sm'>
                          {conversation.name}
                        </h3>
                        <span className='text-xs text-muted-foreground shrink-0'>
                          {conversation.timestamp}
                        </span>
                      </div>

                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            ROLE_COLORS[conversation.role]
                          }`}
                        >
                          {conversation.role}
                        </span>
                      </div>

                      <p className='text-xs text-muted-foreground mt-1 truncate'>
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {conversation.unread && conversation.unread > 0 && (
                      <div className='bg-[#2563EB] text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center shrink-0'>
                        {conversation.unread}
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

      {/* Chat Area */}
      <div className='hidden lg:flex flex-1 flex-col bg-muted/30'>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className='border-b border-border bg-background p-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <Image
                    src={selectedConversation.avatar || "/placeholder.svg"}
                    alt={selectedConversation.name}
                    width={40}
                    height={40}
                    className='h-10 w-10 rounded-full object-cover'
                  />
                  {selectedConversation.isOnline && (
                    <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-background'></div>
                  )}
                </div>
                <div>
                  <h2 className='font-semibold text-foreground'>
                    {selectedConversation.name}
                  </h2>
                  <p className='text-xs text-muted-foreground'>
                    {selectedConversation.isOnline
                      ? "Active now"
                      : "Last seen 7h ago"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isSent ? "justify-end" : "justify-start"
                  }`}
                >
                  {!message.isSent && (
                    <div className='mr-3 shrink-0 text-xs text-muted-foreground'>
                      {message.timestamp}
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.isSent
                        ? "bg-[#2563EB] text-white rounded-br-none"
                        : "bg-background text-foreground border border-border rounded-bl-none"
                    }`}
                  >
                    <p className='text-sm'>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isSent
                          ? "text-blue-100"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp} {message.isSent && "✓"}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className='border-t border-border bg-background p-4'>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='icon'>
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
                  className='rounded-lg'
                />
                <Button
                  onClick={handleSendMessage}
                  className='bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg'
                  size='icon'
                >
                  <SendIcon className='h-5 w-5' />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center h-full text-muted-foreground'>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Mobile Chat View */}
      <div className='lg:hidden flex-1 flex flex-col'>
        {selectedConversation ? (
          <>
            {/* Mobile Chat Header */}
            <div className='border-b border-border bg-background p-4 flex items-center gap-3'>
              <button
                onClick={() => setSelectedConversation(null)}
                className='text-blue-600 font-medium'
              >
                Back
              </button>
              <div className='relative flex-1'>
                <Image
                  src={selectedConversation.avatar || "/placeholder.svg"}
                  alt={selectedConversation.name}
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-full object-cover'
                />
                {selectedConversation.isOnline && (
                  <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-background'></div>
                )}
              </div>
              <div>
                <h2 className='font-semibold text-foreground text-sm'>
                  {selectedConversation.name}
                </h2>
                <p className='text-xs text-muted-foreground'>
                  {selectedConversation.isOnline
                    ? "Active now"
                    : "Last seen 7h ago"}
                </p>
              </div>
            </div>

            {/* Mobile Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isSent ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.isSent
                        ? "bg-[#2563EB] text-white rounded-br-none"
                        : "bg-background text-foreground border border-border rounded-bl-none"
                    }`}
                  >
                    <p className='text-sm'>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isSent
                          ? "text-blue-100"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp} {message.isSent && "✓"}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Message Input */}
            <div className='border-t border-border bg-background p-4'>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='icon'>
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
                  className='rounded-lg'
                />
                <Button
                  onClick={handleSendMessage}
                  className='bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg'
                  size='icon'
                >
                  <SendIcon className='h-5 w-5' />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='overflow-y-auto'>
            {/* Mobile Sidebar */}
            <div className='p-4 border-b border-border'>
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

            <div className='flex border-b border-border px-4'>
              {(["all", "unread", "unresolved"] as const).map((tab) => (
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

            <div className='divide-y divide-border'>
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className='p-4 cursor-pointer transition-colors hover:bg-muted'
                >
                  <div className='flex items-start gap-3'>
                    <div className='relative shrink-0'>
                      <Image
                        src={conversation.avatar || "/placeholder.svg"}
                        alt={conversation.name}
                        width={48}
                        height={48}
                        className='h-12 w-12 rounded-full object-cover'
                      />
                      {conversation.isOnline && (
                        <div className='absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background'></div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <h3 className='font-semibold text-foreground text-sm'>
                          {conversation.name}
                        </h3>
                        <span className='text-xs text-muted-foreground shrink-0'>
                          {conversation.timestamp}
                        </span>
                      </div>

                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            ROLE_COLORS[conversation.role]
                          }`}
                        >
                          {conversation.role}
                        </span>
                      </div>

                      <p className='text-xs text-muted-foreground mt-1 truncate'>
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {conversation.unread && conversation.unread > 0 && (
                      <div className='bg-[#2563EB] text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center shrink-0'>
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
