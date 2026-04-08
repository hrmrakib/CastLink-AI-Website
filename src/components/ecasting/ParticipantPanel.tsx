"use client";

import { useEffect, useRef } from "react";
import type { Participant } from "@/types/ecasting";

interface ParticipantPanelProps {
  participants: Participant[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ParticipantPanel({
  participants,
  isLoading,
  onRefresh,
}: ParticipantPanelProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh every 10s
  useEffect(() => {
    intervalRef.current = setInterval(onRefresh, 10_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onRefresh]);

  const joined = participants.filter((p) => p.status === "joined").length;
  const waiting = participants.filter((p) => p.status === "waiting").length;

  return (
    <aside className='w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-800'>
        <div>
          <h2 className='text-sm font-semibold text-white'>Participants</h2>
          <p className='text-xs text-zinc-500 mt-0.5'>
            {joined} joined · {waiting} waiting
          </p>
        </div>
        <button
          onClick={onRefresh}
          className='p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors'
          title='Refresh participants'
        >
          <RefreshIcon spinning={isLoading} />
        </button>
      </div>

      {/* List */}
      <div className='flex-1 overflow-y-auto p-2 space-y-1'>
        {participants.length === 0 && !isLoading && (
          <div className='text-center py-8 text-zinc-600 text-sm'>
            No participants yet
          </div>
        )}

        {participants.map((p) => (
          <div
            key={p.talent_id}
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 transition-colors'
          >
            {/* Avatar */}
            <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0'>
              <span className='text-xs font-medium text-zinc-300'>
                {p.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-white truncate'>{p.name}</p>
              {p.join_time && (
                <p className='text-xs text-zinc-500'>
                  Joined {formatTime(p.join_time)}
                </p>
              )}
            </div>

            {/* Status badge */}
            <StatusBadge status={p.status} />
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Participant["status"] }) {
  const styles: Record<Participant["status"], string> = {
    joined: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    waiting: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    left: "bg-zinc-800 text-zinc-500 border border-zinc-700",
  };

  const dots: Record<Participant["status"], string> = {
    joined: "bg-emerald-400",
    waiting: "bg-amber-400",
    left: "bg-zinc-500",
  };

  return (
    <span
      className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={spinning ? "animate-spin" : ""}
    >
      <polyline points='23 4 23 10 17 10' />
      <polyline points='1 20 1 14 7 14' />
      <path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' />
    </svg>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
