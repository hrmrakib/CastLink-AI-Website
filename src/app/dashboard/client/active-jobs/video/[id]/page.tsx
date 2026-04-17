/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ruler,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetActiveJobDetailsQuery } from "@/redux/features/active-jobs/activeJobsAPI";

const MEDIA_URL = process.env.NEXT_PUBLIC_AI_MEDIA_URL ?? "";
const API_IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────
interface RequestedSelftape {
  talent_id: number;
  job_id: number;
  name: string;
  role: string;
  gender: string;
  location: string;
  country: string;
  continent: string;
  is_active: boolean;
  agent_id: number;
  agent_name: string;
  images: string[];
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  available_dates: string[];
  status: string;
  tapes: string[];
}

// ── Skeleton ──────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className='min-h-screen bg-transparent'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-10 w-24 rounded-xl' />
          <div className='text-center space-y-2'>
            <Skeleton className='h-7 w-48 mx-auto' />
            <Skeleton className='h-4 w-56 mx-auto' />
          </div>
          <div className='w-24' />
        </div>
      </div>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-4'>
            <Skeleton className='w-full h-[480px] rounded-xl' />
            <div className='bg-white rounded-xl p-4 flex items-center justify-between'>
              <div className='space-y-2 p-4'>
                <Skeleton className='h-5 w-36' />
                <Skeleton className='h-4 w-52' />
              </div>
              <div className='flex gap-3 mr-4'>
                <Skeleton className='h-10 w-28 rounded-lg' />
                <Skeleton className='h-10 w-20 rounded-lg' />
              </div>
            </div>
          </div>
          <div className='space-y-6'>
            <Skeleton className='w-full h-64 rounded-lg' />
            <Skeleton className='w-full h-52 rounded-lg' />
            <Skeleton className='w-full h-12 rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Media Navigator ───────────────────────────────────────────────
