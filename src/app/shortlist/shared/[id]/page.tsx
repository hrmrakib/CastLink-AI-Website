/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Filter,
  Share2,
  Download,
  UserRoundPlus,
  Heart,
  Calendar,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetSingleShortlistJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import {
  useIdentifyGuestMutation,
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
import { useClientChat, ClientChatProvider } from "@/provider/ClientChatProvider";
import {
  useBookTalentMutation,
  useDeleteSingleTalentFromShortlistMutation,
  useECastingRequestMutation,
  usePolasRequestMutation,
  useSelfTapRequestMutation,
  useShortlistTalentMutation,
} from "@/redux/features/ai-chat/aiChatAPI";
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
    is_available: ti.is_available,
    available_dates: ti.available_dates ?? [],
    primaryImage: resolveImageUrl(getPrimaryImage(ti.images)),
    images: ti.images,
    created_at: raw.created_at,
  };
}

function groupByRole(talents: ShortlistedTalent[]): Record<string, Talent[]> {
  const groups: Record<string, Talent[]> = {};
  for (const raw of talents) {
    const t = normalise(raw);
    const key = (raw.talent_info.role ?? "other").trim().toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identifyGuest, { isLoading }] = useIdentifyGuestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await identifyGuest({ jobId, name, email }).unwrap();
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
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to identify. Please try again.",
      );
    }
  };

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl'>
        <h2 className='text-2xl font-bold mb-2'>Welcome!</h2>
        <p className='text-gray-500 mb-6'>
          Please enter your details to view and interact with this shortlist.
        </p>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Full Name</label>
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
            disabled={isLoading}
            type='submit'
            className='mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors'
          >
            {isLoading && (
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
            {isLoading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Chat Widget ──────────────────────────────────────────────────────────────

const ChatWidget = ({
  jobId,
  guestToken,
  guestThread,
}: {
  jobId: string;
  guestToken: string;
  guestThread: string;
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
    : (Array.isArray(rawData?.results) ? rawData.results : (Array.isArray(rawData?.data) ? rawData.data : []));

  // Use WS messages if we have hydrated history, otherwise combine REST history with optimistic messages
  // We can assume we have hydrated history if isAuthenticated is true or if we received a fetch_chat event (which populates non-optimistic messages).
  const hasServerMessages = messages.some(m => !m.isOptimistic);

  const displayMessages = hasServerMessages || isAuthenticated
    ? messages
    : [...fallbackHistory, ...messages];

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

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {isOpen && (
        <div className='absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col mb-4 origin-bottom-right transition-all'>
          {/* Header */}
          <div className='bg-blue-600 text-white p-4 flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold'>
                  A
                </div>
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
              </div>
              <div>
                <h3 className='font-semibold'>Agent</h3>
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
              displayMessages.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${msg.sender === "client" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.sender === "client" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}
                  >
                    {msg.sender === "client" ? "Me" : "A"}
                  </div>
                  <div
                    className={`p-3 rounded-2xl shadow-sm text-sm border ${msg.sender === "client"
                      ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                      : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                      }`}
                  >
                    {msg.text || msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className='flex items-start gap-2'>
                <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0'>
                  A
                </div>
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
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Reply...'
              className='flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50'
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              disabled={!message.trim()}
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
    <div className='flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]'>
      {/* Image & Stats Overlay */}
      <div
        className='relative aspect-4/3 w-full h-72 overflow-hidden group cursor-pointer'
        onClick={() => onView(talent)}
      >
        <Image
          src={talent.primaryImage || "/preview/1.jpg"}
          alt={talent.name}
          fill
          unoptimized
          className='object-contain w-full h-full bg-gray-100'
        />

        {/* Bottom Stats Gradient Overlay */}
        <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none'>
          <h3 className='text-white font-semibold text-lg mb-2 pointer-events-auto truncate'>
            {talent.name}
          </h3>
          <div className='grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-gray-200 pointer-events-auto'>
            <p>
              Height{" "}
              <span className='text-white font-medium'>
                {talent.height || "—"}
              </span>
            </p>
            <p>
              Shoe{" "}
              <span className='text-white font-medium'>
                {talent.shoe_size || "—"}
              </span>
            </p>
            <p>
              Bust{" "}
              <span className='text-white font-medium'>
                {talent.bust || "—"}
              </span>
            </p>
            <p>
              Hair{" "}
              <span className='text-white font-medium'>
                {talent.hair_colour || "—"}
              </span>
            </p>
            <p>
              Waist{" "}
              <span className='text-white font-medium'>
                {talent.waist || "—"}
              </span>
            </p>
            <p>
              Eyes{" "}
              <span className='text-white font-medium'>
                {talent.eye_colour || "—"}
              </span>
            </p>
            <p>
              Hips{" "}
              <span className='text-white font-medium'>
                {talent.hips || "—"}
              </span>
            </p>
            <p>
              Role{" "}
              <span className='text-white font-medium capitalize truncate'>
                {talent.role || "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className='flex justify-between items-center p-3 px-4 bg-white border-t border-gray-100'>
        <button
          onClick={toggleFavorite}
          disabled={isAddingFavorite || isRemovingFavorite}
          className='transition-colors disabled:opacity-50'
          title={isFavorited ? "Unfavorite" : "Favorite"}
        >
          <Heart
            className={`w-5 h-5 ${isFavorited ? "text-blue-500 fill-blue-500" : "text-gray-400 hover:text-blue-500"}`}
          />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border shrink-0 ${showChat || comments.length > 0
            ? "bg-blue-50 text-blue-600 border-blue-100"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
        >
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
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            ></path>
          </svg>
          {comments.length > 0 ? `${comments.length} comments` : "Comment"}
        </button>

        <button
          onClick={() => onView(talent)}
          className='text-gray-400 transition-colors hover:text-gray-600'
          title='View Details'
        >
          <Eye className='w-5 h-5' />
        </button>

        {/* Delete button removed for shared public link */}
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
}: {
  jobTitle: string;
  totalCount: number;
}) => (
  <header className='flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 bg-transparent'>
    <div className='flex flex-col items-center mb-4 md:mb-0'>
      <Image src='/shortlist-logo.png' alt='Logo' width={64} height={64} />
    </div>

    <div className='text-center'>
      <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
        {jobTitle}
      </h1>
      <p className='text-sm text-gray-500 mt-1'>
        {totalCount} talent{totalCount !== 1 ? "s" : ""} selected
      </p>
    </div>

    <div className='flex flex-col items-center mb-4 md:mb-0'>
      {/* Optional right-side image block */}
    </div>
  </header>
);

const CampaignStats = ({
  roleCount,
  modelCount,
}: {
  roleCount: number;
  modelCount: number;
}) => (
  <div className='flex flex-wrap justify-around items-center py-6 px-4 md:px-8 border-b-2 border-t-2 border-gray-100 bg-transparent text-sm'>
    <div className='flex items-center gap-3 w-1/2 md:w-auto mb-4 md:mb-0'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Date</p>
        <p className='font-semibold text-gray-900'>
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
    <div className='flex items-center gap-3 w-1/2 md:w-auto mb-4 md:mb-0'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Roles</p>
        <p className='font-semibold text-gray-900'>{roleCount}</p>
      </div>
    </div>
    <div className='flex items-center gap-3 w-1/2 md:w-auto'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Models</p>
        <p className='font-semibold text-gray-900'>{modelCount}</p>
      </div>
    </div>
    <div className='flex items-center gap-3 w-1/2 md:w-auto'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Reference</p>
        <p className='font-semibold text-gray-900'>Live Job</p>
      </div>
    </div>
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
    const token = localStorage.getItem(`guest_token_${id}`);
    const thread = localStorage.getItem(`guest_thread_${id}`);
    const client = localStorage.getItem(`guest_client_${id}`);

    if (token && client) {
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
    setGrouped(groupByRole(talents));
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

  const handleDownloadPDF = () => {
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

    autoTable(doc, {
      startY: 46,
      head: [
        ["#", "Name", "Role", "Character", "Location", "Country", "Added"],
      ],
      body: allTalents.map((t, i) => [
        i + 1,
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
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        6: { cellWidth: 24 },
      },
      margin: { left: 14, right: 14 },
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
  };

  // ── Mutations ────────────────────────────────────────────────────────────

  const [polasRequestMutation, { isLoading: polasLoading }] =
    usePolasRequestMutation();
  const [selfTapRequestMutation, { isLoading: selfTapLoading }] =
    useSelfTapRequestMutation();
  const [eCastingRequestMutation, { isLoading: eCastingLoading }] =
    useECastingRequestMutation();
  const [shortlistTalentMutation, { isLoading: shortlistLoading }] =
    useShortlistTalentMutation();
  const [bookTalentMutation, { isLoading: bookLoading }] =
    useBookTalentMutation();

  const handlePolasRequest = async (talentId: number) => {
    try {
      const res = await polasRequestMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleTalentBooking = async (talentId: number) => {
    try {
      const res = await bookTalentMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleECastingRequest = async (talentId: number) => {
    try {
      const res = await eCastingRequestMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleSelftapRequest = async (talentId: number) => {
    try {
      const res = await selfTapRequestMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleShortListTalent = async (talentId: number) => {
    try {
      const res = await shortlistTalentMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  // ── Derive job meta ───────────────────────────────────────────────────────

  const job: ShortlistJobDetail | undefined = data?.data ?? data;
  const jobTitle = job?.title ?? "Shortlist";
  const jobDescription = job?.description?.trim() ?? "";

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
    <div className='min-h-screen bg-gray-50/50 pb-24 relative'>
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

      <main className='container mx-auto px-4 md:px-8 py-8 space-y-12'>
        <Header jobTitle={jobTitle} totalCount={totalCount} />

        {/* Render utility buttons above the grid */}
        <div className='flex flex-wrap items-end justify-between mt-6 max-w-7xl mx-auto'>
          <button
            onClick={() => router.back()}
            className='flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4'>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='h-11! flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
                >
                  <Filter size={18} />
                  {filter === "" ? "Filter" : filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-36' align='start'>
                <DropdownMenuItem onSelect={() => setFilter("")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilter("1st Option")}>
                  1st Option
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilter("2nd Option")}>
                  2nd Option
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilter("Not available")}>
                  Not available
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            <button
              onClick={handleShareLink}
              className='flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
            >
              <Share2 size={18} />
              Share Link
            </button>

            <button
              onClick={handleDownloadPDF}
              className='flex items-center justify-center gap-2 rounded-lg border border-[#BBCFF9] bg-[#E9EFFD] px-4 py-2 text-sm font-medium text-[#2563EB] transition-colors hover:bg-blue-100 active:scale-95 sm:text-base'
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>

        <CampaignStats roleCount={roleCount} modelCount={totalCount} />

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
              ?.map(([roleKey, talents]) => (
                <section key={roleKey}>
                  <div className='flex justify-between items-end mb-6'>
                    <h2 className='text-xl md:text-2xl font-bold text-gray-900 capitalize'>
                      {roleKey}
                    </h2>
                    <span className='text-sm font-semibold text-gray-500'>
                      {talents.length} models
                    </span>
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

                {selectedTalent.images.length > 1 && (
                  <div className='flex gap-2 flex-wrap'>
                    {selectedTalent.images.map((img) => {
                      const url = resolveImageUrl(img.image);
                      const isActive = activeImage === url;
                      return (
                        <div
                          key={img.image_id}
                          onClick={() => setActiveImage(url)}
                          className={`relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 shrink-0 cursor-pointer transition-all
                          ${isActive
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
                  title='Booking Request'
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
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border ${isPast
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
                          className={`text-xs font-semibold uppercase tracking-wide ${isPast ? "text-gray-400" : "text-[#2563EB]"
                            }`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-sm font-medium ${isPast
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                            }`}
                        >
                          {date}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border shadow-sm ${isPast
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
          />
        </ClientChatProvider>
      )}
    </div>
  );
}
