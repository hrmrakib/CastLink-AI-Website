import MessagingPage from "@/components/dashboard/messages/page";

const ClientMessagePage = () => {
  return (
    <div>
      <MessagingPage />
    </div>
  );
};

export default ClientMessagePage;

// /* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable @next/next/no-img-element */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { SearchIcon, SendIcon, PlusIcon, Loader2 } from "lucide-react";
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
//   message_type: "text" | "image" | "video" | "file"; // extend as needed
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
//   const [msgPage, setMsgPage] = useState(1);
//   const [msgLimit, setMsgLimit] = useState(100);
//   const { socket, connect } = useSocket();
//   const { user } = useAuth();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [fileUploadWithMessageMutation, { isLoading: isUploadingWithMessage }] =
//     useFileUploadWithMessageMutation();

//   const {
//     data: messagesData,
//     isFetching: messagesFetching,
//     refetch: refetchMessages,
//   } = useGetMessagesQuery({
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
//     // messagesData is the array directly, not messagesData.data
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
//         return [...newOnes, ...(prev ?? [])]; // older on top, newer at bottom
//       });
//     }
//   }, [messagesData, selectedConversation?.conversation_id]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

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

//     // ── File upload path ───────────────────────────────────────────────────────
//     if (hasFiles) {
//       for (const file of selectedFiles) {
//         const isImage = file.type.startsWith("image/");

//         // Upload via REST API
//         const formData = new FormData();
//         formData.append("message_type", isImage ? "image" : "file");
//         formData.append("text", hasText ? newMessage : "Here is the file");
//         formData.append("attachment", file);

//         const res = await fileUploadWithMessageMutation({
//           conversationId,
//           body: formData,
//         }).unwrap();

//         console.log(res);

//         if (res?.status) {
//           refetchMessages();
//           toast.success("Message sent successfully!");
//         }
//       }

//       setSelectedFiles([]);
//       setNewMessage("");
//       return; // don't also emit socket for file messages
//     }

//     // ── Text-only path via WebSocket ───────────────────────────────────────────
//     if (!socket) return;

//     // Optimistic message for text
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

//     // Emit via WebSocket — matches your backend format from Image 1
//     socket?.send(
//       JSON.stringify({
//         action: "send_message",
//         text: newMessage,
//       }),
//     );

//     setNewMessage("");
//   };

//   const handleSelectConversation = (conversation: TConversation) => {
//     setSelectedConversation(conversation);
//     // Clear unread count
//     const updated = { ...conversation, unread: 0 };
//     setSelectedConversation(updated);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length) {
//       setSelectedFiles((prev) => [...prev, ...files]);
//     }
//     // Reset input so same file can be re-selected
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

//   return (
//     <div className='h-[80vh] bg-background flex flex-col lg:flex-row overflow-hidden'>
//       {/* Sidebar - Conversations List */}
//       <div className='w-full lg:w-96 border-r border-border flex flex-col bg-background'>
//         {/* Search */}
//         <div className='p-4 border-b border-border'>
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
//         <div className='flex border-b border-border px-4'>
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
//               {myConversations?.map((conversation: TConversation) => (
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
//                     {/* Avatar */}
//                     <div className='relative shrink-0'>
//                       <img
//                         src={getImageUrl(conversation.other_user_profile_pic)}
//                         alt={conversation?.other_user_name || "avatar"}
//                         width={48}
//                         height={48}
//                         className='h-12 w-12 rounded-full object-cover'
//                       />
//                       {true && (
//                         <div className='absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background'></div>
//                       )}
//                     </div>

//                     {/* Conversation Info */}
//                     <div className='flex-1 min-w-0'>
//                       <div className='flex items-center justify-between gap-2'>
//                         <h3 className='font-semibold text-foreground text-sm'>
//                           {conversation.other_user_name}
//                         </h3>
//                         <span className='text-xs text-muted-foreground shrink-0'>
//                           {new Date(conversation.updated_at).toLocaleTimeString(
//                             [],
//                             {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             },
//                           )}
//                         </span>
//                       </div>

//                       <p className='text-xs text-muted-foreground shrink-0'>
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

//                     {/* Unread Badge */}
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

