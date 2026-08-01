"use client";

import React, { useState } from "react";
import Image from "next/image";

// --- Types ---
interface InboxRow {
  id: string;
  name: string;
  email: string;
  lastSeen: string;
  favorites: number;
  unreadCount: number;
  jobTitle: string;
}

interface TalentRef {
  id: string;
  name: string;
  imageUrl: string;
}

interface ChatMessage {
  id: string;
  sender: "client" | "agent";
  text: string;
  timestamp: string;
  talent?: TalentRef;
}

// --- Mock Data ---
const INBOX_DATA: InboxRow[] = [
  {
    id: "c1",
    name: "Jane Doe",
    email: "jane@example.com",
    lastSeen: "2h ago",
    favorites: 3,
    unreadCount: 5,
    jobTitle: "Coca-Cola Summer Campaign",
  },
  {
    id: "c2",
    name: "John Smith",
    email: "john@agency.com",
    lastSeen: "1d ago",
    favorites: 1,
    unreadCount: 0,
    jobTitle: "Nike Fall Lookbook",
  },
  {
    id: "c3",
    name: "Sarah Lee",
    email: "sarah.lee@corp.net",
    lastSeen: "Just now",
    favorites: 6,
    unreadCount: 2,
    jobTitle: "Coca-Cola Summer Campaign",
  },
];

const MOCK_TALENTS: TalentRef[] = [
  { id: "t1", name: "Sona Muni", imageUrl: "/preview/1.jpg" },
  { id: "t2", name: "Amira H.", imageUrl: "/preview/2.jpg" },
  { id: "t3", name: "Blessing", imageUrl: "/preview/3.jpg" },
];

const MOCK_CHAT: ChatMessage[] = [
  {
    id: "m1",
    sender: "client",
    text: "Love the energy in her reel — can we get her for the Thursday shoot?",
    timestamp: "2 hours ago",
    talent: MOCK_TALENTS[0],
  },
  {
    id: "m2",
    sender: "agent",
    text: "Let me check her availability with her manager. Usually she needs a 1-week notice.",
    timestamp: "1 hour ago",
  },
  {
    id: "m3",
    sender: "client",
    text: "This look is perfect for the second role.",
    timestamp: "45 mins ago",
    talent: MOCK_TALENTS[1],
  },
];

// --- Components ---
export default function AgentGlobalInboxPage() {
  const [selectedClient, setSelectedClient] = useState<InboxRow | null>(null);
  const [messageText, setMessageText] = useState("");

  // Sort by unread first, then we'd normally sort by lastSeen timestamp
  const sortedInbox = [...INBOX_DATA].sort((a, b) => b.unreadCount - a.unreadCount);

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Main Inbox List */}
      <div className={`flex-1 overflow-y-auto border-r border-gray-200 transition-all ${selectedClient ? 'hidden md:block md:w-1/2 lg:w-7/12 xl:w-2/3' : 'w-full'}`}>
        <div className='p-6 md:p-8'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Global Inbox</h1>

          <div className='flex flex-col gap-3'>
            {sortedInbox.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`bg-white border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
                  selectedClient?.id === client.id ? 'border-blue-500 shadow-sm ring-1 ring-blue-500' : 'border-gray-200'
                }`}
              >
                <div className='flex items-center gap-4 min-w-0'>
                  {/* Initials Avatar */}
                  <div className='w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0'>
                    {client.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md font-medium uppercase tracking-wider truncate max-w-[120px] md:max-w-[200px]'>
                        {client.jobTitle}
                      </span>
                    </div>
                    <h3 className='font-bold text-gray-900 truncate'>{client.name}</h3>
                    <p className='text-xs text-gray-500 truncate'>
                      {client.email} &middot; last seen {client.lastSeen}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 shrink-0 pl-4'>
                  {/* Favorites */}
                  <div className='flex items-center gap-1.5 text-gray-600'>
                    <svg className='w-5 h-5 text-yellow-400 fill-yellow-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'></path></svg>
                    <span className='font-medium text-sm'>{client.favorites}</span>
                  </div>
                  
                  {/* Unread & Indicator */}
                  <div className='flex items-center justify-end w-12'>
                    {client.unreadCount > 0 && (
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1.5 text-gray-600'>
                          <svg className='w-5 h-5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'></path></svg>
                          <span className='font-medium text-sm'>{client.unreadCount}</span>
                        </div>
                        <div className='w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 ml-1'></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right-Hand Drawer (Client Detail + Chat) */}
      {selectedClient && (
        <div className='w-full md:w-1/2 lg:w-5/12 xl:w-1/3 bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10'>
          {/* Drawer Header */}
          <div className='p-4 border-b border-gray-100 flex items-center justify-between bg-white'>
            <div className='flex items-center gap-3'>
              <button 
                onClick={() => setSelectedClient(null)}
                className='md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7'></path></svg>
              </button>
              <div>
                <h2 className='font-bold text-gray-900'>{selectedClient.name}</h2>
                <p className='text-xs text-gray-500'>{selectedClient.jobTitle}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedClient(null)}
              className='hidden md:block p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path></svg>
            </button>
          </div>

          {/* Favorited Talents Strip */}
          <div className='bg-gray-50/50 p-4 border-b border-gray-100'>
            <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Favorited Talents ({selectedClient.favorites})</h3>
            <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
              {MOCK_TALENTS.map(talent => (
                <div key={talent.id} className='relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-white'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={talent.imageUrl} alt={talent.name} className='object-cover w-full h-full' />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5'>
                    <span className='text-[8px] text-white font-medium truncate w-full'>{talent.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Feed */}
          <div className='flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-6'>
            {MOCK_CHAT.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'client' ? 'items-start' : 'items-end'}`}>
                {/* Linked Talent Anchor */}
                {msg.talent && (
                   <div className='flex items-center gap-2 mb-2 bg-white pr-3 pl-1 py-1 rounded-full border border-gray-200 shadow-sm'>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={msg.talent.imageUrl} alt={msg.talent.name} className='w-6 h-6 rounded-full object-cover' />
                     <span className='text-xs font-semibold text-gray-700'>{msg.talent.name}</span>
                   </div>
                )}
                
                {/* Message Bubble */}
                <div className='flex items-start gap-2 max-w-[85%]'>
                  {msg.sender === 'client' && (
                    <div className='w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1'>
                      {selectedClient.name[0]}
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                    msg.sender === 'client' 
                      ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
                <span className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'client' ? 'ml-9' : 'mr-1'}`}>
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className='p-4 bg-white border-t border-gray-100'>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if(messageText.trim()) setMessageText("");
              }} 
              className='flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'
            >
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Reply to ${selectedClient.name}...`}
                className='flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none resize-none min-h-[44px] max-h-[120px]'
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(messageText.trim()) setMessageText("");
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!messageText.trim()}
                className='w-9 h-9 mb-1 mr-1 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0'
              >
                <svg className='w-4 h-4 ml-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'></path></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
