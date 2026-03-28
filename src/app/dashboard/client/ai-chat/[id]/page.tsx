/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Heart, Calendar, Camera, Phone, Check } from "lucide-react";
import Image from "next/image";
import ChatModalDetail from "@/components/dashboard/chat/ChatModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { useAiChatCreateMutation } from "@/redux/features/ai-chat/aiChatAPI";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  avatar?: string;
  talents?: TalentProfile[];
}

interface TalentProfile {
  talent_id: number;
  images: string[];
  is_active: boolean;
  name: string;
  role: string;
  agent_name: string;
  date_of_birth: string;
  gender: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  location: string;
  continent: string;
  country: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";
// Max talent cards to show before the "+N more" overlay
const MAX_VISIBLE_TALENTS = 3;

export default function AIDynamicPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [aiChatCreateMutation] = useAiChatCreateMutation();
  const sessionId = useSelector((state: any) => state.aiChat.sessionId);
  // FIX 1: read the full slice so we can react to changes
  const resData = useSelector((state: any) => state.aiChat);
  const { user } = useAuth();

  console.log("resData", resData);
  console.log("messages", messages);

  // FIX 2: include resData in the dependency array so messages stay in sync
  useEffect(() => {
    if (resData?.messages) {
      setMessages(resData.messages);
    }
  }, [resData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenModal = (talent: TalentProfile) => {
    setSelectedTalent(talent);
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // FIX 3: use Date.now() for unique IDs instead of array-length-based IDs
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      setIsLoading(true);
      const res = await aiChatCreateMutation({
        session_id: sessionId,
        message: inputValue,
      }).unwrap();

      if (res?.session_id) {
        const aiMessage: Message = {
          id: Date.now() + 1, // FIX 3 continued
          type: "ai",
          content: res.conversation ?? "Here are the results I found.",
          avatar: "/man.png",
          talents: res.data?.talents ?? [],
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now() + 1, // FIX 3 continued
        type: "ai",
        content: "Something went wrong. Please try again.",
        avatar: "/man.png",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 180) + "px";
    }
  };

  return (
    <main className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Chat Messages Area */}
      <div className='bg-white flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-6xl mx-auto w-full rounded-2xl'>
        {messages?.length > 0 &&
          messages?.map((message) => (
            <div key={message.id} className='flex flex-col space-y-6'>
              {/* Message bubble */}
              {message.type === "user" ? (
                <div className='flex gap-3 justify-end items-start'>
                  <div className='bg-[#2563EB] text-white rounded-3xl px-4 py-3 max-w-xs sm:max-w-md text-sm sm:text-base shadow-sm'>
                    {message.content}
                  </div>
                  {/* FIX 4: null-guard on profile_pic; fallback to placeholder */}
                  <img
                    src={
                      user?.profile_pic
                        ? `${BASE_URL}${user.profile_pic}`
                        : "/placeholder.svg"
                    }
                    alt='User Avatar'
                    width={80}
                    height={80}
                    className='w-8 h-8 sm:w-8 sm:h-8 rounded-full shrink-0 object-cover'
                  />
                </div>
              ) : (
                <div className='flex gap-1.5 justify-start items-start'>
                  <div className=''>
                    <Image
                      src={"/ai.svg"}
                      alt='AI Avatar'
                      width={800}
                      height={800}
                      className='w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 object-cover'
                    />
                  </div>
                  <div className='text-gray-800 rounded-3xl px-4 py-3 max-w-xs sm:max-w-md text-sm sm:text-base whitespace-pre-line'>
                    {message.content}
                  </div>
                </div>
              )}

              {/* Talent Profiles Grid — only for AI messages with talents */}
              {message.type === "ai" &&
                message.talents &&
                message.talents.length > 0 && (
                  <div className='md:col-span-3'>
                    {/* FIX 5: slice to MAX_VISIBLE_TALENTS so extra cards are not rendered at all */}
                    <div className='grid grid-cols-2 gap-4'>
                      {message.talents
                        .slice(0, MAX_VISIBLE_TALENTS)
                        .map((profile, idx) => {
                          const imageUrl = profile.images?.[0]
                            ? `${BASE_URL}${profile.images[0]}`
                            : "/placeholder.svg";

                          // Show "+N" overlay only on the last VISIBLE card when there are hidden cards
                          const hiddenCount =
                            message.talents!.length - MAX_VISIBLE_TALENTS;
                          const isLastVisible =
                            idx === MAX_VISIBLE_TALENTS - 1 && hiddenCount > 0;

                          return (
                            <div
                              key={profile.talent_id}
                              className='space-y-3'
                              onClick={() => handleOpenModal(profile)}
                            >
                              {/* Profile Card */}
                              <div className='relative bg-[#404145] rounded-lg overflow-hidden group cursor-pointer'>
                                <Image
                                  src={imageUrl}
                                  alt={profile.name}
                                  width={600}
                                  height={600}
                                  unoptimized
                                  className='w-full h-120 object-cover'
                                />

                                {/* FIX 5 continued: overlay shows correct hidden count */}
                                {isLastVisible && (
                                  <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                                    <span className='text-white text-4xl font-bold'>
                                      +{hiddenCount}
                                    </span>
                                  </div>
                                )}

                                {/* Profile Details — visible on hover */}
                                <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white text-sm space-y-3'>
                                  <p className='font-semibold text-sm mb-1'>
                                    {profile.name}
                                  </p>
                                  <p>Height: {profile.height}</p>
                                  <p>Bust: {profile.bust}</p>
                                  <p>Waist: {profile.waist}</p>
                                  <p>Hips: {profile.hips}</p>
                                  <p>Shoe Size: {profile.shoe_size}</p>
                                  <p>Hair: {profile.hair_color}</p>
                                  <p>Eyes: {profile.eye_color}</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div
                                className='flex gap-2 sm:gap-3'
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                                  aria-label='Like'
                                  title='Like'
                                >
                                  <Heart size={20} fill='currentColor' />
                                </button>
                                <button
                                  className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                                  aria-label='Schedule'
                                  title='Schedule'
                                >
                                  <Calendar size={20} />
                                </button>
                                <button
                                  className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                                  aria-label='Photo'
                                  title='View Photos'
                                >
                                  <Camera size={20} />
                                </button>
                                <button
                                  className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                                  aria-label='Call'
                                  title='Contact'
                                >
                                  <Phone size={20} />
                                </button>
                                <button
                                  className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                                  aria-label='Approve'
                                  title='Approve'
                                >
                                  <Check size={20} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
            </div>
          ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className='flex gap-3 justify-start items-start'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 shrink-0' />
            <div className='bg-white border border-gray-200 rounded-3xl px-4 py-3 text-sm text-gray-500 shadow-sm'>
              <span className='animate-pulse'>Finding the best talent...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='bg-transparent sticky bottom-0 p-4 sm:p-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='relative w-full'>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
              // disabled={isLoading}
              className='
                w-full resize-none overflow-hidden
                bg-white border border-gray-300 rounded-3xl
                px-4 pr-16 py-4
                text-sm sm:text-base
                placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
              '
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className='
                absolute bottom-2 right-2
                w-12 h-12
                bg-[#2563EB] text-white
                rounded-full
                flex items-center justify-center
                hover:bg-[#2563EB] transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm
              '
              aria-label='Send message'
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='min-w-[55vw] bg-white max-w-6xl max-h-screen p-0 overflow-hidden'>
          {selectedTalent && <ChatModalDetail talent={selectedTalent} />}
        </DialogContent>
      </Dialog>
    </main>
  );
}
