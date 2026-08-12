/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Eye,
  CheckCircle2,
  Share2,
  Download,
  UserRoundPlus,
  Heart,
  Calendar,
  ArrowLeft,
  Star,
  MessageSquareText,
  Users,
  Briefcase,
  Layers,
  Link,
  Copy,
  Paperclip,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSingleShortlistJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import {
  useIdentifyGuestMutation,
  useVerifyGuestMutation,
  useCheckGuestSessionQuery,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetChatHistoryQuery,
} from "@/redux/features/client/guestChatAPI";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useClientChat,
  ClientChatProvider,
} from "@/provider/ClientChatProvider";
import { useDeleteSingleTalentFromShortlistMutation } from "@/redux/features/ai-chat/aiChatAPI";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAvailabilityDate } from "@/utils/formatAvailabilityDate";

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

// ── Types matching actual API shape ──────────────────────────────────────────

export interface TalentImage {
  image_id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface TalentInfo {
  talent_id: number;
  name: string;
  gender: string;
  role: string;
  character: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dress_size: string;
  shoe_size: string;
  hair_colour: string;
  eye_colour: string;
  skin_color: string;
  hair_type: string;
  continent: string;
  country: string;
  location: string;
  skills: string;
  portfolio_link?: string;
  is_available: boolean;
  available_dates: string[];
  images: TalentImage[];
}

export interface ShortlistedTalent {
  shortlisted_id: number;
  session_id: string;
  created_at: string;
  talent_info: TalentInfo;
}

export interface ShortlistJobDetail {
  job_id: string;
  title: string;
  description: string;
  casting_roles: string;
  location: string;
  budget_min: string;
  budget_max: string;
  job_type: string;
  status: string;
  applicants_count: number;
  shortlisted_count: number;
  selftapes_count: number;
  ecastings_count: number;
  polas_count: number;
  created_at: string;
  updated_at: string;
  shortlisted_talents: ShortlistedTalent[];
  job_roles?: {
    id: number;
    job_role: string;
    assign_status: boolean;
    talent_id: number | null;
  }[];
  created_by_name?: string;
  created_by_image?: string;
}

// ── Internal normalised UI shape ─────────────────────────────────────────────

interface Talent {
  id: string;
  talent_id: number;
  name: string;
  role: string;
  character: string;
  gender: string;
  location: string;
  country: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dress_size: string;
  shoe_size: string;
  hair_colour: string;
  eye_colour: string;
  skin_color: string;
  hair_type: string;
  skills: string;
  portfolio_link?: string;
  is_available: boolean;
  available_dates: string[];
  primaryImage: string;
  images: TalentImage[];
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPrimaryImage(images: TalentImage[]): string {
  if (!images || images.length === 0) return "";
  return (images.find((img) => img.is_primary) ?? images[0]).image;
}

function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url}`;
}

function normalise(raw: ShortlistedTalent): Talent {
  const ti = raw.talent_info;
  return {
    id: String(raw.shortlisted_id),
    talent_id: ti.talent_id,
    name: ti.name,
    role: ti.role,
    character: ti.character,
    gender: ti.gender,
    location: ti.location,
    country: ti.country,
    height: ti.height,
    waist: ti.waist,
    bust: ti.bust,
    hips: ti.hips,
    dress_size: ti.dress_size,
    shoe_size: ti.shoe_size,
    hair_colour: ti.hair_colour,
    eye_colour: ti.eye_colour,
    skin_color: ti.skin_color,
    hair_type: ti.hair_type,
    skills: ti.skills,
    portfolio_link: ti.portfolio_link,
    is_available: ti.is_available,
    available_dates: ti.available_dates ?? [],
    primaryImage: resolveImageUrl(getPrimaryImage(ti.images)),
    images: ti.images,
    created_at: raw.created_at,
  };
}

function groupByRole(
  talents: ShortlistedTalent[],
  jobRoles?: any[],
): Record<string, Talent[]> {
  const groups: Record<string, Talent[]> = {};

  if (!jobRoles || jobRoles.length === 0) {
    for (const raw of talents) {
      const t = normalise(raw);
      const key = (raw.talent_info.character ?? "other").trim().toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return groups;
  }

  const normalisedTalents = new Map(
    talents.map((t) => [t.talent_info.talent_id, normalise(t)]),
  );

  for (const jr of jobRoles) {
    if (!jr.job_role) continue;
    const roleName = jr.job_role.trim();
    if (!groups[roleName]) {
      groups[roleName] = [];
    }

    if (jr.talent_id && normalisedTalents.has(jr.talent_id)) {
      const talent = normalisedTalents.get(jr.talent_id)!;
      if (!groups[roleName].some((t) => t.talent_id === talent.talent_id)) {
        groups[roleName].push(talent);
      }
    }
  }

  const assignedTalentIds = new Set(
    jobRoles.map((jr) => jr.talent_id).filter((id) => id != null),
  );
  for (const t of talents) {
    if (!assignedTalentIds.has(t.talent_info.talent_id)) {
      if (!groups["Unassigned"]) groups["Unassigned"] = [];
      groups["Unassigned"].push(
        normalisedTalents.get(t.talent_info.talent_id)!,
      );
    }
  }

  return groups;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className='min-h-screen bg-gray-50/50 pb-24'>
      <div className='container mx-auto px-4 md:px-8 py-8 space-y-12 animate-pulse'>
        <div className='h-32 bg-gray-200 rounded-lg w-full mb-8'></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='aspect-4/3 bg-gray-200 rounded-lg'></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Identify Modal ────────────────────────────────────────────────────────────

function IdentifyModal({
  jobId,
  onSuccess,
}: {
  jobId: string;
  onSuccess: (token: string, threadId: string) => void;
}) {
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [identifyGuest, { isLoading: isIdentifying }] =
    useIdentifyGuestMutation();
  const [verifyGuest, { isLoading: isVerifying }] = useVerifyGuestMutation();

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await identifyGuest({ jobId, name, email }).unwrap();

      // Look for otp_required flag
      if (res?.data?.otp_required || res?.otp_required) {
        setStep("otp");
        toast.success(res?.message || "Verification code sent to your email.");
      } else {
        // Fallback in case backend just returns tokens immediately (legacy behavior)
        const token = res?.guest_token || res?.data?.guest_token;
        const threadId = res?.thread_id || res?.data?.thread_id;
        const guestClient = res?.guest_client || res?.data?.guest_client;

        if (token) {
          localStorage.setItem(`guest_token_${jobId}`, token);
          if (threadId) localStorage.setItem(`guest_thread_${jobId}`, threadId);
          if (guestClient)
            localStorage.setItem(
              `guest_client_${jobId}`,
              JSON.stringify(guestClient),
            );

          onSuccess(token, threadId || "");
          toast.success("Welcome!");
        } else {
          toast.error("Failed to receive session token.");
        }
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to identify. Please try again.",
      );
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyGuest({
        jobId,
        body: { email, otp, name }, // passing email, otp, and name
      }).unwrap();

      const token = res?.guest_token || res?.data?.guest_token;
      const threadId = res?.thread_id || res?.data?.thread_id;
      const guestClient = res?.guest_client || res?.data?.guest_client;

      if (token) {
        localStorage.setItem(`guest_token_${jobId}`, token);
        if (threadId) localStorage.setItem(`guest_thread_${jobId}`, threadId);
        if (guestClient)
          localStorage.setItem(
            `guest_client_${jobId}`,
            JSON.stringify(guestClient),
          );

        onSuccess(token, threadId || "");
        toast.success(res?.message || "Verified successfully!");
      } else {
        toast.error("Failed to receive session token.");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to verify code. Please try again.",
      );
    }
  };

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative'>
        {step === "otp" && (
          <button
            onClick={() => setStep("identity")}
            className='absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors'
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={step === "otp" ? "mt-4" : ""}>
          <h2 className='text-2xl font-bold mb-2'>
            {step === "identity" ? "Welcome!" : "Verify Your Email"}
          </h2>
          <p className='text-gray-500 mb-6'>
            {step === "identity"
              ? "Please enter your details to view and interact with this shortlist."
              : `We've sent a verification code to ${email}.`}
          </p>
        </div>