function MediaNav({
  current,
  total,
  label,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (total <= 1) return null;
  return (
    <div className='flex items-center justify-between mt-2 px-1'>
      <span className='text-xs text-gray-500'>
        {label} {current + 1} / {total}
      </span>
      <div className='flex gap-1'>
        <button
          onClick={onPrev}
          disabled={current === 0}
          className='p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition'
        >
          <ChevronLeft className='w-5 h-5' />
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className='p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition'
        >
          <ChevronRight className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const jobId = params?.id as string;
  const talentIdParam = searchParams.get("talentId");

  const { data: response, isLoading } = useGetActiveJobDetailsQuery(jobId, {
    skip: !jobId,
  });

  const job = response?.data;
  const selftapes: RequestedSelftape[] =
    job?.ai_result?.requested_selftapes ?? [];

  // ── 1. FLATTEN ALL VIDEOS ──────────────────────────────────────
  // Collect all tapes into a single array, keeping track of which talent owns which tape
  const allVideos = useMemo(() => {
    return selftapes.flatMap((talent) =>
      (talent.tapes || []).map((tapeUrl) => ({
        tapeUrl,
        talent,
      })),
    );
  }, [selftapes]);

  // ── 2. INITIALIZE STARTING TAPE ────────────────────────────────
  // If a specific talentId was passed, find their first tape. Otherwise, start at 0.
  const initialIndex = useMemo(() => {
    if (!talentIdParam) return 0;
    const index = allVideos.findIndex(
      (v) => v.talent.talent_id === Number(talentIdParam),
    );
    return index >= 0 ? index : 0;
  }, [allVideos, talentIdParam]);

  // ── 1. FLATTEN ALL IMAGES ──────────────────────────────────────
  const allImages = useMemo(() => {
    return selftapes.flatMap((talent) =>
      (talent.images || []).map((imageUrl) => ({
        imageUrl,
        talent,
      })),
    );
  }, [selftapes]);

  // Find the starting image index if a talentId is provided
  const initialImageIndex = useMemo(() => {
    if (!talentIdParam) return 0;
    const index = allImages.findIndex(
      (img) => img.talent.talent_id === Number(talentIdParam),
    );
    return index >= 0 ? index : 0;
  }, [allImages, talentIdParam]);

  // ── Media navigation ──────────────────────────────────────────
  const [currentTapeIndex, setCurrentTapeIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Set initial image on load
  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  // This ensures currentImageSrc pulls from the global list
  const currentImageData = allImages[currentImageIndex];
  const currentImageSrc = currentImageData?.imageUrl
    ? `${API_IMAGE_URL}${currentImageData.imageUrl}`
    : null;

  // Optional: If you want the profile info to update based on the IMAGE being viewed:
  // const activeTalentForImage = currentImageData?.talent;

  // Sync initial index when data loads
  useEffect(() => {
    setCurrentTapeIndex(initialIndex);
  }, [initialIndex]);

  // Extract the currently playing video and its associated talent
  const currentVideoData = allVideos[currentTapeIndex];
  const activeTape = currentVideoData?.talent ?? selftapes[0]; // activeTape holds the Talent Profile
  const images = activeTape?.images ?? [];

  // Reset image navigation when the active talent changes (as you scroll through videos)
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeTape?.talent_id]);

  const currentVideoSrc = currentVideoData?.tapeUrl
    ? `${MEDIA_URL}${currentVideoData.tapeUrl}`
    : null;

  // const currentImageSrc = images[currentImageIndex]
  //   ? `${MEDIA_URL}${images[currentImageIndex]}`
  //   : null;

  // ── Video player ──────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Reset player when video source changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [currentTapeIndex, activeTape?.talent_id]);

  // ── Modal state ───────────────────────────────────────────────
  const [showShortlistConfirm, setShowShortlistConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // ── Video handlers ────────────────────────────────────────────
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    if (v > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current
        .requestFullscreen()
        .catch(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().catch(() => setIsFullscreen(false));
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (isPlaying && isFullscreen) {
      const t = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(t);
    }
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, isFullscreen, isMuted]);

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) return <PageSkeleton />;

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header */}
      <header className='bg-transparent'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
          <div className='flex items-center justify-start'>
            <button
              onClick={() => router.back()}
              className='flex items-center gap-2 bg-white px-3 py-2.5 border rounded-xl text-[#404145] hover:text-[#000000] transition font-medium cursor-pointer'
            >
              <ArrowLeft className='w-5 h-5' />
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {selftapes.length === 0 ? (
          <div className='bg-white rounded-xl p-16 text-center text-gray-400'>
            No self-tape submissions found for this job.
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Video Player Section */}
            <div className='bg-white lg:col-span-2 p-4 rounded-xl'>
              {/* Video */}
              {currentVideoSrc ? (
                <>
                  <div
                    ref={containerRef}
                    className={`relative bg-black rounded-lg overflow-hidden group ${
                      isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
                    }`}
                    onMouseMove={handleMouseMove}
                  >
                    <video
                      key={currentVideoSrc}
                      ref={videoRef}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      className={`w-full ${
                        isFullscreen ? "h-screen" : "h-120"
                      } object-cover`}
                      src={currentVideoSrc}
                    />

                    {!isPlaying && (
                      <div
                        className='absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-black/40 transition'
                        onClick={togglePlayPause}
                      >
                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-600/80 hover:bg-gray-500 rounded-full flex items-center justify-center transition transform hover:scale-110'>
                          <Play className='w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1' />
                        </div>
                      </div>
                    )}

                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/50 to-transparent pt-12 pb-3 sm:pb-4 px-3 sm:px-4 transition-opacity duration-300 ${
                        isFullscreen && !showControls && isPlaying
                          ? "opacity-0"
                          : "opacity-100"
                      }`}
                    >
                      <input
                        type='range'
                        min='0'
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className='w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:h-2 transition-all'
                        aria-label='Video progress'
                      />
                      <div className='flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4'>
                        <button
                          onClick={togglePlayPause}
                          className='text-white hover:text-blue-400 transition'
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? (
                            <Pause className='w-5 h-5 sm:w-6 sm:h-6 fill-current' />
                          ) : (
                            <Play className='w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5' />
                          )}
                        </button>
                        <span className='text-white text-xs sm:text-sm font-medium'>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <div className='flex items-center gap-2 ml-auto'>
                          <button
                            onClick={toggleMute}
                            className='text-white hover:text-blue-400 transition hidden sm:block'
                            aria-label={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted ? (
                              <VolumeX className='w-5 h-5 sm:w-6 sm:h-6' />
                            ) : (
                              <Volume2 className='w-5 h-5 sm:w-6 sm:h-6' />
                            )}
                          </button>
                          <input
                            type='range'
                            min='0'
                            max='1'
                            step='0.1'
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className='w-16 sm:w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 hidden sm:block'
                            aria-label='Volume'
                          />
                        </div>
                        <button
                          onClick={toggleFullscreen}
                          className='text-white hover:text-blue-400 transition'
                          aria-label={
                            isFullscreen
                              ? "Exit fullscreen"
                              : "Enter fullscreen"
                          }
                        >
                          <Maximize className='w-5 h-5 sm:w-6 sm:h-6' />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tape navigator now points to allVideos.length */}
                  <MediaNav
                    current={currentTapeIndex}
                    total={allVideos.length}
                    label='All Submissions'
                    onPrev={() =>
                      setCurrentTapeIndex((i) => Math.max(0, i - 1))
                    }
                    onNext={() =>
                      setCurrentTapeIndex((i) =>
                        Math.min(allVideos.length - 1, i + 1),
                      )
                    }
                  />
                </>
              ) : (
                <div className='w-full h-120 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400'>
                  No video available
                </div>
              )}

              {/* Actor info + actions */}
              <div className='bg-white flex items-center justify-between mt-2'>
                <div className='mt-6 rounded-lg p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-4'>
                    {activeTape?.name ?? "—"}
                  </h3>
                  <div className='flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base'>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <MapPin />
                      {activeTape?.location ?? "—"}
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Ruler /> {activeTape?.height ?? "—"}&apos;
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <span>👤</span>{" "}
                      {activeTape
                        ? `${activeTape.gender} · ${activeTape.role}`
                        : "—"}
                    </div>
                  </div>
                </div>
                {/* <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                  <button
                    onClick={() => setShowShortlistConfirm(true)}
                    className='px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-medium'
                  >
                    Shortlists
                  </button>
                  <button
                    onClick={() => setShowRejectConfirm(true)}
                    className='px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-600 hover:text-red-600 transition font-medium'
                  >
                    Reject
                  </button>
                </div> */}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className='space-y-6'>
              {/* Profile card with image navigator */}
              <div className='bg-white rounded-lg overflow-hidden shadow'>
                <div className='relative w-full h-48 bg-gray-100'>
                  {currentImageSrc ? (
                    <Image
                      key={currentImageSrc} // Key helps React handle the transition
                      src={currentImageSrc}
                      alt='Talent Photo'
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-400 text-sm'>
                      No image
                    </div>
                  )}
                </div>
                <div className='px-4 pb-3 pt-3'>
                  <h3 className='text-lg font-bold text-gray-900'>
                    {/* Show the name of the talent the current image belongs to */}
                    {currentImageData?.talent?.name ?? "—"}
                  </h3>
                  <MediaNav
                    current={currentImageIndex}
                    total={allImages.length}
                    label='All Photos'
                    onPrev={() =>
                      setCurrentImageIndex((i) => Math.max(0, i - 1))
                    }
                    onNext={() =>
                      setCurrentImageIndex((i) =>
                        Math.min(allImages.length - 1, i + 1),
                      )
                    }
                  />
                </div>
              </div>

              {/* Booking Details */}
              <div className='bg-white rounded-lg shadow p-4 sm:p-6'>
                <h3 className='text-lg font-bold text-blue-600 mb-4'>
                  Booking Details
                </h3>
                <div className='space-y-4'>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='text-gray-600'>Project:</span>
                    <span className='text-gray-900 font-medium text-right max-w-[60%]'>
                      {job?.title ?? "—"}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='text-gray-600'>Role:</span>
                    <span className='text-gray-900 font-medium text-right capitalize'>
                      {activeTape?.role ?? job?.job_type ?? "—"}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='text-gray-600'>Shoot Date:</span>
                    <span className='text-gray-900 font-medium text-right'>
                      {job?.ai_result?.shoot_date?.[0] ?? "TBD"}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='text-gray-600'>Location:</span>
                    <span className='text-gray-900 font-medium text-right'>
                      {job?.location ?? "—"}
                    </span>
                  </div>
                  <div className='flex justify-between pt-4 border-t border-gray-200 text-sm sm:text-base'>
                    <span className='text-gray-600 font-medium'>Budget:</span>
                    <span className='text-gray-900 font-bold'>
                      ${job?.budget_min} – ${job?.budget_max}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Booking */}
              {/* <button
                onClick={() => setShowConfirmBooking(true)}
                disabled={bookingConfirmed}
                className={`w-full py-3 rounded-lg font-bold text-white transition text-sm sm:text-base ${
                  bookingConfirmed
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {bookingConfirmed ? "Booking Confirmed ✓" : "Confirm Booking"}
              </button> */}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {(showShortlistConfirm ||
        showRejectConfirm ||
        (showConfirmBooking && !bookingConfirmed)) && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                {showShortlistConfirm
                  ? "Add to Shortlist?"
                  : showRejectConfirm
                    ? "Reject Candidate?"
                    : "Confirm Booking?"}
              </h2>
              <button
                onClick={() => {
                  setShowShortlistConfirm(false);
                  setShowRejectConfirm(false);
                  setShowConfirmBooking(false);
                }}
                className='text-gray-500 hover:text-gray-700 transition'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <p className='text-gray-600 text-sm sm:text-base'>
              {showShortlistConfirm
                ? `Add ${activeTape?.name} to your shortlist for further consideration?`
                : showRejectConfirm
                  ? `Are you sure you want to reject ${activeTape?.name}?`
                  : `Confirm booking for ${activeTape?.name} as ${
                      activeTape?.role ?? job?.job_type
                    }. Location: ${job?.location}`}
            </p>

            <div className='flex gap-3 pt-4'>
              <button
                onClick={() => {
                  setShowShortlistConfirm(false);
                  setShowRejectConfirm(false);
                  setShowConfirmBooking(false);
                }}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm sm:text-base'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!showConfirmBooking) {
                    alert(
                      showShortlistConfirm
                        ? `${activeTape?.name} added to shortlist!`
                        : `${activeTape?.name} rejected!`,
                    );
                  } else {
                    setBookingConfirmed(true);
                  }
                  setShowShortlistConfirm(false);
                  setShowRejectConfirm(false);
                  setShowConfirmBooking(false);
                }}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
