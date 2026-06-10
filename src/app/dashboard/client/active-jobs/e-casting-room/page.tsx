/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client";

import { useCreateSessionMutation } from "@/redux/features/e-casting/eCastingRoomAPI";
import { useGetRecordingQuery } from "@/redux/features/recording/recordingAPI";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Meeting {
  id: string;
  title: string;
  scheduledAt?: string;
  participants: string[];
  status: "live" | "scheduled" | "ended";
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const VideoIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2.2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-7 h-7'
  >
    <path d='M15 10l4.553-2.553A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14' />
    <rect x='3' y='6' width='12' height='12' rx='2' />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2.5}
    strokeLinecap='round'
    className='w-7 h-7'
  >
    <line x1='12' y1='5' x2='12' y2='19' />
    <line x1='5' y1='12' x2='19' y2='12' />
  </svg>
);

const CalendarIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2.2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-7 h-7'
  >
    <rect x='3' y='4' width='18' height='18' rx='2' />
    <line x1='16' y1='2' x2='16' y2='6' />
    <line x1='8' y1='2' x2='8' y2='6' />
    <line x1='3' y1='10' x2='21' y2='10' />
    <line x1='8' y1='14' x2='8' y2='14' strokeWidth={3} strokeLinecap='round' />
    <line
      x1='12'
      y1='14'
      x2='12'
      y2='14'
      strokeWidth={3}
      strokeLinecap='round'
    />
    <line
      x1='16'
      y1='14'
      x2='16'
      y2='14'
      strokeWidth={3}
      strokeLinecap='round'
    />
    <line x1='8' y1='18' x2='8' y2='18' strokeWidth={3} strokeLinecap='round' />
    <line
      x1='12'
      y1='18'
      x2='12'
      y2='18'
      strokeWidth={3}
      strokeLinecap='round'
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-4 h-4'
  >
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    className='w-5 h-5'
  >
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
);

const MicIcon = ({ off }: { off?: boolean }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-5 h-5'
  >
    {off && <line x1='2' y1='2' x2='22' y2='22' />}
    <rect x='9' y='2' width='6' height='11' rx='3' />
    <path d='M5 10a7 7 0 0014 0' />
    <line x1='12' y1='19' x2='12' y2='22' />
    <line x1='9' y1='22' x2='15' y2='22' />
  </svg>
);

const CamIcon = ({ off }: { off?: boolean }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-5 h-5'
  >
    {off && <line x1='2' y1='2' x2='22' y2='22' />}
    <path d='M15 10l4.553-2.553A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14' />
    <rect x='3' y='6' width='12' height='12' rx='2' />
  </svg>
);

const PhoneOffIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-5 h-5'
  >
    <path d='M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c1.12.45 2.3.77 3.53.9a2 2 0 011.8 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.07 8.63 19.79 19.79 0 01.1 4.45A2 2 0 012.09 2.27L5 2.27a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11z' />
    <line x1='2' y1='2' x2='22' y2='22' />
  </svg>
);

const CopyIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-4 h-4'
  >
    <rect x='9' y='9' width='13' height='13' rx='2' />
    <path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1' />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2.5}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-4 h-4'
  >
    <polyline points='20 6 9 17 4 12' />
  </svg>
);

const UsersIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-4 h-4'
  >
    <path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' />
  </svg>
);

