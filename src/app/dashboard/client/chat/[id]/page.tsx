"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { 
  useGetChatCommentInfoQuery, 
  useGetCommentAndActivitiesMutation 
} from "@/redux/features/client/chatCommentAPI";
import { ClientChatProvider, useClientChat } from "@/provider/ClientChatProvider";
import { Eye, CheckCircle2, Send, MessageCircle, Heart, Clock, ArrowLeft } from "lucide-react";

// --- Types ---
interface Guest {
  id: number;
  name: string;
  email: string;
  created_at: string;
  last_seen_at: string;
  favorite_count: number;
  comment_count: number;
  unread_count: number;
  thread_id: number;
}

// --- Main Page Component ---
export default function AgentChatDashboard() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter()
  
  const { data: guestsData, isLoading: guestsLoading, refetch: refetchGuests } = useGetChatCommentInfoQuery({ jobId }, { skip: !jobId, pollingInterval: 10000 });
  const guests: Guest[] = guestsData?.data || [];
  
  const [selectedClient, setSelectedClient] = useState<Guest | null>(null);

  // Sort by unread first, then by latest created_at
  const sortedGuests = [...guests].sort((a, b) => {
    if (b.unread_count !== a.unread_count) {
      return b.unread_count - a.unread_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className='flex h-[78vh] bg-gray-50'>
      {/* Main Inbox List */}
      <div className={`overflow-y-auto border-r border-gray-200 transition-all ${selectedClient ? 'hidden md:block w-1/3 lg:w-1/4 shrink-0' : 'w-full flex-1'}`}>
        <div className='p-6 md:p-8'>
          <div className='flex items-center gap-2 mb-6'>
            <button
              onClick={()=> router.back()}
              className='text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100'
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className='text-2xl font-bold text-gray-900'>Quick Chat</h1>
          </div>

          {guestsLoading ? (
            <div className="flex items-center justify-center h-40">
               <span className="text-sm text-gray-500">Loading guests...</span>
            </div>
          ) : sortedGuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
               <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
               <h3 className="text-lg font-semibold text-gray-700">No Guests Yet</h3>
               <p className="text-sm text-gray-500 max-w-sm mt-1">When guests view your shortlist and interact, their chats and activity will appear here.</p>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              {sortedGuests.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`bg-white border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
                    selectedClient?.id === client.id ? 'border-blue-500 shadow-sm ring-1 ring-blue-500' : 'border-gray-200'
                  }`}
                >
                  <div className='flex items-center gap-4 min-w-0'>
                    {/* Initials Avatar */}
                    <div className='w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 uppercase'>
                      {client.name.substring(0, 2)}
                    </div>
                    
                    <div className='min-w-0'>
                      <h3 className='font-bold text-gray-900 truncate'>{client.name}</h3>
                      <p className='text-xs text-gray-500 truncate'>
                        {client.email || "Guest"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-medium">
                        <Clock size={12} />
                        <span>Active {new Date(client.last_seen_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-2 shrink-0 pl-4'>
                    <div className='flex items-center gap-4'>
                      {/* Comments count */}
                      <div className='flex items-center gap-1.5 text-gray-500' title="Comments">
                        <MessageCircle className='w-4 h-4' />
                        <span className='font-medium text-xs'>{client.comment_count}</span>
                      </div>
                      {/* Favorites */}
                      <div className='flex items-center gap-1.5 text-gray-500' title="Favorites">
                        <Heart className='w-4 h-4 text-yellow-500 fill-yellow-500' />
                        <span className='font-medium text-xs'>{client.favorite_count}</span>
                      </div>
                    </div>
                    
                    {/* Unread & Indicator */}
                    <div className='flex items-center justify-end w-12'>
                      {client.unread_count > 0 && (
                        <div className='flex items-center gap-2'>
                          <span className='font-bold text-xs text-blue-600'>{client.unread_count} new</span>
                          <div className='w-2 h-2 bg-blue-600 rounded-full shrink-0'></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right-Hand Drawer (Client Detail + Chat) */}
      {selectedClient && (
        <ClientChatProvider>
           <ChatAndActivityView 
             guest={selectedClient} 
             jobId={jobId} 
             onClose={() => setSelectedClient(null)} 
             refetchGuests={refetchGuests}
           />
        </ClientChatProvider>
      )}
    </div>
  );
}

// --- Chat & Activity Sub-Component ---
function ChatAndActivityView({ guest, jobId, onClose, refetchGuests }: { guest: Guest, jobId: string, onClose: () => void, refetchGuests: () => void }) {
  const { connect, messages, sendMessage, isAuthenticated, markSeen } = useClientChat();
  const [getActivities, { data: activityData, isLoading: isActivityLoading }] = useGetCommentAndActivitiesMutation();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "activity">("chat");

  const [showChatPane, setShowChatPane] = useState(true);
  const [showActivityPane, setShowActivityPane] = useState(true);

  // If both panes are closed by the user, close the entire view
  useEffect(() => {
    if (!showChatPane && !showActivityPane) {
      onClose();
    }
  }, [showChatPane, showActivityPane, onClose]);

  // Fetch comments & activity
  useEffect(() => {
    if (guest.id && jobId) {
      getActivities({ jobId, guistId: guest.id });
    }
  }, [guest.id, jobId, getActivities]);

  // Connect to WebSocket chat
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && guest.thread_id) {
       connect(guest.thread_id.toString(), token, false); // isGuest = false because we are the agent
    }
  }, [guest.thread_id, connect]);

  // Mark seen when chat is open and authenticated
  useEffect(() => {
    if (isAuthenticated) {
      markSeen();
      // Refetch the global guests list so the left-pane 'unread' badge disappears immediately
      refetchGuests();
    }
  }, [isAuthenticated, messages.length, markSeen, refetchGuests]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
       setTimeout(() => {
         if (chatContainerRef.current) {
           chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
         }
       }, 50);
    }
  }, [messages.length, activeTab]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage({ action: "send_message", text: message.trim() });
      setMessage("");
    }
  };

  const activities = activityData?.data?.activity || [];
  
  // Combine optimistic and server messages for agent
  const displayMessages = messages;

  return (
    <div className='flex-1 h-full bg-white flex flex-col md:flex-row shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden min-h-0 min-w-0'>
      {/* Mobile Drawer Header */}
      <div className='md:hidden pt-4 px-4 border-b border-gray-100 flex flex-col bg-white shrink-0 w-full'>
        <div className='flex items-center justify-between pb-4'>
          <div className='flex items-center gap-3'>
            <button 
              onClick={onClose}
              className='p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7'></path></svg>
            </button>
            <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase'>
              {guest.name.substring(0, 2)}
            </div>
            <div>
              <h2 className='font-bold text-gray-900'>{guest.name}</h2>
            </div>
          </div>
        </div>
        
        {/* Mobile Tabs */}
        {(activities.length > 0 || isActivityLoading) && (
          <div className="flex items-center w-full mt-1">
            <button 
              onClick={() => setActiveTab("chat")} 
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "chat" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Live Chat
            </button>
            <button 
              onClick={() => setActiveTab("activity")} 
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "activity" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Activity & Comments
            </button>
          </div>
        )}
      </div>

      {/* Column 1 (Now Chat Feed) */}
      {showChatPane && (
        <div className={`h-full bg-gray-50 overflow-hidden flex-col ${(!showActivityPane || (activities.length === 0 && !isActivityLoading)) ? 'w-full flex-1 flex' : 'w-full md:w-1/2 lg:w-7/12 md:flex-1'} ${activeTab === 'chat' ? 'flex flex-1' : 'hidden md:flex'}`}>
          <div className='hidden md:flex p-4 border-b border-gray-200 shrink-0 bg-white items-center justify-between'>
            <div className='flex items-center gap-3'>
               {(!showActivityPane || (activities.length === 0 && !isActivityLoading)) && (
                  <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase'>
                    {guest.name.substring(0, 2)}
                  </div>
               )}
               <div>
                 <h2 className='font-bold text-gray-900'>{(!showActivityPane || (activities.length === 0 && !isActivityLoading)) ? guest.name : "Live Chat"}</h2>
                 <p className='text-xs text-gray-500'>
                   {isAuthenticated ? (
                     <span className="text-green-500 font-medium flex items-center gap-1">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Connected
                     </span>
                   ) : "Connecting..."}
                 </p>
               </div>
            </div>
            
            <button 
              onClick={() => setShowChatPane(false)}
              className='p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
              title="Close Chat"
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path></svg>
            </button>
          </div>
          
          <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 flex flex-col gap-4'>
            <div className="text-center my-2">
               <span className="bg-gray-200/60 text-gray-500 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                 Chat History
               </span>
            </div>
            {displayMessages.map((msg: any, i: number) => {
              const isMe = msg.sender === "agent" || msg.sender_type === "agent";
              
              return (
                <div key={i} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {isMe && (
                    <div className="h-8 flex items-center shrink-0">
                      {msg.is_seen_by_client ? (
                        <span title="Seen" className="text-blue-500">
                          <Eye size={14}  />
                        </span>
                      ) : (
                        <span title="Sent" className="text-gray-400">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl shadow-sm text-sm border max-w-[75%] ${
                    isMe 
                      ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                      : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                  }`}>
                    <span className="break-words">{msg.text || msg.content}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className='p-4 bg-white border-t border-gray-100 shrink-0'>
            <div className='flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Reply to ${guest.name}...`}
                className='flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none resize-none min-h-[40px] max-h-[120px]'
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim() || !isAuthenticated}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  message.trim() && isAuthenticated 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className='w-4 h-4 ml-0.5' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column 2 (Now Comments & Activity Feed) */}
      {(activities.length > 0 || isActivityLoading) && showActivityPane && (
        <div className={`h-full w-full ${!showChatPane ? 'md:w-full flex-1 flex' : 'md:w-1/2 lg:w-5/12 hidden md:flex md:shrink-0'} border-l border-gray-200 bg-gray-50/30 overflow-hidden flex-col ${activeTab === 'activity' ? 'flex flex-1' : ''}`}>
          <div className='hidden md:flex p-4 border-b border-gray-200 shrink-0 bg-white items-center justify-between'>
            <div className='flex items-center gap-3'>
              {(!showChatPane) && (
                <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase'>
                  {guest.name.substring(0, 2)}
                </div>
              )}
              <div>
                <h2 className='font-bold text-gray-900'>{(!showChatPane) ? guest.name : "Guest Activity"}</h2>
                <p className='text-xs text-gray-500'>{(!showChatPane) ? "Guest Activity" : "Activity & Comments"}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowActivityPane(false)}
              className='p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
              title="Close Activity"
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path></svg>
            </button>
          </div>

          <div className='flex-1 overflow-y-auto p-4 min-h-0'>
            <h3 className='hidden md:flex text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 items-center gap-1.5'>
              <Heart size={12} /> Activity & Comments
            </h3>
            <div className='flex flex-col gap-3'>
              {isActivityLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-2 bg-gray-200 rounded w-1/3" />
                      </div>
                      <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0" />
                    </div>
                    <div className="mt-2 space-y-2 border-t border-gray-50 pt-2">
                      <div className="h-10 bg-gray-100 rounded-lg w-full" />
                    </div>
                  </div>
                ))
              ) : (
                activities.map((act: any, idx: number) => (
                  <div key={idx} className='bg-white p-3 rounded-xl border border-gray-100 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                       <Image width={40} height={40} src={act.talent.image} alt={act.talent.name} className='w-10 h-10 rounded-full object-cover border' />
                       <div>
                         <h4 className='font-semibold text-sm text-gray-800'>{act.talent.name}</h4>
                         <p className='text-[10px] text-gray-500 uppercase tracking-wide'>{act.talent.role} &middot; {act.talent.location}</p>
                       </div>
                       {act.is_favorited && <Heart className='w-4 h-4 ml-auto text-red-500 fill-red-500' />}
                    </div>
                    {act.comments?.length > 0 && (
                      <div className='mt-2 space-y-2 border-t border-gray-50 pt-2'>
                        {act.comments.map((c: any) => (
                           <div key={c.id} className='bg-blue-50/50 p-2.5 rounded-lg text-xs text-gray-700 border border-blue-100/50 flex gap-2'>
                             <MessageCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                             <span className="leading-relaxed">{c.comment}</span>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
