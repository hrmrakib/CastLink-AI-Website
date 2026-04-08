"use client";

/**
 * ZegoCallRoom
 *
 * Drop-in call UI component. Mount it on any page/route to start a call.
 *
 * Props:
 *   user    - The currently logged-in user
 *   roomId  - Unique room identifier (e.g. "call_123")
 *   scenario - Call type (default: OneONoneCall)
 *   onLeave - Called when user leaves the call
 */

import { useEffect, useRef } from "react";

import { ZegoUser } from "@/config/ZegoCallConfig";
import { useZegoCall } from "@/hooks/zego/useZegoCall";

type CallScenario = "OneONoneCall" | "GroupCall" | "VideoConference";

interface ZegoCallRoomProps {
  user: ZegoUser;
  roomId: string;
  scenario?: CallScenario;
  onLeave?: () => void;
}

export default function ZegoCallRoom({
  user,
  roomId,
  scenario = "OneONoneCall",
  onLeave,
}: ZegoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, isInCall, error, joinCall, leaveCall } =
    useZegoCall(user);

  // Auto-join once the service is ready and container is mounted
  useEffect(() => {
    if (!isInitialized || !containerRef.current || isInCall) return;

    joinCall(containerRef.current, roomId, scenario, onLeave);
  }, [isInitialized, isInCall, joinCall, roomId, scenario, onLeave]);

  const handleLeave = () => {
    leaveCall();
    onLeave?.();
  };

  return (
    <div className='relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl shadow-black/60'>
      {/* ── Status bar ── */}
      <div className='absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 py-3'>
        <div className='flex items-center gap-2'>
          <span
            className={`h-2 w-2 rounded-full ${
              isInCall ? "animate-pulse bg-emerald-400" : "bg-zinc-500"
            }`}
          />
          <span className='text-xs font-medium tracking-widest text-white/70 uppercase'>
            {isInCall
              ? "Live"
              : isInitialized
                ? "Connecting…"
                : "Initializing…"}
          </span>
        </div>
        <span className='rounded-md bg-white/10 px-2 py-1 text-xs text-white/50 font-mono'>
          Room: {roomId}
        </span>
      </div>

      {/* ── Zego call mount target ── */}
      <div
        ref={containerRef}
        className='h-full w-full'
        id={`zego-call-container-${roomId}`}
      />

      {/* ── Loading overlay ── */}
      {!isInCall && !error && (
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 backdrop-blur-sm'>
          <div className='relative flex h-16 w-16 items-center justify-center'>
            <div className='absolute inset-0 animate-ping rounded-full bg-indigo-500/30' />
            <div className='h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400' />
          </div>
          <p className='text-sm text-zinc-400'>
            {isInitialized ? "Joining call…" : "Setting up…"}
          </p>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-zinc-950/95 p-8 text-center backdrop-blur-sm'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10'>
            <svg
              className='h-7 w-7 text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
              />
            </svg>
          </div>
          <div>
            <p className='text-sm font-medium text-white'>Connection Failed</p>
            <p className='mt-1 text-xs text-zinc-500'>{error}</p>
          </div>
          <button
            onClick={handleLeave}
            className='rounded-lg bg-zinc-800 px-5 py-2 text-sm text-white hover:bg-zinc-700 transition-colors'
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Leave button (shown when in call) ── */}
      {isInCall && (
        <div className='absolute bottom-6 left-0 right-0 z-20 flex justify-center'>
          <button
            onClick={handleLeave}
            className='flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-900/40 hover:bg-red-600 active:scale-95 transition-all'
          >
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M6.62 10.79a15.1 15.1 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C7.61 21 3 16.39 3 10a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01L6.62 10.79z' />
            </svg>
            Leave Call
          </button>
        </div>
      )}
    </div>
  );
}