// ─── Utilities ────────────────────────────────────────────────────────────────
const generateMeetingId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const segment = (len: number) =>
    Array.from(
      { length: len },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${segment(4)}-${segment(4)}-${segment(4)}`;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

// ─── Modal Backdrop ───────────────────────────────────────────────────────────
const Backdrop = ({ onClose }: { onClose: () => void }) => (
  <div
    className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn'
    onClick={onClose}
  />
);

// ─── New Meeting Modal ────────────────────────────────────────────────────────
const NewMeetingModal = ({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (meeting: Meeting) => void;
}) => {
  const meetingId = useRef(generateMeetingId());
  const [title, setTitle] = useState(
    "Tech Startup Commercial - Review Session",
  );
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(0);
  const [starting, setStarting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId.current).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => {
      onStart({
        id: meetingId.current,
        title,
        participants: ["You"],
        status: "live",
      });
    }, 600);
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
        <div className='bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slideUp overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between px-5 pt-5 pb-3'>
            <h2 className='text-[15px] font-semibold text-slate-800 tracking-tight'>
              New Meeting
            </h2>
            <button
              onClick={onClose}
              className='p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors'
            >
              <CloseIcon />
            </button>
          </div>

          <div className='px-5 pb-6 space-y-4'>
            {/* Camera preview placeholder */}
            <div className='bg-slate-900 rounded-xl h-40 flex items-center justify-center relative overflow-hidden'>
              {camOn ? (
                <div className='text-slate-400 text-sm flex flex-col items-center gap-2'>
                  <div className='w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold'>
                    Y
                  </div>
                  <span className='text-xs text-slate-500'>Camera preview</span>
                </div>
              ) : (
                <div className='text-slate-400 text-sm flex flex-col items-center gap-2'>
                  <div className='w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400'>
                    <CamIcon off />
                  </div>
                  <span className='text-xs'>Camera is off</span>
                </div>
              )}
              {/* Live badge */}
              <div className='absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1'>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${micOn ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}
                />
                <span className='text-[10px] text-white'>
                  {micOn ? "Mic On" : "Muted"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className='flex gap-2 justify-center'>
              <button
                onClick={() => setMicOn((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  micOn
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-red-50 text-red-500 hover:bg-red-100"
                }`}
              >
                <MicIcon off={!micOn} />
                {micOn ? "Mute" : "Unmute"}
              </button>
              <button
                onClick={() => setCamOn((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  camOn
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-red-50 text-red-500 hover:bg-red-100"
                }`}
              >
                <CamIcon off={!camOn} />
                {camOn ? "Stop Video" : "Start Video"}
              </button>
            </div>

            {/* Meeting title */}
            <div>
              <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                Meeting Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-slate-50 transition-all'
                placeholder='Enter meeting title…'
              />
            </div>

            {/* Meeting ID */}
            <div>
              <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                Meeting ID
              </label>
              <div className='flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50'>
                <span className='text-sm text-slate-600 flex-1 font-mono tracking-wide'>
                  {meetingId.current}
                </span>
                <button
                  onClick={handleCopy}
                  className='text-slate-400 hover:text-blue-500 transition-colors'
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={starting}
              className='w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 disabled:opacity-70'
            >
              {starting ? "Starting…" : "Start Meeting"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Join Meeting Modal ───────────────────────────────────────────────────────
const JoinMeetingModal = ({
  onClose,
  onJoin,
}: {
  onClose: () => void;
  onJoin: (meeting: Meeting) => void;
}) => {
  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = () => {
    if (!meetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setJoining(true);
    setTimeout(() => {
      onJoin({
        id: meetingId,
        title: "Meeting " + meetingId,
        participants: [name],
        status: "live",
      });
    }, 700);
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
        <div className='bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slideUp'>
          <div className='flex items-center justify-between px-5 pt-5 pb-3'>
            <h2 className='text-[15px] font-semibold text-slate-800 tracking-tight'>
              Join a Meeting
            </h2>
            <button
              onClick={onClose}
              className='p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors'
            >
              <CloseIcon />
            </button>
          </div>

          <div className='px-5 pb-6 space-y-4'>
            {/* Avatar area */}
            <div className='flex justify-center py-2'>
              <div className='w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-500/30'>
                {name ? name[0].toUpperCase() : "?"}
              </div>
            </div>

            <div>
              <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-slate-50 transition-all'
                placeholder='Enter your name…'
              />
            </div>

            <div>
              <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                Meeting ID or Link
              </label>
              <input
                value={meetingId}
                onChange={(e) => {
                  setMeetingId(e.target.value);
                  setError("");
                }}
                className='w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-slate-50 transition-all'
                placeholder='xxxx-xxxx-xxxx'
              />
              {error && <p className='text-xs text-red-500 mt-1.5'>{error}</p>}
            </div>

            <button
              onClick={handleJoin}
              disabled={joining}
              className='w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-violet-600/25 disabled:opacity-70'
            >
              {joining ? "Joining…" : "Join Now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Schedule Modal ───────────────────────────────────────────────────────────
const ScheduleModal = ({
  onClose,
  onScheduled,
}: {
  onClose: () => void;
  onScheduled: (meeting: Meeting) => void;
}) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const defaultDate = now.toISOString().slice(0, 16);

  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultDate);
  const [participants, setParticipants] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  console.log(title, scheduledAt);

  const handleSchedule = () => {
    setSaving(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        onScheduled({
          id: generateMeetingId(),
          title,
          scheduledAt,
          participants: participants
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          status: "scheduled",
        });
      }, 1200);
    }, 700);
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
        <div className='bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slideUp'>
          <div className='flex items-center justify-between px-5 pt-5 pb-3'>
            <h2 className='text-[15px] font-semibold text-slate-800 tracking-tight'>
              Schedule Meeting
            </h2>
            <button
              onClick={onClose}
              className='p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors'
            >
              <CloseIcon />
            </button>
          </div>

          {done ? (
            <div className='px-5 pb-8 flex flex-col items-center gap-3 py-8'>
              <div className='w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center'>
                <div className='w-8 h-8 text-emerald-500'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                </div>
              </div>
              <p className='text-sm font-semibold text-slate-800'>
                Meeting Scheduled!
              </p>
              <p className='text-xs text-slate-500 text-center'>
                <span className='font-medium text-slate-700'>{title}</span>{" "}
                scheduled for{" "}
                {new Date(scheduledAt).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : (
            <div className='px-5 pb-6 space-y-4'>
              <div>
                <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                  Meeting Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50 transition-all'
                  placeholder='Meeting title…'
                />
              </div>

              <div>
                <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                  Date & Time
                </label>
                <input
                  type='datetime-local'
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className='w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50 transition-all'
                />
              </div>

              {/* <div>
                <label className='text-xs font-medium text-slate-500 mb-1.5 block'>
                  Invite Participants{" "}
                  <span className='text-slate-400'>
                    (comma-separated emails)
                  </span>
                </label>
                <input
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className='w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-slate-50 transition-all'
                  placeholder='alice@email.com, bob@email.com'
                />
              </div> */}

              <button
                onClick={handleSchedule}
                disabled={saving}
                className='w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-70'
              >
                {saving ? "Scheduling…" : "Schedule Meeting"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Live Meeting Room ────────────────────────────────────────────────────────
const LiveMeetingRoom = ({
  meeting,
  onEnd,
}: {
  meeting: Meeting;
  onEnd: () => void;
}) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(meeting.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur border-b border-white/5'>
        <div>
          <p className='text-[13px] font-semibold text-white leading-tight truncate max-w-45 sm:max-w-none'>
            {meeting.title}
          </p>
          <div className='flex items-center gap-2 mt-0.5'>
            <span className='flex items-center gap-1 text-[11px] text-emerald-400'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block' />
              Live
            </span>
            <span className='text-[11px] text-slate-400'>{fmt(elapsed)}</span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className='flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors'
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className='hidden sm:inline'>
            {copied ? "Copied!" : meeting.id}
          </span>
        </button>
      </div>

      {/* Video grid */}
      <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 overflow-auto'>
        {/* Local tile */}
        <div className='bg-slate-800 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden'>
          {camOn ? (
            <div className='w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold'>
              Y
            </div>
          ) : (
            <div className='w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-slate-400'>
              <CamIcon off />
            </div>
          )}
          <div className='absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-1'>
            {!micOn && (
              <div className='text-red-400'>
                <MicIcon off />
              </div>
            )}
            <span className='text-[10px] text-white'>You</span>
          </div>
        </div>

        {/* Remote placeholder */}
        <div className='bg-slate-800/50 rounded-2xl aspect-video flex items-center justify-center border border-dashed border-slate-700'>
          <div className='text-center'>
            <UsersIcon />
            <p className='text-[11px] text-slate-500 mt-2'>
              Waiting for others…
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className='flex items-center justify-center gap-3 py-5 bg-slate-900/60 backdrop-blur border-t border-white/5'>
        <button
          onClick={() => setMicOn((v) => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            micOn
              ? "bg-slate-700 text-white hover:bg-slate-600"
              : "bg-red-500 text-white hover:bg-red-400"
          }`}
        >
          <MicIcon off={!micOn} />
        </button>
        <button
          onClick={() => setCamOn((v) => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            camOn
              ? "bg-slate-700 text-white hover:bg-slate-600"
              : "bg-red-500 text-white hover:bg-red-400"
          }`}
        >
          <CamIcon off={!camOn} />
        </button>
        <button
          onClick={onEnd}
          className='w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all active:scale-95'
        >
          <PhoneOffIcon />
        </button>
      </div>
    </div>
  );
};

// ─── Scheduled Meeting Card ───────────────────────────────────────────────────
const ScheduledCard = ({ meeting }: { meeting: Meeting }) => (
  <div className='flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-slate-100 animate-fadeIn'>
    <div className='w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0'>
      <CalendarIcon />
    </div>
    <div className='min-w-0 flex-1'>
      <p className='text-[13px] font-semibold text-slate-800 truncate'>
        {meeting.title}
      </p>
      {meeting.scheduledAt && (
        <p className='text-[11px] text-slate-400 mt-0.5'>
          {new Date(meeting.scheduledAt).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
    <span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0'>
      Scheduled
    </span>
  </div>
);

// ─── Action Card ──────────────────────────────────────────────────────────────
const ActionCard = ({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className='flex flex-col items-center gap-3 group focus:outline-none'
  >
    <div
      className={`${color} w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl group-active:scale-95`}
    >
      {icon}
    </div>
    <span className='text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors'>
      {label}
    </span>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
function ECastingRoomContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");
  const router = useRouter();
  const [modal, setModal] = useState<"new" | "join" | "schedule" | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([]);
  const [createSessionMutation] = useCreateSessionMutation();
  const [token, setToken] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: recordingVideoData } = useGetRecordingQuery(jobId, {
    skip: !jobId,
  });

  console.log({ recordingVideoData });

  useEffect(() => {
    const tokenValue = localStorage.getItem("access_token");
    if (tokenValue) {
      setToken(tokenValue);
    }
  }, []);

  const handleStartMeeting = async () => {
    console.log("hello...........");
    // setModal(null);
    // setActiveMeeting(m);

    const res = await createSessionMutation().unwrap();

    console.log({ res });
  };

  const handleScheduled = (m: Meeting) => {
    setModal(null);
    setScheduledMeetings((prev) => [m, ...prev]);
  };

  if (activeMeeting) {
    return (
      <LiveMeetingRoom
        meeting={activeMeeting}
        onEnd={() => setActiveMeeting(null)}
      />
    );
  }

  const copyUrl = (liveURL: string) => {
    const url = `${liveURL}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedCode(liveURL);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const meet_app_url =
    process.env.NEXT_PUBLIC_MEET_APP_URL || "https://meet.poolofcast.com";

  return (
    <div className='min-h-screen bg-[#F6F7F9] font-sans'>
      {/* Page */}
      <div className='container mx-auto px-4 sm:px-6 py-6 sm:py-10'>
        <div className='flex items-center justify-between flex-wrap'>
          {/* Back */}
          <button
            onClick={() => router.back()}
            className='flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 bg-white rounded-full px-3.5 py-2 shadow-sm border border-slate-200 transition-colors mb-8'
          >
            <ArrowLeftIcon />
            Back
          </button>

          {/* Title */}
          <div className='mb-8'>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight'>
              E-Casting Room
            </h1>
            <p className='text-sm text-slate-500 mt-1'>
              Tech Startup Commercial - Review Session
            </p>
          </div>
        </div>

        {/* Action cards */}
        <div className='bg-transparent rounded-2xl'>
          <div className='flex flex-wrap justify-center sm:justify-start gap-8 sm:gap-10'>
            {/* <ActionCard
              icon={<VideoIcon />}
              label='New Meeting'
              color='bg-blue-500 hover:bg-blue-600 shadow-blue-400/40'
              // onClick={() => setModal("new")}
              onClick={() => handleStartMeeting()}
            /> */}
            <ActionCard
              icon={<PlusIcon />}
              label='Join Meeting'
              color='bg-violet-600 hover:bg-violet-700 shadow-violet-400/40'
              // onClick={() => setModal("join")}
              onClick={() =>
                window.open(
                  `${meet_app_url}/?token=${token}&jobId=${jobId}`,
                  "_blank",
                )
              }
            />
            {/* <ActionCard
              icon={<CalendarIcon />}
              label='Schedule'
              color='bg-emerald-500 hover:bg-emerald-600 shadow-emerald-400/40'
              onClick={() => setModal("schedule")}
            /> */}
          </div>
        </div>

        {/* Scheduled meetings */}
        {scheduledMeetings.length > 0 && (
          <div className='mt-6'>
            <p className='text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3'>
              Upcoming
            </p>
            <div className='space-y-2'>
              {scheduledMeetings.map((m) => (
                <ScheduledCard key={m.id} meeting={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* {modal === "new" && (
        <NewMeetingModal
          onClose={() => setModal(null)}
          onStart={handleStartMeeting}
        />
      )} */}
      {modal === "join" && (
        <JoinMeetingModal
          onClose={() => setModal(null)}
          onJoin={handleStartMeeting}
        />
      )}
      {modal === "schedule" && (
        <ScheduleModal
          onClose={() => setModal(null)}
          onScheduled={handleScheduled}
        />
      )}

      {/* Recording Videos */}
      {recordingVideoData?.data && recordingVideoData.data.length > 0 && (
        <div className='mt-8'>
          <div className='flex items-center justify-between mb-3'>
            <p className='text-xs font-semibold text-slate-500 uppercase tracking-widest'>
              Meeting Recordings
            </p>
            <span className='text-[11px] text-slate-400'>
              {recordingVideoData.data.reduce(
                (acc: number, m: { meeting_records: string[] }) =>
                  acc + m.meeting_records.length,
                0,
              )}{" "}
              total
            </span>
          </div>

          <div className='space-y-4'>
            {recordingVideoData.data.map(
              (meeting: {
                id: number;
                job: number;
                title: string;
                code: string;
                meeting_records: string[];
              }) => (
                <div
                  key={meeting.id}
                  className='bg-white rounded-2xl p-4 shadow-sm border border-slate-100'
                >
                  {/* Meeting meta */}
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-500'>
                      <VideoIcon />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[13px] font-semibold text-slate-800 truncate'>
                        {meeting.title}
                      </p>
                      <p className='text-[11px] text-slate-400 font-mono'>
                        {meeting.code}
                      </p>
                    </div>
                    <div className='flex items-center gap-1.5 md:gap-2.5 shrink-0'>
                      {meeting.meeting_records.some((u) =>
                        u.includes(".m3u8"),
                      ) && (
                        <span className='text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full'>
                          HLS
                        </span>
                      )}
                      <span className='text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full'>
                        {meeting.meeting_records.length}{" "}
                        {meeting.meeting_records.length !== 1
                          ? "recordings"
                          : "recording"}
                      </span>
                      <button
                        onClick={() => copyUrl(meeting.meeting_records[0])}
                        className='flex items-center gap-1 text-xs text-slate-500 hover:text-blue-500 transition-colors'
                      >
                        {copiedCode === meeting.meeting_records[0] ? (
                          <CheckIcon />
                        ) : (
                          <CopyIcon />
                        )}
                        {copiedCode === meeting.meeting_records[0]
                          ? "Copied!"
                          : "Copy URL"}
                      </button>
                    </div>
                  </div>

                  {/* Videos */}
                  <div
                    className={`grid gap-3 ${
                      meeting.meeting_records.length === 1
                        ? "grid-cols-1"
                        : "grid-cols-1 sm:grid-cols-2"
                    }`}
                  >
                    {meeting.meeting_records.map((url, idx) => (
                      <RecordingVideoCard
                        key={idx}
                        url={url}
                        title={meeting.title}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HLS Video Player ─────────────────────────────────────────────────────────
const HLSPlayer = ({ src, title }: { src: string; title: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith(".m3u8")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari — native HLS support
        video.src = src;
      } else {
        import("hls.js").then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            return () => hls.destroy();
          }
        });
      }
    } else {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className='w-full h-full object-cover'
      title={title}
      playsInline
    />
  );
};

// ─── Recording Video Card ─────────────────────────────────────────────────────
const RecordingVideoCard = ({
  url,
  title,
  index,
}: {
  url: string;
  title: string;
  index: number;
}) => {
  const isHLS = url.includes(".m3u8");
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  const getYouTubeEmbedUrl = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl);
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      }
      if (u.hostname === "youtu.be") {
        return `https://www.youtube.com/embed${u.pathname}`;
      }
    } catch {}
    return rawUrl;
  };

  return (
    <div className='rounded-xl overflow-hidden bg-slate-900 aspect-video relative group'>
      {isHLS ? (
        <HLSPlayer src={url} title={`${title} – Recording ${index + 1}`} />
      ) : isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(url)}
          title={`${title} – Recording ${index + 1}`}
          className='w-full h-full'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      ) : (
        // Fallback: raw mp4 or other direct video
        <video
          src={url}
          controls
          playsInline
          className='w-full h-full object-cover'
          title={`${title} – Recording ${index + 1}`}
        />
      )}

      {/* Index badge */}
      <div className='absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none group-hover:opacity-0 transition-opacity'>
        Recording {index + 1}
      </div>
    </div>
  );
};

export default function EcastingRoom() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ECastingRoomContent />
    </Suspense>
  );
}
