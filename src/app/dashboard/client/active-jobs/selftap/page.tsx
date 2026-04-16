"use client";

import type React from "react";

import { useState, useRef, useEffect, use } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useGetActiveJobDetailsQuery } from "@/redux/features/active-jobs/activeJobsAPI";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video player states
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

  // Modal states
  const [showShortlistConfirm, setShowShortlistConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const jobId = params?.id as string;

  const { data: response, isLoading } = useGetActiveJobDetailsQuery(jobId, {
    skip: !jobId,
  });

  console.log({ response });

  // Actor and booking data
  const [actorData] = useState({
    name: "Marcus Johnson",
    location: "New York",
    height: "6.2",
    age: "32",
    gender: "Male",
  });

  const [bookingDetails] = useState({
    project: "Luxury Watch Advertisement",
    role: "Lead Model",
    shootDate: "January 25, 2026",
    location: "Miami, FL",
    rate: "$10,000",
  });

  // Video controls handlers
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (isPlaying && isFullscreen) {
      const timeout = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle keyboard shortcuts
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

  return (
    <div className='min-h-screen bg-transparent'>
      {/* Header */}
      <header className='bg-transparent'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <button
                onClick={() => router.back()}
                className='items-center gap-2 bg-white inline-flex mx-auto px-3 py-2.5 border rounded-xl! text-[#404145] hover:text-[#000000] transition font-medium cursor-pointer'
              >
                <ArrowLeft className='w-5 h-5' />
                Back
              </button>
            </div>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                E-Casting Room
              </h1>
              <p className='text-gray-600 text-sm sm:text-base'>
                Tech Startup Commercial - Review Session
              </p>
            </div>
            {/* <div className='w-12'></div> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Video Player Section */}
          <div className='bg-white lg:col-span-2 p-4 rounded-xl'>
            <div
              ref={containerRef}
              className={`relative bg-black rounded-lg overflow-hidden group ${
                isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
              }`}
              onMouseMove={handleMouseMove}
            >
              <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className={`w-full ${
                  isFullscreen ? "h-screen" : "h-120"
                } object-cover`}
                src='/video.mp4'
              />

              {/* Play Button Overlay */}
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

              {/* Video Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/50 to-transparent pt-12 pb-3 sm:pb-4 px-3 sm:px-4 transition-opacity duration-300 ${
                  isFullscreen && !showControls && isPlaying
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              >
                {/* Progress Bar */}
                <input
                  type='range'
                  min='0'
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className='w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:h-2 transition-all'
                  aria-label='Video progress'
                />

                {/* Controls Row */}
                <div className='flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4'>
                  {/* Play/Pause */}
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

                  {/* Time Display */}
                  <span className='text-white text-xs sm:text-sm font-medium'>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Volume Controls */}
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

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className='text-white hover:text-blue-400 transition'
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    <Maximize className='w-5 h-5 sm:w-6 sm:h-6' />
                  </button>
                </div>
              </div>
            </div>

            <div className='bg-white flex items-center justify-between'>
              {/* Actor Info Below Video */}
              <div className='mt-6  rounded-lg p-4 sm:p-6'>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-4'>
                  {actorData.name}
                </h3>
                <div className='flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <span>📍</span> {actorData.location}
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <span>📏</span> {actorData.height}&apos;
                  </div>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <span>👤</span> {actorData.gender} {actorData.age}
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-3 mt-6'>
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
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking Details */}
          <div className='space-y-6'>
            {/* Profile Card */}
            <div className='bg-white rounded-lg overflow-hidden shadow'>
              <Image
                src='/man.png'
                alt={actorData.name}
                width={400}
                height={300}
                className='w-full h-48 object-cover'
              />
              <div className='p-4'>
                <h3 className='text-lg font-bold text-gray-900'>
                  {actorData.name}
                </h3>
              </div>
            </div>

            {/* Booking Details Card */}
            <div className='bg-white rounded-lg shadow p-4 sm:p-6'>
              <h3 className='text-lg font-bold text-blue-600 mb-4'>
                Booking Details
              </h3>
              <div className='space-y-4'>
                <div className='flex justify-between text-sm sm:text-base'>
                  <span className='text-gray-600'>Project:</span>
                  <span className='text-gray-900 font-medium text-right'>
                    {bookingDetails.project}
                  </span>
                </div>
                <div className='flex justify-between text-sm sm:text-base'>
                  <span className='text-gray-600'>Role:</span>
                  <span className='text-gray-900 font-medium text-right'>
                    {bookingDetails.role}
                  </span>
                </div>
                <div className='flex justify-between text-sm sm:text-base'>
                  <span className='text-gray-600'>Shoot Date:</span>
                  <span className='text-gray-900 font-medium text-right'>
                    {bookingDetails.shootDate}
                  </span>
                </div>
                <div className='flex justify-between text-sm sm:text-base'>
                  <span className='text-gray-600'>Location:</span>
                  <span className='text-gray-900 font-medium text-right'>
                    {bookingDetails.location}
                  </span>
                </div>
                <div className='flex justify-between pt-4 border-t border-gray-200 text-sm sm:text-base'>
                  <span className='text-gray-600 font-medium'>Rate:</span>
                  <span className='text-gray-900 font-bold'>
                    {bookingDetails.rate}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Booking Button */}
            <button
              onClick={() => setShowConfirmBooking(true)}
              disabled={bookingConfirmed}
              className={`w-full py-3 rounded-lg font-bold text-white transition text-sm sm:text-base ${
                bookingConfirmed
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {bookingConfirmed ? "Booking Confirmed ✓" : "Confirm Booking"}
            </button>
          </div>
        </div>
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
                ? `Add ${actorData.name} to your shortlist for further consideration?`
                : showRejectConfirm
                  ? `Are you sure you want to reject ${actorData.name}?`
                  : `Confirm booking for ${actorData.name} as ${bookingDetails.role}. Shoot date: ${bookingDetails.shootDate}`}
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
                  if (showShortlistConfirm) {
                    alert(`${actorData.name} added to shortlist!`);
                  } else if (showRejectConfirm) {
                    alert(`${actorData.name} rejected!`);
                  } else {
                    setBookingConfirmed(true);
                    setShowConfirmBooking(false);
                  }
                  setShowShortlistConfirm(false);
                  setShowRejectConfirm(false);
                }}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base'
              >
                {showConfirmBooking && !bookingConfirmed
                  ? "Confirm"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