//       {/* Chat Area */}
//       <div className='hidden lg:flex flex-1 flex-col bg-muted/30'>
//         {selectedConversation ? (
//           <>
//             {/* Chat Header */}
//             <div className='border-b border-border bg-background p-4 flex items-center justify-between'>
//               <div className='flex items-center gap-3'>
//                 <div className='relative'>
//                   <img
//                     src={getImageUrl(
//                       selectedConversation.other_user_profile_pic,
//                     )}
//                     alt={selectedConversation.other_user_name || "avatar"}
//                     width={40}
//                     height={40}
//                     className='h-10 w-10 rounded-full object-cover'
//                   />
//                   <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-background' />
//                 </div>
//                 <div>
//                   <h2 className='font-semibold text-foreground'>
//                     {selectedConversation.other_user_name}
//                   </h2>
//                   <p className='text-xs text-muted-foreground'>
//                     {selectedConversation.other_user_email}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className='flex-1 overflow-y-auto p-6 space-y-4'>
//               {messages?.map((message) => {
//                 const isSent = message.sender === user?.user_id;
//                 const isImage = message.message_type === "image";
//                 const isFile = message.message_type === "file";
//                 const attachmentUrl = message.attachment_url
//                   ? getImageUrl(message.attachment_url)
//                   : null;

//                 return (
//                   <div
//                     key={message.message_id}
//                     className={`flex ${isSent ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`flex ${isImage ? "flex-col" : "items-center"} gap-1 max-w-xs rounded-lg overflow-hidden ${
//                         isSent
//                           ? "bg-[#2563EB] text-white rounded-br-none"
//                           : "bg-background text-foreground border border-border rounded-bl-none"
//                       }`}
//                     >
//                       {/* Image attachment */}
//                       {isImage && attachmentUrl && (
//                         <a
//                           href={attachmentUrl}
//                           target='_blank'
//                           rel='noopener noreferrer'
//                         >
//                           <img
//                             src={attachmentUrl}
//                             alt='attachment'
//                             className='w-full max-w-xs object-cover rounded-t-lg'
//                           />
//                         </a>
//                       )}

//                       {/* File attachment */}
//                       {isFile && attachmentUrl && (
//                         <a
//                           href={attachmentUrl}
//                           target='_blank'
//                           rel='noopener noreferrer'
//                           className={`flex items-center gap-2 px-4 py-3 ${
//                             isSent ? "hover:bg-blue-700" : "hover:bg-muted"
//                           } transition-colors`}
//                         >
//                           <div className='h-9 w-9 rounded bg-white/20 flex items-center justify-center shrink-0'>
//                             <span className='text-xs font-bold uppercase'>
//                               {message.attachment_url?.split(".").pop()}
//                             </span>
//                           </div>
//                           <p className='text-xs truncate'>
//                             {message.attachment_url?.split("/").pop()}
//                           </p>
//                         </a>
//                       )}

//                       {/* Text */}
//                       {message.text && (
//                         <div className='px-4 py-2'>
//                           <p className='text-sm'>{message.text}</p>
//                         </div>
//                       )}

