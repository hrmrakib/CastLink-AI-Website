"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import Image from "next/image";

const Page = () => {
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
    null
  );

  // Modal states
  const [showShortlistConfirm, setShowShortlistConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
          <div className='flex items-center justify-between'>
            <button className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition font-medium'>
              <span>←</span> Back
            </button>
            <div className='text-center flex-1'>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                E-Casting Room
              </h1>
              <p className='text-gray-600 text-sm sm:text-base'>
                Tech Startup Commercial - Review Session
              </p>
            </div>
            <div className='w-12'></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Video Player Section */}
          <div className='lg:col-span-2'>
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
                  isFullscreen ? "h-screen" : "h-100"
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

            {/* Actor Info Below Video */}
            <div className='mt-6 bg-white rounded-lg p-4 sm:p-6'>
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
                src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop'
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

// "use client";

// import type React from "react";

// import { useState, useRef } from "react";
// import {
//   ArrowLeft,
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   Maximize,
//   X,
// } from "lucide-react";
// import Image from "next/image";

// interface BookingDetails {
//   project: string;
//   role: string;
//   shootDate: string;
//   location: string;
//   rate: string;
// }

// export default function Page() {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [volume, setVolume] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showShortlistConfirm, setShowShortlistConfirm] = useState(false);
//   const [showRejectConfirm, setShowRejectConfirm] = useState(false);
//   const [bookingConfirmed, setBookingConfirmed] = useState(false);

//   const actorData = {
//     name: "Marcus Johnson",
//     location: "New York",
//     height: "6'2\"",
//     age: "Male 32",
//     image: "/man.png",
//   };

//   const bookingDetails: BookingDetails = {
//     project: "Luxury Watch Advertisement",
//     role: "Lead Model",
//     shootDate: "January 25, 2026",
//     location: "Miami, FL",
//     rate: "$10,000",
//   };

//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const handleTimeUpdate = () => {
//     if (videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//     }
//   };

//   const handleLoadedMetadata = () => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration);
//     }
//   };

//   const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newTime = Number.parseFloat(e.target.value);
//     if (videoRef.current) {
//       videoRef.current.currentTime = newTime;
//       setCurrentTime(newTime);
//     }
//   };

//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newVolume = Number.parseFloat(e.target.value);
//     setVolume(newVolume);
//     if (videoRef.current) {
//       videoRef.current.volume = newVolume;
//     }
//     if (newVolume > 0) {
//       setIsMuted(false);
//     }
//   };

//   const toggleMute = () => {
//     if (videoRef.current) {
//       if (isMuted) {
//         videoRef.current.volume = volume;
//         setIsMuted(false);
//       } else {
//         videoRef.current.volume = 0;
//         setIsMuted(true);
//       }
//     }
//   };

//   const toggleFullscreen = () => {
//     const videoContainer = document.querySelector(".video-container");
//     if (videoContainer) {
//       if (!isFullscreen) {
//         if (videoContainer.requestFullscreen) {
//           videoContainer.requestFullscreen();
//         }
//       } else {
//         if (document.fullscreenElement) {
//           document.exitFullscreen();
//         }
//       }
//       setIsFullscreen(!isFullscreen);
//     }
//   };

//   const formatTime = (time: number) => {
//     if (isNaN(time)) return "0:00";
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
//   };

//   return (
//     <div className='min-h-screen bg-gray-50'>
//       {/* Header */}
//       <header className='bg-white border-b border-gray-200'>
//         <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
//           <div className='flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between'>
//             <button className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition w-fit'>
//               <ArrowLeft className='w-5 h-5' />
//               <span className='text-sm md:text-base font-medium'>Back</span>
//             </button>
//             <div className='flex flex-col gap-1'>
//               <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
//                 E-Casting Room
//               </h1>
//               <p className='text-sm md:text-base text-gray-600'>
//                 Tech Startup Commercial - Review Session
//               </p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8'>
//         <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8'>
//           {/* Left Column - Video Player */}
//           <div className='lg:col-span-2'>
//             <div className='video-container bg-gray-900 rounded-xl overflow-hidden shadow-lg'>
//               <video
//                 ref={videoRef}
//                 className='w-full bg-black'
//                 onTimeUpdate={handleTimeUpdate}
//                 onLoadedMetadata={handleLoadedMetadata}
//                 onEnded={() => setIsPlaying(false)}
//               >
//                 <source src='/placeholder-video.mp4' type='video/mp4' />
//                 Your browser does not support the video tag.
//               </video>

