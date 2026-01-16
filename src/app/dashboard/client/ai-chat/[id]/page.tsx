"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Heart, Calendar, Camera, Phone, Check } from "lucide-react";
import Image from "next/image";
import ChatModalDetail from "@/components/dashboard/chat/ChatModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  avatar?: string;
}

interface ContentItem {
  id: number;
  title: string;
  text: string;
  points: string[];
  profiles: TalentProfile[];
}

interface TalentProfile {
  id: number;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
  image: string;
  overlay?: string;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Finding the best talent from verified agencies...",
      avatar: "/man.png",
    },
    {
      id: 2,
      type: "ai",
      content: "Finding the best talent from verified agencies...",
      avatar: "/man.png",
    },
    {
      id: 3,
      type: "ai",
      content: "Finding the best talent from verified agencies...",
      avatar: "/man.png",
    },
  ]);

  const [inputValue, setInputValue] = useState(
    "I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const contentItems: ContentItem[] = [
    {
      id: 1,
      title: "Document Summary",
      text: 'The document is a Divorce Settlement Agreement template outlining the terms and conditions agreed upon by both parties (referred to as the "Husband" and "Wife"). The key sections of the agreement include:',
      points: [
        "Parties Involved: The agreement is between the Husband and the Wife, with spaces to fill in their names and addresses.",
        "Purpose: The agreement is intended to finalize the settlement of their rights and obligations concerning their divorce.",
      ],
      profiles: [
        {
          id: 1,
          height: "177 cm / 5'9\"",
          bust: '83 cm / 32.5"',
          waist: '63 cm / 25"',
          hips: '90 cm / 35.5"',
          shoeSize: "US 9 / UK# / EU 40",
          hairColor: "Light blond",
          eyeColor: "Brown",
          image: "/man.png",
        },
        {
          id: 2,
          height: "177 cm / 5'9\"",
          bust: '83 cm / 32.5"',
          waist: '63 cm / 25"',
          hips: '90 cm / 35.5"',
          shoeSize: "US 9 / UK# / EU 40",
          hairColor: "Light blond",
          eyeColor: "Brown",
          image: "/man.png",
          overlay: "+4",
        },
      ],
    },
    {
      id: 2,
      title: "Document Summary",
      text: 'The document is a Divorce Settlement Agreement template outlining the terms and conditions agreed upon by both parties (referred to as the "Husband" and "Wife"). The key sections of the agreement include:',
      points: [
        "Parties Involved: The agreement is between the Husband and the Wife, with spaces to fill in their names and addresses.",
        "Purpose: The agreement is intended to finalize the settlement of their rights and obligations concerning their divorce.",
      ],
      profiles: [],
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiMessage: Message = {
      id: messages.length + 2,
      type: "ai",
      content: "Finding the best talent from verified agencies...",
      avatar: "/user-avatar.jpg",
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 180) + "px"; // max height
    }
  };

  return (
    <main className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Chat Messages Area */}
      <div className='flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-6xl mx-auto w-full'>
        {messages.map((message, index) => (
          <div key={message.id} className='flex flex-col space-y-6'>
            {/* AI Message */}
            <div className='flex gap-3 justify-end items-start'>
              <div className='bg-blue-500 text-white rounded-3xl px-4 py-3 max-w-xs sm:max-w-md text-sm sm:text-base shadow-sm'>
                {message.content}
              </div>
              <Image
                src={message.avatar || "/placeholder.svg?height=40&width=40"}
                alt='AI Avatar'
                width={40}
                height={40}
                className='w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 object-cover'
              />
            </div>

            {/* Content Card and Profiles */}
            {index < contentItems.length && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Document Card - Left side */}
                <div className='md:col-span-2'>
                  <div className='bg-transparent rounded-lg p-4 sm:p-6 h-full'>
                    <div className='flex items-start gap-3 mb-4'>
                      <div className='text-blue-500 text-2xl shrink-0'>📋</div>
                      <div className='flex-1 text-sm text-gray-700 leading-relaxed'>
                        <p className='mb-3'>{contentItems[index].text}</p>
                        <ol className='space-y-2 list-decimal list-inside text-xs sm:text-sm'>
                          {contentItems[index].points.map((point, i) => (
                            <li key={i} className='text-[#404145]'>
                              {point}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Talent Profiles Grid - Right side */}
                {contentItems[index].profiles.length > 0 && (
                  <div className='md:col-span-3'>
                    <div className='grid grid-cols-2 gap-4'>
                      {contentItems[index].profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className='space-y-3'
                          onClick={() => setIsOpen(true)}
                        >
                          {/* Profile Card */}
                          <div className='relative bg-[#404145] rounded-lg overflow-hidden aspect2/3 group cursor-pointer'>
                            <Image
                              src={profile.image || "/placeholder.svg"}
                              alt='Profile'
                              width={600}
                              height={600}
                              className='w-full h-120 object-cover'
                            />

                            {profile.overlay && (
                              <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                                <span className='text-white text-4xl font-bold'>
                                  {profile.overlay}
                                </span>
                              </div>
                            )}

                            {/* Profile Details - Show on hover */}
                            <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent temp-disable:opacity-0 group-hover: opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white text-xs'>
                              <p className='font-semibold text-sm mb-1'>
                                Model Profile
                              </p>
                              <p>Height: {profile.height}</p>
                              <p>Bust: {profile.bust}</p>
                              <p>Waist: {profile.waist}</p>
                              <p>Hips: {profile.hips}</p>
                              <p>Shoe Size: {profile.shoeSize}</p>
                              <p>Hair: {profile.hairColor}</p>
                              <p>Eyes: {profile.eyeColor}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex gap-2 sm:gap-3'>
                            <button
                              className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 border border-transparent hover:border-blue-300'
                              aria-label='Like'
                              title='Like'
                            >
                              <Heart size={20} fill='currentColor' />
                            </button>
                            10
                            <button
                              className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 border border-transparent hover:border-blue-300'
                              aria-label='Schedule'
                              title='Schedule'
                            >
                              <Calendar size={20} />
                            </button>
                            <button
                              className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 border border-transparent hover:border-blue-300'
                              aria-label='Photo'
                              title='View Photos'
                            >
                              <Camera size={20} />
                            </button>
                            <button
                              className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 border border-transparent hover:border-blue-300'
                              aria-label='Call'
                              title='Contact'
                            >
                              <Phone size={20} />
                            </button>
                            <button
                              className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-500 border border-transparent hover:border-blue-300'
                              aria-label='Approve'
                              title='Approve'
                            >
                              <Check size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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
              disabled={isLoading}
              className='
          w-full resize-none overflow-hidden
          bg-white border border-gray-300 rounded-3xl
          px-4 pr-16 py-4
          text-sm sm:text-base
          placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        '
            />

            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className='
          absolute bottom-2 right-2
          w-12 h-12
          bg-blue-500 text-white
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
          <ChatModalDetail />
        </DialogContent>
      </Dialog>
    </main>
  );
}