//                       {/* Timestamp */}
//                       <div
//                         className={`px-2 pb-2 flex ${isSent ? "justify-end" : "justify-start"}`}
//                       >
//                         <p
//                           className={`text-xs ${
//                             isSent ? "text-blue-100" : "text-muted-foreground"
//                           }`}
//                         >
//                           {new Date(message.created_at).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                           {isSent && " ✓"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message Input */}
//             <div className='border-t border-border bg-background p-4'>
//               {/* File Previews */}
//               {selectedFiles.length > 0 && (
//                 <div className='flex flex-wrap gap-2 mb-3'>
//                   {selectedFiles.map((file, index) => {
//                     const isImage = file.type.startsWith("image/");
//                     const previewUrl = isImage
//                       ? URL.createObjectURL(file)
//                       : null;
//                     return (
//                       <div
//                         key={index}
//                         className='relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-7 max-w-40'
//                       >
//                         {isImage && previewUrl ? (
//                           <img
//                             src={previewUrl}
//                             alt={file.name}
//                             className='h-10 w-10 rounded object-cover shrink-0'
//                           />
//                         ) : (
//                           <div className='h-10 w-10 rounded bg-blue-100 flex items-center justify-center shrink-0'>
//                             <span className='text-xs text-blue-600 font-bold uppercase'>
//                               {file.name.split(".").pop()}
//                             </span>
//                           </div>
//                         )}
//                         <p className='text-xs text-muted-foreground truncate'>
//                           {file.name}
//                         </p>
//                         <button
//                           onClick={() => removeFile(index)}
//                           className='absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:bg-red-600'
//                         >
//                           ×
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//               <div className='flex items-center gap-2'>
//                 <input
//                   type='file'
//                   ref={fileInputRef}
//                   className='hidden'
//                   accept='image/*,.pdf,.doc,.docx,.txt'
//                   multiple
//                   onChange={handleFileChange}
//                 />
//                 <Button
//                   variant='ghost'
//                   size='icon'
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <PlusIcon className='h-5 w-5' />
//                 </Button>
//                 <Input
//                   placeholder='Write your message...'
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && !e.shiftKey) {
//                       e.preventDefault();
//                       handleSendMessage();
//                     }
//                   }}
//                   className='rounded-lg'
//                 />
//                 <Button
//                   onClick={handleSendMessage}
//                   disabled={
//                     !newMessage ||
//                     !selectedConversation ||
//                     isUploadingWithMessage
//                   }
//                   className='bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg disabled:bg-[#2563EB] disabled:text-white disabled:cursor-not-allowed'
//                   size='icon'
//                 >
//                   <SendIcon className='h-5 w-5' />
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className='flex items-center justify-center h-full text-muted-foreground'>
//             <p>Select a conversation to start messaging</p>
//           </div>
//         )}
//       </div>

//       {/* Mobile Chat View */}
//       <div className='lg:hidden flex-1 flex flex-col'>
//         {selectedConversation ? (
//           <>
//             {/* Mobile Chat Header */}
//             <div className='border-b border-border bg-background p-4 flex items-center gap-3'>
//               <button
//                 onClick={() => setSelectedConversation(null)}
//                 className='text-blue-600 font-medium shrink-0'
//               >
//                 Back
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
//                 <h2 className='font-semibold text-foreground text-sm truncate'>
//                   {selectedConversation.other_user_name}
//                 </h2>
//                 <p className='text-xs text-muted-foreground truncate'>
//                   {selectedConversation.other_user_email}
//                 </p>
//               </div>
//             </div>

//             {/* Mobile Messages */}
//             <div className='flex-1 overflow-y-auto p-4 space-y-4'>
//               {messages?.map((message) => {
//                 const isSent = message.sender === user?.user_id;
//                 const isImage = message.message_type === "image";
//                 const isFile = message.message_type === "file";
//                 const attachmentUrl = message.attachment_url
//                   ? getImageUrl(message.attachment_url)
//                   : null;

//                 return (
//                   <div
//                     key={message.message_id}
//                     className={`flex ${isSent ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`flex flex-col gap-1 max-w-xs rounded-lg overflow-hidden ${
//                         isSent
//                           ? "bg-[#2563EB] text-white rounded-br-none"
//                           : "bg-background text-foreground border border-border rounded-bl-none"
//                       }`}
//                     >
//                       {isImage && attachmentUrl && (
//                         <a
//                           href={attachmentUrl}
//                           target='_blank'
//                           rel='noopener noreferrer'
//                         >
//                           <img
//                             src={attachmentUrl}
//                             alt='attachment'
//                             className='w-full max-w-xs object-cover rounded-t-lg'
//                           />
//                         </a>
//                       )}

//                       {isFile && attachmentUrl && (
//                         <a
//                           href={attachmentUrl}
//                           target='_blank'
//                           rel='noopener noreferrer'
//                           className={`flex items-center gap-2 px-4 py-3 ${
//                             isSent ? "hover:bg-blue-700" : "hover:bg-muted"
//                           } transition-colors`}
//                         >
//                           <div className='h-9 w-9 rounded bg-white/20 flex items-center justify-center shrink-0'>
//                             <span className='text-xs font-bold uppercase'>
//                               {message.attachment_url?.split(".").pop()}
//                             </span>
//                           </div>
//                           <p className='text-xs truncate'>
//                             {message.attachment_url?.split("/").pop()}
//                           </p>
//                         </a>
//                       )}

//                       {message.text && (
//                         <div className='px-4 py-2'>
//                           <p className='text-sm'>{message.text}</p>
//                         </div>
//                       )}

//                       <div
//                         className={`px-4 pb-2 flex ${isSent ? "justify-end" : "justify-start"}`}
//                       >
//                         <p
//                           className={`text-xs ${isSent ? "text-blue-100" : "text-muted-foreground"}`}
//                         >
//                           {new Date(message.created_at).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                           {isSent && " ✓"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Mobile Message Input */}
//             <div className='border-t border-border bg-background p-4'>
//               {selectedFiles.length > 0 && (
//                 <div className='flex flex-wrap gap-2 mb-3'>
//                   {selectedFiles.map((file, index) => {
//                     const isImage = file.type.startsWith("image/");
//                     const previewUrl = isImage
//                       ? URL.createObjectURL(file)
//                       : null;
//                     return (
//                       <div
//                         key={index}
//                         className='relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-7 max-w-40'
//                       >
//                         {isImage && previewUrl ? (
//                           <img
//                             src={previewUrl}
//                             alt={file.name}
//                             className='h-10 w-10 rounded object-cover shrink-0'
//                           />
//                         ) : (
//                           <div className='h-10 w-10 rounded bg-blue-100 flex items-center justify-center shrink-0'>
//                             <span className='text-xs text-blue-600 font-bold uppercase'>
//                               {file.name.split(".").pop()}
//                             </span>
//                           </div>
//                         )}
//                         <p className='text-xs text-muted-foreground truncate'>
//                           {file.name}
//                         </p>
//                         <button
//                           onClick={() => removeFile(index)}
//                           className='absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center hover:bg-red-600'
//                         >
//                           ×
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//               <div className='flex items-center gap-2'>
//                 <Button
//                   variant='ghost'
//                   size='icon'
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <PlusIcon className='h-5 w-5' />
//                 </Button>
//                 <Input
//                   placeholder='Write your message...'
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && !e.shiftKey) {
//                       e.preventDefault();
//                       handleSendMessage();
//                     }
//                   }}
//                   className='rounded-lg'
//                 />
//                 <Button
//                   onClick={handleSendMessage}
//                   className='bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg'
//                   size='icon'
//                 >
//                   <SendIcon className='h-5 w-5' />
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className='overflow-y-auto'>
//             {/* Mobile Sidebar */}
//             <div className='p-4 border-b border-border'>
//               <div className='relative'>
//                 <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
//                 <Input
//                   placeholder='Search messages or contacts...'
//                   className='pl-10 rounded-lg'
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className='flex border-b border-border px-4'>
//               {(["all", "unread", "read"] as const).map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveFilter(tab)}
//                   className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
//                     activeFilter === tab
//                       ? "border-blue-600 text-blue-600"
//                       : "border-transparent text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 </button>
//               ))}
//             </div>

//             {conversationsFetching ? (
//               <div className='flex items-center justify-center h-40'>
//                 <Loader2 className='h-8 w-8 animate-spin' />
//               </div>
//             ) : myConversations?.length > 0 ? (
//               <div className='divide-y divide-border'>
//                 {myConversations.map((conversation: TConversation) => (
//                   <div
//                     key={conversation.conversation_id}
//                     onClick={() => handleSelectConversation(conversation)}
//                     className='p-4 cursor-pointer transition-colors hover:bg-muted'
//                   >
//                     <div className='flex items-start gap-3'>
//                       <div className='relative shrink-0'>
//                         <img
//                           src={getImageUrl(conversation.other_user_profile_pic)}
//                           alt={conversation.other_user_name || "avatar"}
//                           width={48}
//                           height={48}
//                           className='h-12 w-12 rounded-full object-cover'
//                         />
//                         <div className='absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background' />
//                       </div>

//                       <div className='flex-1 min-w-0'>
//                         <div className='flex items-center justify-between gap-2'>
//                           <h3 className='font-semibold text-foreground text-sm truncate'>
//                             {conversation.other_user_name}
//                           </h3>
//                           <span className='text-xs text-muted-foreground shrink-0'>
//                             {new Date(
//                               conversation.updated_at,
//                             ).toLocaleTimeString([], {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </span>
//                         </div>

//                         <p className='text-xs text-muted-foreground'>
//                           {conversation.other_user_email}
//                         </p>

//                         <p className='text-xs text-muted-foreground mt-1 truncate'>
//                           {conversation.last_message?.message_type === "text"
//                             ? conversation.last_message?.text
//                             : conversation.last_message?.message_type ===
//                                 "image"
//                               ? "📷 Image"
//                               : conversation.last_message?.message_type ===
//                                   "file"
//                                 ? "📎 File"
//                                 : "No messages yet"}
//                         </p>
//                       </div>

//                       {conversation.unread_count > 0 && (
//                         <div className='bg-[#2563EB] text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center shrink-0'>
//                           {conversation.unread_count}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className='flex items-center justify-center h-40 text-muted-foreground'>
//                 <p>No conversations found</p>
//               </div>
//             )}
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