//               {/* Video Controls */}
//               <div className='bg-linear-to-t from-black via-transparent to-transparent p-4 md:p-6 -mt-24 pt-24'>
//                 {/* Progress Bar */}
//                 <div className='flex items-center gap-2 mb-4'>
//                   <input
//                     type='range'
//                     min='0'
//                     max={duration || 0}
//                     value={currentTime}
//                     onChange={handleProgressChange}
//                     className='flex-1 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-600'
//                   />
//                 </div>

//                 {/* Controls Bottom */}
//                 <div className='flex items-center justify-between'>
//                   <div className='flex items-center gap-4'>
//                     {/* Play/Pause Button */}
//                     <button
//                       onClick={togglePlay}
//                       className='shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition'
//                     >
//                       {isPlaying ? (
//                         <Pause className='w-5 h-5' />
//                       ) : (
//                         <Play className='w-5 h-5 ml-0.5' />
//                       )}
//                     </button>

//                     {/* Time Display */}
//                     <div className='flex items-center gap-1 text-white text-sm'>
//                       <span>{formatTime(currentTime)}</span>
//                       <span className='text-white/60'>/</span>
//                       <span>{formatTime(duration)}</span>
//                     </div>

//                     {/* Volume Control */}
//                     <div className='flex items-center gap-2 ml-auto md:ml-0'>
//                       <button
//                         onClick={toggleMute}
//                         className='text-white hover:text-gray-300 transition'
//                       >
//                         {isMuted || volume === 0 ? (
//                           <VolumeX className='w-5 h-5' />
//                         ) : (
//                           <Volume2 className='w-5 h-5' />
//                         )}
//                       </button>
//                       <input
//                         type='range'
//                         min='0'
//                         max='1'
//                         step='0.1'
//                         value={isMuted ? 0 : volume}
//                         onChange={handleVolumeChange}
//                         className='w-16 md:w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-600'
//                       />
//                     </div>
//                   </div>

//                   {/* Fullscreen Button */}
//                   <button
//                     onClick={toggleFullscreen}
//                     className='text-white hover:text-gray-300 transition shrink-0'
//                   >
//                     <Maximize className='w-5 h-5' />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Actor Info and Action Buttons */}
//             <div className='mt-6 space-y-4'>
//               <div className='flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between'>
//                 <div>
//                   <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-2'>
//                     {actorData.name}
//                   </h2>
//                   <div className='flex flex-col gap-2 text-gray-600 text-sm'>
//                     <div className='flex items-center gap-2'>
//                       <span>📍 {actorData.location}</span>
//                     </div>
//                     <div className='flex items-center gap-4'>
//                       <span>📏 {actorData.height}</span>
//                       <span>👤 {actorData.age}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className='flex gap-3 w-full md:w-auto'>
//                   <button
//                     onClick={() => setShowShortlistConfirm(true)}
//                     className='flex-1 md:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
//                   >
//                     Shortlists
//                   </button>
//                   <button
//                     onClick={() => setShowRejectConfirm(true)}
//                     className='flex-1 md:flex-none px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
//                   >
//                     Reject
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Booking Details */}
//           <div className='space-y-6'>
//             {/* Profile Card */}
//             <div className='bg-white rounded-xl overflow-hidden shadow-md'>
//               <Image
//                 src='/man.png'
//                 width={400}
//                 height={300}
//                 alt={actorData.name}
//                 className='w-full h-48 object-cover rounded-t-xl'
//               />
//               <div className='p-4 md:p-6'>
//                 <h3 className='text-lg md:text-xl font-bold text-gray-900'>
//                   {actorData.name}
//                 </h3>
//               </div>
//             </div>

