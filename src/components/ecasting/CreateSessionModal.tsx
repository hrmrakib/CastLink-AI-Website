"use client";

import { useState } from "react";
import type { CreateSessionPayload } from "@/types/ecasting";

interface CreateSessionModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSessionPayload) => void;
}

export function CreateSessionModal({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: CreateSessionModalProps) {
  const [jobId, setJobId] = useState("");
  const [talentIds, setTalentIds] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ids = talentIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (!jobId || ids.length === 0 || !scheduledTime) return;

    onSubmit({
      job_id: Number(jobId),
      talent_ids: ids,
      // scheduled_time: scheduledTime,
      scheduled_time: "2026-03-11T05",
    });
  };

  return (
    // Backdrop
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-zinc-800'>
          <div>
            <h2 className='text-lg font-semibold text-white'>
              New eCasting Session
            </h2>
            <p className='text-sm text-zinc-500 mt-0.5'>
              Configure and start your live session
            </p>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors'
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='px-6 py-5 space-y-4'>
          <Field label='Job ID' hint='The job posting ID'>
            <input
              type='number'
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder='82'
              required
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
            />
          </Field>

          <Field label='Talent IDs' hint='Comma-separated IDs (e.g. 1, 5, 12)'>
            <input
              type='text'
              value={talentIds}
              onChange={(e) => setTalentIds(e.target.value)}
              placeholder='1, 5, 12'
              required
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
            />
          </Field>

          <Field label='Scheduled Time' hint='ISO format datetime'>
            <input
              type='datetime-local'
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors [color-scheme:dark]'
            />
          </Field>

          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2.5 rounded-lg text-sm text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <>
                  <span className='w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin' />
                  Creating...
                </>
              ) : (
                "Create Session"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-baseline justify-between'>
        <label className='text-sm font-medium text-zinc-300'>{label}</label>
        {hint && <span className='text-xs text-zinc-600'>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CloseIcon() {
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
    >
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
  );
}
