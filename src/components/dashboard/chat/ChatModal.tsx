/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Camera,
  Phone,
  Check,
  ScanFace,
  MessageCircleMore,
  Loader,
  ShieldAlert,
  Star,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  useBookTalentMutation,
  useECastingRequestMutation,
  usePolasRequestMutation,
  useSelfTapRequestMutation,
  useShortlistTalentMutation,
} from "@/redux/features/ai-chat/aiChatAPI";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateConversationMutation } from "@/redux/features/messages/messagesAPI";
import { setConversation } from "@/redux/features/messages/conversationSlice";
import { useRouter } from "next/navigation";

interface TalentProfile {
  talent_id: number;
  agent_id?: number;
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
  is_available?: boolean;
  approval_status?: string;
  is_available_on_request?: boolean;
  available_dates?: string[];
}

interface ChatModalDetailProps {
  initialIndex?: number;
  sessionId?: string | string[]; // Allow the array type here
}

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

export default function ChatModalDetail({
  initialIndex = 0,
  sessionId = "",
}: ChatModalDetailProps) {
  const [currentTalentIndex, setCurrentTalentIndex] = useState(initialIndex);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  // mutation
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
  const [availabilityModal, setAvailabilityModal] = useState(false);
  const [selectedAvailabilityTalent, setSelectedAvailabilityTalent] =
    useState<TalentProfile | null>(null);
  const [createConversationMutation] = useCreateConversationMutation();
  const [loadingConversationId, setLoadingConversationId] = useState<
    number | null
  >(null);

  // 1. Add near your other useState declarations
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: (() => void) | null;
    label: string;
  }>({ open: false, action: null, label: "" });

  // 2. Add this helper (place it alongside your other handlers)
  const withConfirm = (action: () => void, label: string) => {
    setConfirmModal({ open: true, action, label });
  };

  const router = useRouter();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   setCurrentTalentIndex(initialIndex);
  // }, [initialIndex]);

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId]);

  const talentList: TalentProfile[] = useSelector(
    (state: any) => state.aiChat.talentListForModal ?? [],
  );

  useEffect(() => {
    setCurrentTalentIndex(initialIndex);
    setCurrentImageIndex(0);
    setLiked(false);
  }, [initialIndex, talentList.length]);

  const talent: TalentProfile | undefined = talentList[currentTalentIndex];
  const hasTalents = talentList.length > 0;
  const isFirst = currentTalentIndex === 0;
  const isLast = currentTalentIndex === talentList.length - 1;

  // Reset image index when talent changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setLiked(false);
  }, [currentTalentIndex]);

  const galleryImages = talent?.images?.length
    ? talent.images.map((img) => `${BASE_URL}${img}`)
    : ["/placeholder.svg"];

  const profileRows: { label: string; value: string }[] = talent
    ? [
        { label: "Name", value: talent.name },
        { label: "Role", value: talent.role },
        { label: "Agent", value: talent.agent_name },
        { label: "Date of Birth", value: talent.date_of_birth },
        { label: "Gender", value: talent.gender },
        { label: "Height", value: talent.height },
        { label: "Bust", value: talent.bust },
        { label: "Waist", value: talent.waist },
        { label: "Hips", value: talent.hips },
        { label: "Shoe Size", value: talent.shoe_size },
        { label: "Dress Size", value: talent.dress_size },
        { label: "Eye Colour", value: talent.eye_color },
        { label: "Hair Type", value: talent.hair_type },
        { label: "Hair Colour", value: talent.hair_color },
        { label: "Skin Colour", value: talent.skin_color },
        { label: "Location", value: `${talent.location}, ${talent.country}` },
      ]
    : [];

  const handleNextTalent = () => {
    if (!isLast) setCurrentTalentIndex((prev) => prev + 1);
  };

  const handlePrevTalent = () => {
    if (!isFirst) setCurrentTalentIndex((prev) => prev - 1);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const handleShortListTalent = async (talendId: number) => {
    try {
      const res = await shortlistTalentMutation({
        session_id: currentSessionId,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handlePolasRequest = async (talendId: number) => {
    try {
      const res = await polasRequestMutation({
        session_id: currentSessionId,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleTalentBooking = async (talendId: number) => {
    try {
      const res = await bookTalentMutation({
        session_id: currentSessionId,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleECastingRequest = async (talendId: number) => {
    try {
      const res = await eCastingRequestMutation({
        session_id: currentSessionId,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleselftapRequest = async (talendId: number) => {
    try {
      const res = await selfTapRequestMutation({
        session_id: currentSessionId,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleCreateConversion = async (id: number) => {
    try {
      setLoadingConversationId(id);
      const res = await createConversationMutation({
        user_id: id,
      }).unwrap();

      if (res?.status) {
        const c_id = res?.data?.conversation_id;

        const message = {
          conversation_id: c_id,
          other_user_id: 0,
          other_user_name: "",
          other_user_email: "",
          other_user_profile_pic: "",
          last_message: {
            attachment: null,
            created_at: "",
            message_id: 0,
            message_type: "",
            sender_id: 0,
            text: "",
          },
          unread_count: 0,
          updated_at: "",
          created_at: "",
        };
        dispatch(setConversation(message));

        router.push("/dashboard/client/message");
      }
    } catch (error: any) {
      console.log(error?.data?.message || "Fail to create new chat!");
    } finally {
      setLoadingConversationId(null);
    }
  };

  return (
    <div className='h-full w-full bg-white'>
      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        {/* ── Talent Pagination Header ── */}
        <div className='flex items-center justify-between px-6 md:px-8 pt-6 pb-2'>
          <button
            onClick={handlePrevTalent}
            disabled={!hasTalents || isFirst}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                !hasTalents || isFirst
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <ChevronLeft className='w-4 h-4' />
            Prev
          </button>

          <span className='text-sm text-gray-500 font-medium'>
            {hasTalents
              ? `${currentTalentIndex + 1} / ${talentList.length}`
              : "No talents"}
          </span>

          <button
            onClick={handleNextTalent}
            disabled={!hasTalents || isLast}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                !hasTalents || isLast
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Next
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>

        {/* ── Main Content ── */}
        {!hasTalents ? (
          <div className='flex items-center justify-center py-24 text-gray-400 text-sm'>
            No talent data available.
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-6 md:px-8 py-2'>
              {/* Left Side - Profile Info */}
              <div className='flex flex-col justify-start'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
                  Profile Details
                </h1>
                <div className='space-y-1'>
                  {profileRows.map(({ label, value }) => (
                    <div
                      key={label}
                      className='flex gap-6 items-center pb-3 last:border-b-0'
                    >
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

              {/* Right Side - Image and Gallery */}
              <div className='flex flex-col gap-4'>
                {/* Main Image */}
                <div className='relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-200'>
                  <img
                    src={galleryImages[currentImageIndex]}
                    alt={talent?.name}
                    className='w-full h-full object-cover'
                  />

                  <div className='absolute top-2  group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white text-sm space-y-3 z-20'>
                    <div className='flex items-center gap-3 font-semibold text-sm mb-1'>
                      {talent?.approval_status === "approved" ? (
                        <div
                          className='w-6 h-6 text-xl text-blue-400 fill-blue-700'
                          title='Verified'
                        >
                          <Star
                            size={24}
                            strokeWidth={1}
                            className='fill-blue-400'
                          />
                        </div>
                      ) : (
                        <div className='w-6 h-6 text-xl' title='Not Verified'>
                          <ShieldAlert
                            size={24}
                            strokeWidth={1}
                            className='opacity-50 fill-blue-400'
                          />
                        </div>
                      )}

                      {/* is available */}
                      {talent?.is_available &&
                        !talent?.is_available_on_request && (
                          <div
                            className='flex items-center justify-center w-6 h-6'
                            title={
                              talent?.is_available
                                ? "Available "
                                : "Not Available "
                            }
                          >
                            <span
                              className={`w-5 h-5 rounded-full ${
                                talent?.is_available
                                  ? "bg-green-400"
                                  : "bg-red-500"
                              }`}
                              aria-hidden='true'
                            />
                          </div>
                        )}

                      {/* Available for request */}
                      {talent?.is_available_on_request && (
                        <div
                          className='flex items-center justify-center w-6 h-6'
                          title={
                            talent?.is_available_on_request
                              ? "Available on request"
                              : "Not Available on request"
                          }
                        >
                          <span
                            className={`w-5 h-5 rounded-full ${
                              talent?.is_available_on_request
                                ? "bg-yellow-400"
                                : "bg-red-500"
                            }`}
                            aria-hidden='true'
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                <div className='relative'>
                  <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
                    {galleryImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${
                          index === currentImageIndex
                            ? "ring-2 ring-blue-500 opacity-100"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Gallery ${index}`}
                          width={80}
                          height={80}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>

                  {/* Image Nav Arrows */}
                  <button
                    onClick={handlePrevImage}
                    className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
                  >
                    <ChevronLeft className='w-5 h-5 text-black' />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
                  >
                    <ChevronRight className='w-5 h-5 text-black' />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='bg-transparent px-6 md:px-8 p-6 flex justify-center gap-6 md:gap-8 flex-wrap'>
              <div
                className='flex flex-wrap gap-2 sm:gap-3 mt-4'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    withConfirm(
                      () => handleShortListTalent(talent?.talent_id),
                      "Shortlist",
                    )
                  }
                  disabled={shortlistLoading}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                  aria-label='Like'
                  title='Shortlists'
                >
                  <Heart size={20} fill='currentColor' />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAvailabilityTalent(talent);
                    setAvailabilityModal(true);
                  }}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Schedule'
                  title='Availability'
                >
                  <Calendar size={20} />
                </button>

                <button
                  onClick={() =>
                    withConfirm(
                      () => handleselftapRequest(talent?.talent_id),
                      "Selftaps",
                    )
                  }
                  disabled={selfTapLoading}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                  aria-label='Photo'
                  title='Selftapes Request'
                >
                  <Camera size={20} />
                </button>

                <button
                  onClick={() =>
                    withConfirm(
                      () => handleECastingRequest(talent?.talent_id),
                      "E-casting",
                    )
                  }
                  disabled={eCastingLoading}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                  aria-label='Call'
                  title='E-Casting Request'
                >
                  <Phone size={20} />
                </button>

                <button
                  onClick={() =>
                    withConfirm(
                      () => handleTalentBooking(talent?.talent_id),
                      "Booking",
                    )
                  }
                  disabled={bookLoading}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                  aria-label='Approve'
                  title='Booking Request'
                >
                  <Check size={20} />
                </button>

                <button
                  onClick={() =>
                    withConfirm(
                      () => handlePolasRequest(talent?.talent_id),
                      "Polas",
                    )
                  }
                  disabled={polasLoading}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                  aria-label='Approve'
                  title='Polas Request'
                >
                  <ScanFace size={20} />
                </button>

                <button
                  onClick={() =>
                    handleCreateConversion(talent?.agent_id as number)
                  }
                  disabled={loadingConversationId === talent?.agent_id}
                  className='p-2 md:p-3.5 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-colors text-[#ffffff] hover:text-gray-100 border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer'
                  aria-label='Approve'
                  title='Direct message to agent'
                >
                  {loadingConversationId === talent?.agent_id ? (
                    <Loader className='animate-spin' size={20} />
                  ) : (
                    <MessageCircleMore size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Availability modal */}
      <Dialog open={availabilityModal} onOpenChange={setAvailabilityModal}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Available Dates</DialogTitle>
            <DialogDescription>
              {selectedAvailabilityTalent?.name}&apos;s available dates for
              booking.
            </DialogDescription>
          </DialogHeader>

          <div className='py-2 space-y-2'>
            {selectedAvailabilityTalent?.available_dates?.length ? (
              selectedAvailabilityTalent.available_dates.map((date) => (
                <div
                  key={date}
                  className='flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50'
                >
                  <Calendar size={16} className='text-[#2563EB] shrink-0' />
                  <span className='text-sm font-medium text-gray-800'>
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className='text-sm text-gray-500 text-center py-6'>
                No available dates listed.
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm action modal ── */}
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
    </div>
  );
}