//             {/* Booking Details */}
//             <div className='bg-white rounded-xl shadow-md p-4 md:p-6'>
//               <h3 className='text-lg font-bold text-blue-600 mb-4'>
//                 Booking Details
//               </h3>
//               <div className='space-y-4'>
//                 <div className='flex justify-between'>
//                   <span className='text-gray-600'>Project:</span>
//                   <span className='text-gray-900 font-medium text-right'>
//                     {bookingDetails.project}
//                   </span>
//                 </div>
//                 <div className='flex justify-between'>
//                   <span className='text-gray-600'>Role:</span>
//                   <span className='text-gray-900 font-medium text-right'>
//                     {bookingDetails.role}
//                   </span>
//                 </div>
//                 <div className='flex justify-between'>
//                   <span className='text-gray-600'>Shoot Date:</span>
//                   <span className='text-gray-900 font-medium text-right'>
//                     {bookingDetails.shootDate}
//                   </span>
//                 </div>
//                 <div className='flex justify-between'>
//                   <span className='text-gray-600'>Location:</span>
//                   <span className='text-gray-900 font-medium text-right'>
//                     {bookingDetails.location}
//                   </span>
//                 </div>
//                 <div className='flex justify-between pt-4 border-t border-gray-200'>
//                   <span className='text-gray-600 font-medium'>Rate:</span>
//                   <span className='text-gray-900 font-bold'>
//                     {bookingDetails.rate}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Confirm Booking Button */}
//             <button
//               onClick={() => setBookingConfirmed(true)}
//               disabled={bookingConfirmed}
//               className={`w-full py-3 rounded-lg font-bold text-white transition ${
//                 bookingConfirmed
//                   ? "bg-green-600 hover:bg-green-700"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {bookingConfirmed ? "Booking Confirmed ✓" : "Confirm Booking"}
//             </button>
//           </div>
//         </div>
//       </main>

//       {/* Confirmation Modals */}
//       {(showShortlistConfirm || showRejectConfirm || bookingConfirmed) && (
//         <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
//           <div className='bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4'>
//             <div className='flex items-center justify-between'>
//               <h2 className='text-xl font-bold text-gray-900'>
//                 {showShortlistConfirm
//                   ? "Add to Shortlist?"
//                   : showRejectConfirm
//                   ? "Reject Candidate?"
//                   : "Booking Confirmed!"}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowShortlistConfirm(false);
//                   setShowRejectConfirm(false);
//                   setBookingConfirmed(false);
//                 }}
//                 className='text-gray-500 hover:text-gray-700'
//               >
//                 <X className='w-5 h-5' />
//               </button>
//             </div>

//             <p className='text-gray-600'>
//               {showShortlistConfirm
//                 ? `Add ${actorData.name} to your shortlist for further consideration?`
//                 : showRejectConfirm
//                 ? `Are you sure you want to reject ${actorData.name}?`
//                 : `Booking confirmed for ${actorData.name} as ${bookingDetails.role}. Shoot date: ${bookingDetails.shootDate}`}
//             </p>

//             <div className='flex gap-3 pt-4'>
//               {bookingConfirmed ? (
//                 <button
//                   onClick={() => setBookingConfirmed(false)}
//                   className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium'
//                 >
//                   Close
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => {
//                       setShowShortlistConfirm(false);
//                       setShowRejectConfirm(false);
//                     }}
//                     className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (showShortlistConfirm) {
//                         alert(`${actorData.name} added to shortlist!`);
//                       } else {
//                         alert(`${actorData.name} rejected!`);
//                       }
//                       setShowShortlistConfirm(false);
//                       setShowRejectConfirm(false);
//                     }}
//                     className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium'
//                   >
//                     Confirm
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
