/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Heart,
  Calendar,
  Camera,
  Phone,
  Check,
  Sparkles,
  ScanFace,
} from "lucide-react";
import Image from "next/image";
import ChatModalDetail from "@/components/dashboard/chat/ChatModal";
import { useDispatch, useSelector } from "react-redux";
import {
  useAiChatCreateMutation,
  useBookTalentMutation,
  useECastingRequestMutation,
  useGenerateJobFromMessageMutation,
  useGetChatBySessionIdQuery,
  usePolasRequestMutation,
  useSelfTapRequestMutation,
  useShortlistTalentMutation,
} from "@/redux/features/ai-chat/aiChatAPI";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addTalentsToModal } from "@/redux/features/ai-chat/aiChatSlice";
import { ChatSkeleton } from "@/components/loading/ChatSkeleton";

interface Message {
  id: number;
  sender: "ai" | "user";
  content: string;
  avatar?: string;
  timestamp?: string;
  talents?: TalentProfile[];
  /** Whether to show the "Generate Casting" button for this message */
  showGenerateCasting?: boolean;
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
const MAX_VISIBLE_TALENTS = 3;

export default function AIDynamicPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const id = params.id;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(
    null,
  );
  const [jobSaving, setJobSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobModal, setJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [aiChatCreateMutation] = useAiChatCreateMutation();
  const sessionId = useSelector((state: any) => state.aiChat.sessionId);
  const { user } = useAuth();

  const [polasRequestMutation] = usePolasRequestMutation();
  const [selfTapRequestMutation] = useSelfTapRequestMutation();
  const [eCastingRequestMutation] = useECastingRequestMutation();
  const [shortlistTalentMutation] = useShortlistTalentMutation();
  const [bookTalentMutation] = useBookTalentMutation();
  const [generateJobFromMessageMutation] = useGenerateJobFromMessageMutation();
  const [generatingCastingLoading, setGeneratingCastingLoading] =
    useState(false);

  const {
    data,
    isLoading: isLoadingChat,
    refetch,
  } = useGetChatBySessionIdQuery(id);

  useEffect(() => {
    const rawMessages: any[] = data?.data?.messages ?? [];
    if (!rawMessages.length) return;

    // FIX 1: Sort messages by timestamp ascending — API returns them in mixed order
    const sorted = [...rawMessages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // FIX 2: Collect all talent lists keyed to the AI message that produced them.
    // Each AI message has its OWN saved_filters if it included a search result.
    // We must NOT assume only the last AI message has talents.
    const normalized: Message[] = sorted.map((msg: any, idx: number) => {
      const talentList: TalentProfile[] =
        msg.saved_filters?.suggested_talents_list ?? [];

      // Dispatch talents to redux if this message has them
      if (talentList.length > 0) {
        dispatch(addTalentsToModal(talentList));
      }

      return {
        id: idx,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        avatar: msg.sender === "ai" ? "/ai.svg" : undefined,
        // FIX 2 continued: talents belong to the message whose saved_filters contains them
        talents: talentList,
        // FIX 3: generate_job flag drives button visibility per-message
        showGenerateCasting: talentList.length > 0,
      };
    });

    setMessages(normalized);
  }, [data?.data?.messages, dispatch]);

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

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      setIsLoading(true);
      const res = await aiChatCreateMutation({
        session_id: sessionId ?? id,
        message: inputValue,
      }).unwrap();

      if (res?.session_id) {
        const talents: TalentProfile[] = res.data?.talents ?? [];
        const aiMessage: Message = {
          id: Date.now() + 1,
          sender: "ai",
          content: res.conversation ?? "Here are the results I found.",
          avatar: "/ai.svg",
          timestamp: new Date().toISOString(),
          talents,
          showGenerateCasting: talents.length > 0,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          content: "Something went wrong. Please try again.",
          avatar: "/ai.svg",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      refetch();
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

  const handlePolasRequest = async (talentId: number) => {
    try {
      const res = await polasRequestMutation({
        session_id: id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(
        error?.data?.status_message ?? "Failed to send polas request",
      );
    }
  };

  const handleTalentBooking = async (talentId: number) => {
    try {
      const res = await bookTalentMutation({
        session_id: id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message ?? "Failed to book talent");
    }
  };

  const handleECastingRequest = async (talentId: number) => {
    try {
      const res = await eCastingRequestMutation({
        session_id: id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(
        error?.data?.status_message ?? "Failed to send e-casting request",
      );
    }
  };

  const handleSelfTapRequest = async (talentId: number) => {
    try {
      const res = await selfTapRequestMutation({
        session_id: id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(
        error?.data?.status_message ?? "Failed to send selftape request",
      );
    }
  };

  const handleShortListTalent = async (talentId: number) => {
    try {
      const res = await shortlistTalentMutation({
        session_id: id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message ?? "Failed to shortlist talent");
    }
  };

  const runGenerateCasting = async () => {
    try {
      setGeneratingCastingLoading(true);
      const res = await generateJobFromMessageMutation({
        session_id: id,
        title: jobTitle,
        description: jobDescription,
        generate_job: true,
      }).unwrap();
      if (res?.status_message) {
        toast.success(res.status_message || "Job created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate casting.");
    } finally {
      setGeneratingCastingLoading(false);
    }
  };

  const handleJobSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) return;
    setJobSaving(true);
    try {
      setJobModal(false);
      await runGenerateCasting();
    } finally {
      setJobSaving(false);
    }
  };

  const handleGenerateCasting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSkipping && jobTitle === "" && jobDescription === "") {
      setJobModal(true);
      return;
    }
    setIsSkipping(false);
    await runGenerateCasting();
  };

  return (
    <main className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Chat Messages */}
      <div className='bg-white flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-6xl mx-auto w-full rounded-2xl'>
        {isLoadingChat ? (
          <ChatSkeleton />
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className='flex flex-col space-y-4'>
                {/* Message bubble */}
                {message.sender === "user" ? (
                  <div className='flex gap-3 justify-end items-start'>
                    <div className='bg-[#2563EB] text-white rounded-3xl px-4 py-2.5 max-w-xs sm:max-w-md text-sm sm:text-base shadow-sm whitespace-pre-line'>
                      {message.content}
                    </div>
                    <img
                      src={
                        user?.profile_pic
                          ? `${BASE_URL}${user.profile_pic}`
                          : "/placeholder.svg"
                      }
                      alt='User Avatar'
                      width={80}
                      height={80}
                      className='w-8 h-8 rounded-full shrink-0 object-cover'
                    />
                  </div>
                ) : (
                  <div className='flex gap-2 justify-start items-start'>
                    <Image
                      src='/ai.svg'
                      alt='AI Avatar'
                      width={40}
                      height={40}
                      className='w-9 h-9 rounded-full shrink-0 object-cover mt-0.5'
                    />
                    <div className='bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs sm:max-w-md text-sm sm:text-base whitespace-pre-line'>
                      {message.content}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                {message.timestamp && (
                  <p
                    className={`text-[10px] text-gray-400 px-1 ${message.sender === "user" ? "text-right pr-12" : "pl-11"}`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {/* Talent Grid — FIX: attached to each message individually */}
                {message.sender === "ai" &&
                  message.talents &&
                  message.talents.length > 0 && (
                    <div className='pl-11'>
                      <div className='grid grid-cols-2 lg:grid-cols-3 gap-3'>
                        {message.talents
                          .slice(0, MAX_VISIBLE_TALENTS)
                          .map((profile, idx) => {
                            const imageUrl = profile.images?.[0]
                              ? `${BASE_URL}${profile.images[0]}`
                              : "/placeholder.svg";

                            // FIX: correct hidden count overlay logic
                            const totalTalents = message.talents!.length;
                            const hiddenCount =
                              totalTalents - MAX_VISIBLE_TALENTS;
                            const isLastVisible =
                              idx === MAX_VISIBLE_TALENTS - 1 &&
                              hiddenCount > 0;

                            return (
                              <div
                                key={profile.talent_id}
                                className='space-y-2'
                                onClick={() => handleOpenModal(profile)}
                              >
                                {/* Card Image */}
                                <div className='relative bg-gray-800 rounded-xl overflow-hidden group cursor-pointer shadow-sm'>
                                  <Image
                                    src={imageUrl}
                                    alt={profile.name}
                                    width={600}
                                    height={600}
                                    unoptimized
                                    className='w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-105'
                                  />

                                  {/* +N overlay on last visible card */}
                                  {isLastVisible && (
                                    <div className='absolute inset-0 bg-black/65 flex items-center justify-center z-10'>
                                      <span className='text-white text-4xl font-semibold'>
                                        +{hiddenCount}
                                      </span>
                                    </div>
                                  )}

                                  {/* Active / available badges */}
                                  <div className='absolute top-2 left-2 flex gap-1.5 z-10'>
                                    {profile.is_active && (
                                      <span className='text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/80 text-white backdrop-blur-sm'>
                                        Active
                                      </span>
                                    )}
                                  </div>

                                  {/* Hover overlay with details */}
                                  <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white text-xs space-y-0.5 z-10'>
                                    <p className='font-semibold text-sm'>
                                      {profile.name}
                                    </p>
                                    <p>Height: {profile.height}</p>
                                    <p>
                                      Bust: {profile.bust} · Waist:{" "}
                                      {profile.waist} · Hips: {profile.hips}
                                    </p>
                                    <p>
                                      Hair: {profile.hair_color} · Eyes:{" "}
                                      {profile.eye_color}
                                    </p>
                                    <p className='text-gray-300'>
                                      Agent: {profile.agent_name}
                                    </p>
                                  </div>
                                </div>

                                {/* Name + meta below card */}
                                <div className='px-0.5'>
                                  <p className='font-medium text-sm text-gray-900 truncate'>
                                    {profile.name}
                                  </p>
                                  <p className='text-xs text-gray-500'>
                                    {profile.role} · {profile.skin_color} ·{" "}
                                    {profile.location}
                                  </p>
                                </div>

                                {/* Action Buttons */}
                                <div
                                  className='flex gap-1.5 flex-wrap'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() =>
                                      handleShortListTalent(profile.talent_id)
                                    }
                                    className='p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition-colors'
                                    title='Shortlist'
                                  >
                                    <Heart size={15} />
                                  </button>
                                  <button
                                    className='p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition-colors'
                                    title='Availability'
                                  >
                                    <Calendar size={15} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSelfTapRequest(profile.talent_id)
                                    }
                                    className='p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition-colors'
                                    title='Selftape Request'
                                  >
                                    <Camera size={15} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleECastingRequest(profile.talent_id)
                                    }
                                    className='p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition-colors'
                                    title='E-Casting Request'
                                  >
                                    <Phone size={15} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleTalentBooking(profile.talent_id)
                                    }
                                    className='p-2 rounded-full border border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-600 text-gray-500 transition-colors'
                                    title='Book Talent'
                                  >
                                    <Check size={15} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handlePolasRequest(profile.talent_id)
                                    }
                                    className='p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition-colors'
                                    title='Polas Request'
                                  >
                                    <ScanFace size={15} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* FIX: Generate Casting button scoped to each message that has talents */}
                      {message.showGenerateCasting && (
                        <button
                          onClick={handleGenerateCasting}
                          disabled={generatingCastingLoading}
                          className='mt-4 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-sm font-medium transition flex items-center gap-2'
                        >
                          <Sparkles className='w-4 h-4' />
                          {generatingCastingLoading
                            ? "Generating..."
                            : "Generate Casting"}
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className='flex gap-2 justify-start items-start'>
                <div className='w-9 h-9 rounded-full bg-gray-100 shrink-0' />
                <div className='bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-500'>
                  <span className='animate-pulse'>
                    Finding the best talent...
                  </span>
                </div>
              </div>
            )}
          </>
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
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
              className='w-full resize-none overflow-hidden bg-white border border-gray-300 rounded-3xl px-4 pr-16 py-4 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className='absolute bottom-2 right-2 w-12 h-12 bg-[#2563EB] text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm'
              aria-label='Send message'
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Talent detail modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='min-w-[55vw] bg-white max-w-6xl max-h-screen p-0 overflow-hidden'>
          {selectedTalent && <ChatModalDetail />}
        </DialogContent>
      </Dialog>

      {/* Generate Casting — job info modal */}
      <Dialog
        open={jobModal}
        onOpenChange={(open) => {
          if (!open) setIsSkipping(false);
          setJobModal(open);
        }}
      >
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Add Job Info</DialogTitle>
            <DialogDescription>
              Enter the job title and description, then click Save to continue.
            </DialogDescription>
          </DialogHeader>

          <form className='space-y-4' onSubmit={handleJobSave}>
            <FieldGroup>
              <Field>
                <Label htmlFor='title' className='text-sm font-semibold'>
                  Job Title
                </Label>
                <Input
                  id='title'
                  name='title'
                  placeholder='e.g. Senior Fashion Model'
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className='h-11 border border-gray-300'
                />
              </Field>

              <Field>
                <Label
                  htmlFor='job-description'
                  className='text-sm font-semibold'
                >
                  Job Description
                </Label>
                <Textarea
                  id='job-description'
                  name='description'
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder='Describe the job requirements, expectations, and any relevant details...'
                  required
                  className='min-h-32 border border-gray-300 resize-none'
                />
              </Field>
            </FieldGroup>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                className='mr-auto'
                onClick={() => {
                  setIsSkipping(true);
                  setJobModal(false);
                  runGenerateCasting();
                }}
              >
                Skip
              </Button>
              <DialogClose asChild>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setJobTitle("");
                    setJobDescription("");
                    setIsSkipping(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type='submit' disabled={jobSaving || !jobTitle}>
                {jobSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}