"use client";

import { useEffect, useRef } from "react";
import type { RemoteUser } from "@/types/ecasting";

// ─── Local Video Tile ──────────────────────────────────────────────────────────

interface LocalVideoTileProps {
  videoTrack: unknown | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  label?: string;
}

export function LocalVideoTile({
  videoTrack,
  isCameraOn,
  isMicOn,
  label = "You (Host)",
}: LocalVideoTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoTrack || !containerRef.current) return;
    const track = videoTrack as {
      play: (el: HTMLDivElement) => void;
      stop: () => void;
    };
    track.play(containerRef.current);
    return () => track.stop();
  }, [videoTrack]);

  return (
    <div className='relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group'>
      {/* Video container */}
      <div
        ref={containerRef}
        className='absolute inset-0 w-full h-full'
        style={{ display: isCameraOn ? "block" : "none" }}
      />

      {/* Camera off placeholder */}
      {!isCameraOn && (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-zinc-900'>
          <div className='w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-2'>
            <CameraOffIcon />
          </div>
          <span className='text-zinc-500 text-sm'>Camera off</span>
        </div>
      )}

      {/* Bottom bar */}
      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <span className='text-white text-xs font-medium tracking-wide'>
          {label}
        </span>
        <div className='flex items-center gap-2'>
          {!isMicOn && (
            <span className='bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1'>
              <MicOffIcon size={10} />
              Muted
            </span>
          )}
        </div>
      </div>

      {/* Always-visible label pill */}
      <div className='absolute top-2 left-2'>
        <span className='bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm'>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Remote Video Tile ─────────────────────────────────────────────────────────

interface RemoteVideoTileProps {
  user: RemoteUser;
  label?: string;
}

export function RemoteVideoTile({ user, label }: RemoteVideoTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user.videoTrack || !containerRef.current || !user.hasVideo) return;
    const track = user.videoTrack as {
      play: (el: HTMLDivElement) => void;
      stop: () => void;
    };
    track.play(containerRef.current);
    return () => track.stop();
  }, [user.videoTrack, user.hasVideo]);

  return (
    <div className='relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group'>
      {/* Video */}
      <div
        ref={containerRef}
        className='absolute inset-0 w-full h-full'
        style={{ display: user.hasVideo ? "block" : "none" }}
      />

      {/* No video placeholder */}
      {!user.hasVideo && (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-zinc-900'>
          <div className='w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-2'>
            <span className='text-2xl text-zinc-500'>
              {label ? label[0].toUpperCase() : "?"}
            </span>
          </div>
          <span className='text-zinc-500 text-sm'>
            {label ?? `User ${user.uid}`}
          </span>
        </div>
      )}

      {/* Bottom bar */}
      <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <span className='text-white text-xs font-medium tracking-wide'>
          {label ?? `User ${user.uid}`}
        </span>
        {!user.hasAudio && (
          <span className='bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1'>
            <MicOffIcon size={10} />
            Muted
          </span>
        )}
      </div>

      {/* Label pill */}
      <div className='absolute top-2 left-2'>
        <span className='bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm'>
          {label ?? `User ${user.uid}`}
        </span>
      </div>
    </div>
  );
}

// ─── Inline SVG Icons ──────────────────────────────────────────────────────────

function CameraOffIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='text-zinc-400'
    >
      <line x1='1' y1='1' x2='23' y2='23' />
      <path d='M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.72 7.72' />
    </svg>
  );
}

function MicOffIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='1' y1='1' x2='23' y2='23' />
      <path d='M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6' />
      <path d='M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23' />
      <line x1='12' y1='19' x2='12' y2='23' />
      <line x1='8' y1='23' x2='16' y2='23' />
    </svg>
  );
}
