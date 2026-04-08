"use client";

import { useState } from "react";

interface ControlBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isHost: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
  sessionId: string;
}

export function ControlBar({
  isMicOn,
  isCameraOn,
  isHost,
  onToggleMic,
  onToggleCamera,
  onLeave,
  sessionId,
}: ControlBarProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const link = `${window.location.origin}/ecasting/join/${sessionId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='flex items-center justify-between px-6 py-4 bg-zinc-950 border-t border-zinc-800'>
      {/* Left: session info */}
      <div className='flex items-center gap-3 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
          <span className='text-xs text-zinc-400 font-mono truncate max-w-[140px]'>
            {sessionId.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Center: main controls */}
      <div className='flex items-center gap-3'>
        {/* Mic toggle */}
        <ControlButton
          label={isMicOn ? "Mute" : "Unmute"}
          active={isMicOn}
          onClick={onToggleMic}
          icon={isMicOn ? <MicOnIcon /> : <MicOffIcon />}
        />

        {/* Camera toggle — host only */}
        {isHost && (
          <ControlButton
            label={isCameraOn ? "Stop Video" : "Start Video"}
            active={isCameraOn}
            onClick={onToggleCamera}
            icon={isCameraOn ? <VideoOnIcon /> : <VideoOffIcon />}
          />
        )}

        {/* Leave */}
        <button
          onClick={onLeave}
          className='flex flex-col items-center gap-1 group'
          title='Leave'
        >
          <span className='w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors duration-150'>
            <PhoneOffIcon />
          </span>
          <span className='text-xs text-zinc-500 group-hover:text-red-400 transition-colors'>
            Leave
          </span>
        </button>
      </div>

      {/* Right: invite link */}
      <div className='flex items-center gap-2'>
        <button
          onClick={copyLink}
          className='flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 transition-all duration-150'
        >
          <LinkIcon />
          {copied ? "Copied!" : "Invite Link"}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface ControlButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

function ControlButton({ label, active, onClick, icon }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className='flex flex-col items-center gap-1 group'
      title={label}
    >
      <span
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-150
          ${
            active
              ? "bg-zinc-700 hover:bg-zinc-600"
              : "bg-red-900/60 hover:bg-red-800/80"
          }`}
      >
        {icon}
      </span>
      <span className='text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors'>
        {label}
      </span>
    </button>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function MicOnIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' />
      <path d='M19 10v2a7 7 0 0 1-14 0v-2' />
      <line x1='12' y1='19' x2='12' y2='23' />
      <line x1='8' y1='23' x2='16' y2='23' />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='white'
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

function VideoOnIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <polygon points='23 7 16 12 23 17 23 7' />
      <rect x='1' y='5' width='15' height='14' rx='2' ry='2' />
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10' />
      <line x1='1' y1='1' x2='23' y2='23' />
    </svg>
  );
}

function PhoneOffIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07' />
      <path d='M14.5 9.5a2 2 0 0 0-2-2' />
      <line x1='1' y1='1' x2='23' y2='23' />
      <path d='M5.59 5.59A13.83 13.83 0 0 0 2.11 9.5a2 2 0 0 0 1.72 2 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 .45 2.11L5.82 15.6' />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
      <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
    </svg>
  );
}