        {step === "identity" ? (
          <form onSubmit={handleIdentitySubmit} className='flex flex-col gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Full Name
              </label>
              <input
                required
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-2 border rounded-xl'
                placeholder='John Doe'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Email</label>
              <input
                required
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-2 border rounded-xl'
                placeholder='john@example.com'
              />
            </div>
            <button
              disabled={isIdentifying}
              type='submit'
              className='mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors'
            >
              {isIdentifying && (
                <svg
                  className='animate-spin h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
              )}
              {isIdentifying ? "Sending Code..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className='flex flex-col gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Verification Code
              </label>
              <input
                required
                type='text'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className='w-full px-4 py-2 border rounded-xl tracking-widest text-center text-lg font-mono'
                placeholder='000000'
                maxLength={6}
              />
            </div>
            <button
              disabled={isVerifying || otp.length < 4}
              type='submit'
              className='mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors'
            >
              {isVerifying && (
                <svg
                  className='animate-spin h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
              )}
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Chat Widget ──────────────────────────────────────────────────────────────

const ChatWidget = ({
  jobId,
  guestToken,
  guestThread,
  agentName,
  agentPhoto,
}: {
  jobId: string;
  guestToken: string;
  guestThread: string;
  agentName?: string;
  agentPhoto?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const {
    connect,
    sendMessage,
    isAuthenticated,
    messages,
    unreadCount,
    markSeen,
    socket,
  } = useClientChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: chatData } = useGetChatHistoryQuery(
    { jobId, token: guestToken },
    { skip: !guestToken || !isOpen || isAuthenticated }, // skip if authenticated via ws
  );

  const rawData = chatData?.data ?? chatData;
  const fallbackHistory = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.results)
      ? rawData.results
      : Array.isArray(rawData?.messages)
        ? rawData.messages
        : Array.isArray(rawData?.data?.messages)
          ? rawData.data.messages
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

  // Use WS messages if we have hydrated history, otherwise combine REST history with optimistic messages
  // We can assume we have hydrated history if isAuthenticated is true or if we received a fetch_chat event (which populates non-optimistic messages).
  const hasServerMessages = messages.some((m) => !m.isOptimistic);

  const displayMessages = hasServerMessages
    ? messages
    : [...fallbackHistory, ...messages.filter((m) => m.isOptimistic)];

  useEffect(() => {
    if (guestToken && guestThread) {
      // Connect as soon as we have tokens, don't wait for isOpen
      connect(guestThread, guestToken, true);
    }
  }, [guestToken, guestThread, connect]);

  useEffect(() => {
    if (isOpen) {
      markSeen();
      // Auto-scroll on open or new message (wait for DOM update)
      if (chatContainerRef.current) {
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [isOpen, markSeen, displayMessages.length]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage({ action: "send_message", text: message.trim() });
      setMessage("");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!guestToken) return;

    const isValidType = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isValidType) {
      toast.error("Only image and PDF files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("attachment", file);

    try {
      setIsUploading(true);
      const res = await fetch(`https://api.poolofcast.com/api/v1/client/talents/shortlisted/${jobId}/chat/upload/`, {
        method: "POST",
        headers: {
          "X-Guest-Token": guestToken
        },
        body: formData
      });
      if (res.ok) {
        // success, message broadcasted via WS
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {isOpen && (
        <div className='absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col mb-4 origin-bottom-right transition-all'>
          {/* Header */}
          <div className='bg-blue-600 text-white p-4 flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                {agentPhoto ? (
                  <img src={agentPhoto.startsWith('http') ? agentPhoto : `${BASE_URL}${agentPhoto}`} alt={agentName || 'Agent'} className='w-10 h-10 rounded-full object-cover shrink-0' />
                ) : (
                  <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold'>
                    {agentName ? agentName.charAt(0) : 'A'}
                  </div>
                )}
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
              </div>
              <div>
                <h3 className='font-semibold'>{agentName || 'Agent'}</h3>
                <p className='text-xs text-blue-100'>Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className='text-blue-100 hover:text-white transition-colors'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                ></path>
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className='h-80 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-4'
          >
            {displayMessages.length > 0 ? (
              displayMessages.map((msg: any, i: number) => {
                const isClient =
                  msg.sender === "client" || msg.sender_type === "client";
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${isClient ? "flex-row-reverse" : ""}`}
                  >
                    {isClient && (
                      <div className='h-8 flex items-center shrink-0'>
                        {msg.is_seen_by_agent ? (
                          <span title='Seen by agent'>
                            <Eye size={14} className='text-blue-500' />
                          </span>
                        ) : (
                          <span title='Not seen by agent'>
                            <CheckCircle2 size={14} className='text-gray-400' />
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl shadow-sm text-sm border ${
                        isClient
                          ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                          : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                      }`}
                    >
                      {msg.message_type === "file" || msg.attachment_url ? (
                        <div className="flex flex-col gap-2">
                          {(msg.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || msg.attachment_url?.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) ? (
                            <a href={msg.attachment_url.startsWith('http') ? msg.attachment_url : `${BASE_URL}${msg.attachment_url}`} target="_blank" rel="noopener noreferrer">
                              <img src={msg.attachment_url.startsWith('http') ? msg.attachment_url : `${BASE_URL}${msg.attachment_url}`} alt="attachment" className="max-w-full h-auto rounded-lg max-h-48 object-cover" />
                            </a>
                          ) : (msg.file_name?.match(/\.pdf$/i) || msg.attachment_url?.match(/\.pdf(\?.*)?$/i)) ? (
                            <a href={msg.attachment_url.startsWith('http') ? msg.attachment_url : `${BASE_URL}${msg.attachment_url}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 underline ${isClient ? 'text-blue-100' : 'text-blue-600'}`}>
                              📄 {msg.file_name || "PDF Document"}
                            </a>
                          ) : (
                            <a href={msg.attachment_url?.startsWith('http') ? msg.attachment_url : `${BASE_URL}${msg.attachment_url}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 underline ${isClient ? 'text-blue-100' : 'text-blue-600'}`}>
                              📎 {msg.file_name || "File Attachment"}
                            </a>
                          )}
                          {msg.text && <span className="break-words mt-1">{msg.text}</span>}
                        </div>
                      ) : (
                        <span className="break-words">{msg.text || msg.content}</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='flex items-start gap-2'>
                {agentPhoto ? (
                  <img src={agentPhoto.startsWith('http') ? agentPhoto : `${BASE_URL}${agentPhoto}`} alt={agentName || 'Agent'} className='w-8 h-8 rounded-full object-cover shrink-0' />
                ) : (
                  <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0'>
                    {agentName ? agentName.charAt(0) : 'A'}
                  </div>
                )}
                <div className='bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 border border-gray-100'>
                  Hi! Let me know if you have any questions about this
                  shortlist.
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className='p-3 bg-white border-t border-gray-100 flex items-center gap-2'>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className='w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100'
              title="Attach file"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className='w-5 h-5' />}
            </button>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Reply...'
              className='flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50'
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              disabled={(!message.trim() && !isUploading)}
              className='w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0'
              onClick={handleSend}
            >
              <svg
                className='w-4 h-4 ml-0.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-14 h-14 bg-blue-600 hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 rounded-full shadow-lg flex justify-center items-center text-white relative'
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          {isOpen ? (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M6 18L18 6M6 6l12 12'
            ></path>
          ) : (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            ></path>
          )}
        </svg>
        {!isOpen && unreadCount > 0 && (
          <span className='absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none pb-[1px] pr-[1px]'>
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

// ── Grid Model Card ─────────────────────────────────────────────────────────

function ModelCard({
  talent,
  onView,
  onDelete,
  jobId,
  guestToken,
}: {
  talent: Talent;
  onView: (talent: Talent) => void;
  onDelete: (talentId: string) => void;
  jobId: string;
  guestToken: string;
}) {
  const [showChat, setShowChat] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: favs } = useGetFavoritesQuery(
    { jobId, token: guestToken },
    { skip: !guestToken },
  );
  const [addFavorite, { isLoading: isAddingFavorite }] =
    useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemovingFavorite }] =
    useRemoveFavoriteMutation();

  const favList = favs?.data ?? favs ?? [];
  const serverFavorited = Array.isArray(favList)
    ? favList.some((f: any) => String(f.talent_id) === String(talent.talent_id))
    : false;

  const [localFav, setLocalFav] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`favs_${jobId}`) || "[]");
    if (stored.includes(talent.talent_id)) {
      setLocalFav(true);
    }
  }, [jobId, talent.talent_id]);

  const isFavorited = localFav !== null ? localFav : serverFavorited;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!guestToken) return;

    const stored = JSON.parse(localStorage.getItem(`favs_${jobId}`) || "[]");

    try {
      if (isFavorited) {
        setLocalFav(false);
        const updated = stored.filter((id: number) => id !== talent.talent_id);
        localStorage.setItem(`favs_${jobId}`, JSON.stringify(updated));

        await removeFavorite({
          jobId,
          token: guestToken,
          talent_id: talent.talent_id,
        }).unwrap();
        toast.success("Removed from favorites");
      } else {
        setLocalFav(true);
        if (!stored.includes(talent.talent_id)) stored.push(talent.talent_id);
        localStorage.setItem(`favs_${jobId}`, JSON.stringify(stored));

        await addFavorite({
          jobId,
          token: guestToken,
          talent_id: talent.talent_id,
        }).unwrap();
        toast.success("Added to favorites");
      }
    } catch (err) {
      setLocalFav(isFavorited); // Revert
      if (isFavorited) {
        if (!stored.includes(talent.talent_id)) stored.push(talent.talent_id);
        localStorage.setItem(`favs_${jobId}`, JSON.stringify(stored));
      } else {
        const updated = stored.filter((id: number) => id !== talent.talent_id);
        localStorage.setItem(`favs_${jobId}`, JSON.stringify(updated));
      }
      toast.error("Failed to update favorite");
    }
  };

  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetCommentsQuery(
      { jobId, token: guestToken, talent_id: talent.talent_id },
      { skip: !guestToken || !showChat },
    );
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();

  const comments = commentsData?.data ?? commentsData ?? [];

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && guestToken) {
      try {
        await addComment({
          jobId,
          token: guestToken,
          talent_id: talent.talent_id,
          comment: commentText.trim(),
        }).unwrap();
        setCommentText("");
        toast.success("Note added successfully");
      } catch (err) {
        toast.error("Failed to send note");
      }
    }
  };

  return (
    <div className='flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] group relative'>
      {/* Image & Stats Overlay */}
      <div
        className='relative aspect-[3/4] w-full sm:h-[420px] overflow-hidden cursor-pointer bg-gray-50'
        onClick={() => onView(talent)}
      >
        <Image
          src={talent.primaryImage || "/preview/1.jpg"}
          alt={talent.name}
          fill
          unoptimized
          className='object-cover w-full h-full transition-transform duration-700 group-hover:scale-110'
        />

        {/* Default View (Name only with slight gradient) */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none'>
          <h3 className='text-white font-bold text-xl tracking-wide drop-shadow-md truncate'>
            {talent.name}
          </h3>
        </div>

        {/* Hover Stats Overlay - Glassmorphism */}
        <div className='absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-y-4 group-hover:translate-y-0'>
          <h3 className='text-white font-bold text-2xl mb-4 pointer-events-auto truncate drop-shadow-lg'>
            {talent.name}
          </h3>
          <div className='flex flex-col gap-2.5 text-[13px] font-medium tracking-wide text-gray-100'>
            {[
              { label: "Height", value: talent.height },
              { label: "Bust", value: talent.bust },
              { label: "Waist", value: talent.waist },
              { label: "Hips", value: talent.hips },
              { label: "Dress", value: talent.dress_size },
              { label: "Shoe", value: talent.shoe_size },
              { label: "Hair", value: talent.hair_colour },
            ].map(
              (stat, i) =>
                stat.value && (
                  <div
                    key={i}
                    className='grid grid-cols-2 gap-4 text-left pointer-events-auto items-center'
                  >
                    <span className='opacity-70 text-xs uppercase tracking-widest'>
                      {stat.label}
                    </span>
                    <span className='text-white font-semibold truncate'>
                      {stat.value}
                    </span>
                  </div>
                ),
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className='flex justify-between items-center p-4 bg-white/95 backdrop-blur-md border-t border-gray-100/80 z-10'>
        <button
          onClick={toggleFavorite}
          disabled={isAddingFavorite || isRemovingFavorite}
          className='transition-all duration-300 disabled:opacity-50 hover:scale-110 active:scale-95'
          title={isFavorited ? "Unfavorite" : "Favorite"}
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-300 ${isFavorited ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "text-gray-300 hover:text-rose-400"}`}
          />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 shrink-0 ${
            showChat || comments.length > 0
              ? "bg-blue-50 text-blue-600 border border-blue-200/50 shadow-sm"
              : "bg-gray-50 text-gray-600 border border-gray-200/50 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <MessageSquareText
            size={16}
            className={
              showChat || comments.length > 0
                ? "text-blue-500"
                : "text-gray-400"
            }
          />
          {comments.length > 0 ? `${comments.length} comments` : "Comment"}
        </button>

        <button
          onClick={() => onView(talent)}
          className='text-gray-400 transition-all duration-300 hover:text-blue-600 hover:scale-110 active:scale-95'
          title='View Details'
        >
          <Eye className='w-6 h-6' />
        </button>
      </div>

      {/* Inline Thread Bubble */}
      {showChat && (
        <div className='bg-gray-50/80 p-3 border-t border-gray-100 flex flex-col gap-3'>
          {comments.length > 0 && (
            <div className='flex flex-col gap-2 max-h-40 overflow-y-auto pr-1'>
              {comments.map((comment: any, idx: number) => (
                <div
                  key={idx}
                  className='bg-white p-2.5 rounded-xl rounded-tr-none shadow-sm text-xs text-gray-700 border border-gray-100 self-end max-w-[90%]'
                >
                  {comment.comment ||
                    comment.text ||
                    comment.content ||
                    (typeof comment === "string" ? comment : "Empty note")}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className='flex items-end gap-2'>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder='Add a note...'
              className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none shadow-inner bg-white min-h-[40px]'
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit(e as any);
                }
              }}
            />
            <button
              type='submit'
              disabled={!commentText.trim() || isCommenting}
              className='bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shrink-0 flex items-center justify-center min-w-[32px]'
            >
              {isCommenting ? (
                <svg
                  className='animate-spin h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
              ) : (
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                  ></path>
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Page Header Component ───────────────────────────────────────────────────
const Header = ({
  jobTitle,
  totalCount,
  jobPhoto,
  clientPhoto,
}: {
  jobTitle: string;
  totalCount: number;
  jobPhoto?: string;
  clientPhoto?: string;
}) => (
  <header className='relative overflow-hidden flex flex-col md:flex-row justify-between items-center py-8 px-6 md:px-10 bg-transparent backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl mb-6'>
    <div className='flex flex-col items-center mb-4 md:mb-0'>
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100/50 flex items-center justify-center p-2'>
        <Image
          src={
            clientPhoto && clientPhoto.trim() !== ""
              ? clientPhoto
              : "/shortlist-logo.png"
          }
          alt='Client'
          width={80}
          height={80}
          className={`w-20 h-20 ${clientPhoto ? "object-cover rounded-xl" : "object-contain"}`}
          unoptimized
        />
      </div>
    </div>

    <div className='text-center md:flex-1'>
      <h1 className='text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-br from-gray-900 to-gray-600 tracking-tight'>
        {jobTitle}
      </h1>
      <div className='inline-flex items-center gap-2 mt-3 bg-blue-50/80 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100/50 shadow-sm'>
        <Star className='w-4 h-4' />
        {totalCount} talent{totalCount !== 1 ? "s" : ""} selected
      </div>
    </div>

    <div className='flex flex-col items-center mb-4 md:mb-0'>
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100/50 flex items-center justify-center p-2'>
        <Image
          src={jobPhoto && jobPhoto.trim() !== "" ? jobPhoto : "/job-logo.png"}
          alt='Job'
          width={80}
          height={80}
          className='object-cover w-20 h-20 rounded-xl'
          unoptimized
        />
      </div>
    </div>
  </header>
);

const getNumericRef = (id?: string) => {
  if (!id) return "Live Job";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `#ref-${Math.abs(hash % 9000) + 1000}`;
};

const CampaignStats = ({
  roleCount,
  modelCount,
  jobId,
}: {
  roleCount: number;
  modelCount: number;
  jobId?: string;
}) => (
  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
    {[
      {
        label: "Date",
        value: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        icon: Calendar,
        color: "text-blue-500",
        bg: "bg-blue-50",
      },
      {
        label: "Roles",
        value: roleCount,
        icon: Briefcase,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
      },
      {
        label: "Models",
        value: modelCount,
        icon: Users,
        color: "text-pink-500",
        bg: "bg-pink-50",
      },
      {
        label: "Reference",
        value: getNumericRef(jobId),
        icon: Star,
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
    ].map((stat, i) => (
      <div
        key={i}
        className='flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group'
      >
        <div
          className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
        >
          <stat.icon className='w-6 h-6' strokeWidth={1.5} />
        </div>
        <div>
          <p className='text-gray-400 text-xs font-medium uppercase tracking-wider'>
            {stat.label}
          </p>
          <p className='font-bold text-gray-900 text-lg mt-0.5'>{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────────

export default function ShortlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [guestToken, setGuestToken] = useState<string>("");
  const [guestThread, setGuestThread] = useState<string>("");
  const [showIdentify, setShowIdentify] = useState(false);

  useEffect(() => {
    // 1. Global cleanup: prevent localStorage bloat by purging ALL expired sessions
    const cleanupExpiredSessions = () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith("guest_client_")) {
          const jobId = key.replace("guest_client_", "");
          try {
            const clientStr = localStorage.getItem(key);
            if (clientStr) {
              const client = JSON.parse(clientStr);
              if (client.created_at) {
                const createdAtTime = new Date(client.created_at).getTime();
                if (now - createdAtTime > thirtyDaysMs) {
                  localStorage.removeItem(`guest_token_${jobId}`);
                  localStorage.removeItem(`guest_thread_${jobId}`);
                  localStorage.removeItem(`guest_client_${jobId}`);
                  localStorage.removeItem(`favs_${jobId}`);
                }
              }
            }
          } catch (e) {
            // Corrupted data, purge it
            localStorage.removeItem(`guest_token_${jobId}`);
            localStorage.removeItem(`guest_thread_${jobId}`);
            localStorage.removeItem(`guest_client_${jobId}`);
            localStorage.removeItem(`favs_${jobId}`);
          }
        }
      });
    };

    cleanupExpiredSessions();

    // 2. Load current session after cleanup
    const token = localStorage.getItem(`guest_token_${id}`);
    const thread = localStorage.getItem(`guest_thread_${id}`);
    const clientStr = localStorage.getItem(`guest_client_${id}`);

    if (token && clientStr) {
      setGuestToken(token);
      if (thread) setGuestThread(thread);
    } else {
      setShowIdentify(true);
    }
  }, [id]);

  const { isError: isSessionError, error: sessionError } =
    useCheckGuestSessionQuery(
      { jobId: id, token: guestToken },
      { skip: !guestToken },
    );

  useEffect(() => {
    // Only wipe session and show modal if the server explicitly rejects the token (401)
    if (
      isSessionError &&
      sessionError &&
      (sessionError as any).status === 401
    ) {
      localStorage.removeItem(`guest_token_${id}`);
      localStorage.removeItem(`guest_thread_${id}`);
      localStorage.removeItem(`guest_client_${id}`);
      setGuestToken("");
      setGuestThread("");
      setShowIdentify(true);
    }
  }, [isSessionError, sessionError, id]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [grouped, setGrouped] = useState<Record<string, Talent[]>>({});
  const [filter, setFilter] = useState<string>("");
  const [availabilityModal, setAvailabilityModal] = useState(false);
  const [selectedAvailabilityTalent, setSelectedAvailabilityTalent] =
    useState<Talent | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: (() => void) | null;
    label: string;
  }>({ open: false, action: null, label: "" });
  const [activeImage, setActiveImage] = useState<string>("");

  const [deleteSingleTalentFromShortlistMutation] =
    useDeleteSingleTalentFromShortlistMutation();

  const handleViewTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setActiveImage(talent.primaryImage);
    setIsOpen(true);
  };

  const { data, isLoading, refetch } = useGetSingleShortlistJobQuery(id);

  const session_id = data?.shortlisted_talents?.[0]?.session_id;
  const jobId = data?.job_id;

  useEffect(() => {
    if (!data) return;
    const job: ShortlistJobDetail = data?.data ?? data;
    const talents: ShortlistedTalent[] = job?.shortlisted_talents ?? [];
    setGrouped(groupByRole(talents, job?.job_roles));
  }, [data]);

  const allTalents = Object.values(grouped).flat();
  const totalCount = allTalents.length;
  const roleCount = Object.keys(grouped).length;

  const withConfirm = (action: () => void, label: string) => {
    setConfirmModal({ open: true, action, label });
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDeleteTalent = async (talentId: string) => {
    try {
      const res = await deleteSingleTalentFromShortlistMutation({
        job_id: jobId,
        talent_id: talentId,
      }).unwrap();
      refetch();
      toast.success("Deleted the talent successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/shortlist/shared/${id}`;
    navigator.clipboard?.writeText(shareUrl);
    toast.success("Got it! Link copied to clipboard.");
  };

  const handleDownloadPDF = async () => {
    const toastId = toast.loading("Generating PDF with images. Please wait...");
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 32, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`Shortlist: ${jobTitle}`, 14, 14);

      if (jobDescription) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(jobDescription, pageWidth - 28);
        doc.text(descLines.slice(0, 2), 14, 23);
      }

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}   •   ${totalCount} talent${totalCount !== 1 ? "s" : ""}`,
        14,
        40,
      );

      // Pre-load images
      const base64Images = await Promise.all(
        allTalents.map(async (t) => {
          try {
            if (!t.primaryImage) return null;
            // Fetch as blob through Next.js image proxy to completely bypass CORS issues
            const proxiedUrl = `/_next/image?url=${encodeURIComponent(t.primaryImage)}&w=128&q=75`;
            const res = await fetch(proxiedUrl);
            if (!res.ok) throw new Error("Network response was not ok");
            const blob = await res.blob();
            
            // Create a local object URL for the blob
            const objectUrl = URL.createObjectURL(blob);
            
            return await new Promise<string>((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  // Fill with white background in case of transparent PNGs
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                  resolve(canvas.toDataURL("image/jpeg", 0.7));
                } else {
                  resolve("");
                }
                URL.revokeObjectURL(objectUrl);
              };
              img.onerror = () => {
                resolve("");
                URL.revokeObjectURL(objectUrl);
              };
              img.src = objectUrl;
            });
          } catch (e) {
            console.error("PDF Image loading error:", e);
            return null;
          }
        })
      );

      autoTable(doc, {
        startY: 46,
        head: [
          ["#", "Photo", "Name", "Role", "Character", "Location", "Country", "Added"],
        ],
        body: allTalents.map((t, i) => [
          i + 1,
          "",
          t.name,
          t.role,
          t.character,
          t.location,
          t.country,
          formatDate(t.created_at),
        ]),
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30], minCellHeight: 14 },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { halign: "center", cellWidth: 14 },
          7: { cellWidth: 24 },
        },
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          if (data.column.index === 1 && data.cell.section === "body") {
            const base64 = base64Images[data.row.index];
            if (base64 && base64.length > 20) {
              const dim = 10;
              const x = data.cell.x + (data.cell.width - dim) / 2;
              const y = data.cell.y + (data.cell.height - dim) / 2;
              try {
                // Guaranteed to be JPEG from our canvas processing above
                doc.addImage(base64, "JPEG", x, y, dim, dim);
              } catch (e) {
                console.error("Error adding image to PDF:", e);
              }
            }
          }
        },
        didDrawPage: (hookData) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(160, 160, 160);
          doc.text(
            `Page ${hookData.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: "center" },
          );
        },
      });

      doc.save(`shortlist-${jobTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("PDF generated successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.", { id: toastId });
    }
  };

  // ── Derive job meta ───────────────────────────────────────────────────────

  const job: ShortlistJobDetail | undefined = data?.data ?? data;
  const jobTitle = job?.title ?? "Shortlist";
  const jobDescription = job?.description?.trim() ?? "";
  const jobPhoto = (job as any)?.job_photo ?? "";
  const clientPhoto = (job as any)?.created_by_image ?? "";

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50/50'>
        <div className='flex flex-col items-center gap-4'>
          <svg
            className='animate-spin h-10 w-10 text-blue-600'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          <span className='text-gray-500 font-medium text-lg animate-pulse'>
            Loading shortlist...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 pb-24 relative'>
      {showIdentify && (
        <IdentifyModal
          jobId={id}
          onSuccess={(token, threadId) => {
            setGuestToken(token);
            setGuestThread(threadId);
            setShowIdentify(false);
          }}
        />
      )}

      <main className='container mx-auto space-y-10'>
        <Header
          jobTitle={jobTitle}
          totalCount={totalCount}
          jobPhoto={jobPhoto}
          clientPhoto={clientPhoto}
        />

        {/* Stats + Action buttons in one row */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 container mx-auto mb-8'>
          {/* Campaign Stats */}
          <div className='flex-1'>
            <CampaignStats
              roleCount={roleCount}
              modelCount={totalCount}
              jobId={job?.job_id || id}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3 shrink-0 sm:self-center'>
            <button
              onClick={handleShareLink}
              className='group flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:scale-95'
            >
              <Share2
                size={18}
                className='text-gray-400 group-hover:text-blue-500 transition-colors'
              />
              Share Link
            </button>

            <button
              onClick={handleDownloadPDF}
              className='group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
            >
              <Download
                size={18}
                className='transition-transform group-hover:-translate-y-0.5'
              />
              Download PDF
            </button>
          </div>
        </div>

        {/* Dynamic Talent Grids */}
        {isLoading ? (
          <PageSkeleton />
        ) : totalCount === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-gray-500'>No talents in this shortlist yet.</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped)
              ?.filter(([, talents]) => talents?.length > 0)
              ?.map(([roleKey, talents], index) => (
                <section key={roleKey}>
                  <div className='flex justify-between items-end mb-8 mt-4 pb-4 border-b border-gray-200/60'>
                    <h2 className='text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 capitalize tracking-tight'>
                      {roleKey.toLowerCase() === "unassigned"
                        ? roleKey
                        : `${roleKey}`}
                    </h2>
                    <div className='flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm'>
                      <span className='w-2 h-2 rounded-full bg-blue-500 animate-pulse'></span>
                      <span className='text-sm font-bold text-gray-700'>
                        {talents.length}{" "}
                        <span className='font-medium text-gray-500'>
                          models
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10 items-start'>
                    {talents?.map((talent) => (
                      <ModelCard
                        key={talent.id}
                        talent={talent}
                        onView={handleViewTalent}
                        onDelete={handleDeleteTalent}
                        jobId={id}
                        guestToken={guestToken}
                      />
                    ))}
                  </div>
                </section>
              ))}
          </>
        )}
      </main>

      {/* Footer Branding */}
      <footer className='text-center py-12'>
        <h2 className='text-2xl font-bold text-gray-900'>
          <span className='text-blue-600'>Pool</span> Of Cast.
        </h2>
        <p className='text-xs text-gray-500 mt-1'>Cast. Book. Manage.</p>
      </footer>

      {/* ── View Talent Modal ── */}
      {isOpen && selectedTalent && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          onClick={() => setIsOpen(false)}
        >
          <div
            className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors'
            >
              ✕
            </button>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8'>
              {/* Left — info */}
              <div className='flex flex-col'>
                <h1 className='text-2xl font-bold text-gray-900 mb-5'>
                  Profile Details
                </h1>
                <div className='space-y-'>
                  {[
                    { label: "Name", value: selectedTalent.name },
                    { label: "Role", value: selectedTalent.role },
                    { label: "Character", value: selectedTalent.character },
                    { label: "Gender", value: selectedTalent.gender },
                    {
                      label: "Location",
                      value: `${selectedTalent.location}, ${selectedTalent.country}`,
                    },
                    {
                      label: "Height",
                      value: selectedTalent.height
                        ? `${selectedTalent.height} cm`
                        : "—",
                    },
                    { label: "Waist", value: selectedTalent.waist || "—" },
                    { label: "Bust", value: selectedTalent.bust || "—" },
                    { label: "Hips", value: selectedTalent.hips || "—" },
                    {
                      label: "Dress size",
                      value: selectedTalent.dress_size || "—",
                    },
                    {
                      label: "Shoe size",
                      value: selectedTalent.shoe_size || "—",
                    },
                    {
                      label: "Hair",
                      value: `${selectedTalent.hair_colour} / ${selectedTalent.hair_type}`,
                    },
                    { label: "Eyes", value: selectedTalent.eye_colour },
                    { label: "Skin", value: selectedTalent.skin_color },
                    ...(selectedTalent.skills
                      ? [{ label: "Skills", value: selectedTalent.skills }]
                      : []),
                    {
                      label: "Available",
                      value: selectedTalent?.available_dates?.length ? (
                        <button
                          onClick={() => {
                            setSelectedAvailabilityTalent(selectedTalent);
                            setAvailabilityModal(true);
                          }}
                          className='flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition text-sm font-medium'
                        >
                          <Calendar size={14} />
                          {selectedTalent.available_dates.length} date
                          {selectedTalent.available_dates.length > 1 ? "s" : ""}
                        </button>
                      ) : (
                        "No dates"
                      ),
                    },
                    {
                      label: "Added",
                      value: formatDate(selectedTalent.created_at),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className='flex gap-6 items-center pb-3'>
                      <span className='lg:min-w-40 text-[#374151] font-semibold text-sm md:text-base'>
                        {label}:
                      </span>
                      <span className='text-[#4B5563] font-normal text-sm md:text-base capitalize'>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedTalent.portfolio_link && (
                  <div className='mt-6 bg-blue-50/50 rounded-2xl p-4 flex items-center justify-between border border-blue-100'>
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <div className='w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm'>
                        <Link size={18} />
                      </div>
                      <div className='flex flex-col overflow-hidden'>
                        <span className='text-sm font-bold text-gray-900'>
                          Portfolio link
                        </span>
                        <a
                          href={selectedTalent.portfolio_link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 hover:underline truncate'
                        >
                          {selectedTalent.portfolio_link.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedTalent.portfolio_link || "");
                        toast.success("Portfolio link copied!");
                      }}
                      className='shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold bg-white shadow-sm'
                    >
                      Copy link
                      <Copy size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Right — images */}
              <div className='flex flex-col gap-4'>
                <div className='relative w-full aspect- rounded-lg overflow-hidden shadow-md bg-gray-200'>
                  {activeImage ? (
                    <Image
                      src={activeImage}
                      alt={selectedTalent.name}
                      width={600}
                      height={800}
                      unoptimized
                      className='object-contain w-full h-auto'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-gray-400'>
                      <UserRoundPlus size={48} />
                    </div>
                  )}
                </div>

                {selectedTalent.images.length > 0 && (
                  <div className='flex flex-col gap-2 mt-4'>
                    <h3 className='font-bold text-sm text-gray-900'>Polas / Selfies</h3>
                    <div className='flex gap-2 flex-wrap'>
                      {selectedTalent.images.map((img) => {
                        const url = resolveImageUrl(img.image);
                        const isActive = activeImage === url;
                        return (
                          <div
                            key={img.image_id}
                            onClick={() => setActiveImage(url)}
                            className={`relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 shrink-0 cursor-pointer transition-all
                            ${
                              isActive
                                ? "ring-2 ring-[#2563EB] ring-offset-1"
                                : "opacity-70 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={url}
                              alt={selectedTalent.name}
                              fill
                              unoptimized
                              className='object-cover'
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='px-6 md:px-8 py-4 flex justify-center border-t border-gray-100'>
              <div
                className='flex flex-wrap gap-2 sm:gap-3'
                onClick={(e) => e.stopPropagation()}
              >
                {/* <button
                  onClick={() =>
                    withConfirm(
                      () => handleShortListTalent(selectedTalent.talent_id),
                      "Shortlist",
                    )
                  }
                  disabled={shortlistLoading}
                  title='Shortlist'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Heart size={20} fill='currentColor' />
                </button> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAvailabilityTalent(selectedTalent);
                    setAvailabilityModal(true);
                  }}
                  title='Availability'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                >
                  <Calendar size={20} />
                </button>
                {/* <button
                  onClick={() =>
                    withConfirm(
                      () => handleSelftapRequest(selectedTalent.talent_id),
                      "Selftape",
                    )
                  }
                  disabled={selfTapLoading}
                  title='Selftapes Request'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Camera size={20} />
                </button> */}
                {/* <button
                  onClick={() =>
                    withConfirm(
                      () => handleECastingRequest(selectedTalent.talent_id),
                      "E-casting",
                    )
                  }
                  disabled={eCastingLoading}
                  title='E-Casting Request'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Phone size={20} />
                </button> */}
                {/* <button
                  onClick={() =>
                    withConfirm(
                      () => handleTalentBooking(selectedTalent.talent_id),
                      "Booking",
                    )
                  }
                  disabled={bookLoading}
                  title='Book'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Check size={20} />
                </button> */}
                {/* <button
                  onClick={() =>
                    withConfirm(
                      () => handlePolasRequest(selectedTalent.talent_id),
                      "Polas",
                    )
                  }
                  disabled={polasLoading}
                  title='Polas Request'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <ScanFace size={20} />
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Availability Dates Modal ── */}
      <Dialog open={availabilityModal} onOpenChange={setAvailabilityModal}>
        <DialogContent className='sm:max-w-sm lg:max-w-md max-h-[80vh] flex flex-col'>
          <DialogHeader className='shrink-0'>
            <DialogTitle className='flex items-center gap-2'>
              <Calendar size={18} className='text-[#2563EB]' />
              Available Dates
            </DialogTitle>
            <DialogDescription>
              {selectedAvailabilityTalent?.name}&apos;s confirmed available
              dates for booking.
            </DialogDescription>
          </DialogHeader>

          <div className='py-3 space-y-2 overflow-y-auto flex-1 min-h-0 pr-1'>
            {selectedAvailabilityTalent?.available_dates &&
            selectedAvailabilityTalent.available_dates.length > 0 ? (
              selectedAvailabilityTalent.available_dates.map((dateStr) => {
                const { day, date, isPast } = formatAvailabilityDate(dateStr);
                return (
                  <div
                    key={dateStr}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                      isPast
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-blue-100 bg-blue-50"
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Calendar
                        size={15}
                        className={`shrink-0 ${isPast ? "text-gray-400" : "text-[#2563EB]"}`}
                      />
                      <div className='flex flex-col'>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isPast ? "text-gray-400" : "text-[#2563EB]"
                          }`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isPast
                              ? "text-gray-400 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {date}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border shadow-sm ${
                        isPast
                          ? "text-gray-400 bg-white border-gray-200"
                          : "text-green-600 bg-white border-green-100"
                      }`}
                    >
                      {isPast ? "Past" : "Available"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-center gap-2'>
                <Calendar size={32} className='text-gray-300' />
                <p className='text-sm text-gray-500'>
                  No available dates listed.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Action Modal ── */}
      <Dialog
        open={confirmModal.open}
        onOpenChange={(open) => {
          if (!open) setConfirmModal({ open: false, action: null, label: "" });
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Confirm request</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className='font-semibold text-gray-800'>
                {confirmModal.label}
              </span>{" "}
              this model?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-4 pt-2'>
            <DialogClose asChild>
              <Button variant='outline'>No</Button>
            </DialogClose>
            <Button
              className='bg-[#2563EB] hover:bg-[#155aee] text-white'
              onClick={() => {
                confirmModal.action?.();
                setConfirmModal({ open: false, action: null, label: "" });
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {guestToken && (
        <ClientChatProvider>
          <ChatWidget
            jobId={id}
            guestToken={guestToken}
            guestThread={guestThread}
            agentName={job?.created_by_name}
            agentPhoto={job?.created_by_image}
          />
        </ClientChatProvider>
      )}
    </div>
  );
}
