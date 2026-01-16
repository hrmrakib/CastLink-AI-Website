"use client";

import type React from "react";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Shortlist {
  id: string;
  title: string;
  talentCount: number;
  timeRemaining: string;
  appliedCount: number;
  talents: string[];
  createdAt: Date;
}

function ShortlistCard({
  shortlist,
  onSelect,
}: {
  shortlist: Shortlist;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(shortlist.id)}
      className='group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300'
    >
      {/* Header with title and talent count */}
      <div className='mb-4 flex items-start justify-between'>
        <h3 className='text-lg font-bold text-gray-900'>{shortlist.title}</h3>
        <span className='rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700'>
          {shortlist.talentCount} Talent
        </span>
      </div>

      {/* Time remaining and talent applied */}
      <div className='mb-4 space-y-1'>
        <p className='text-sm text-gray-600'>{shortlist.timeRemaining}</p>
        <p className='text-sm font-semibold text-gray-900'>Talent Applied</p>
      </div>

      {/* Talent avatars */}
      <div className='flex items-center gap-2'>
        <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
          <Avatar>
            <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src='/woman.png' alt='@maxleiter' />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src='/man.png' alt='@evilrabbit' />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

function CreateJobModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (jobData: { title: string; talentCount: number }) => void;
}) {
  const [title, setTitle] = useState("");
  const [talentCount, setTalentCount] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate({ title, talentCount: Number.parseInt(talentCount) });
      setTitle("");
      setTalentCount("5");
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='w-full max-w-md rounded-lg bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-gray-200 p-6'>
          <h2 className='text-xl font-bold text-gray-900'>Create New Job</h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1 transition-colors hover:bg-gray-100'
            aria-label='Close modal'
          >
            <X size={24} className='text-gray-500' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4 p-6'>
          <div>
            <label
              htmlFor='title'
              className='block text-sm font-semibold text-gray-900'
            >
              Job Title
            </label>
            <input
              id='title'
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., Commercial Fashion Shoot'
              className='mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
            />
          </div>

          <div>
            <label
              htmlFor='talentCount'
              className='block text-sm font-semibold text-gray-900'
            >
              Required Talent
            </label>
            <input
              id='talentCount'
              type='number'
              min='1'
              max='20'
              value={talentCount}
              onChange={(e) => setTalentCount(e.target.value)}
              className='mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!title.trim()}
              className='flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShortlistsPage() {
  const [shortlists, setShortlists] = useState<Shortlist[]>([
    {
      id: "1",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Alex", "Blake", "Casey", "Dana"],
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Emma", "Frank", "Grace", "Henry"],
      createdAt: new Date(),
    },
    {
      id: "3",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Ivy", "Jack", "Karen", "Leo"],
      createdAt: new Date(),
    },
    {
      id: "4",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Mia", "Noah", "Olivia", "Peter"],
      createdAt: new Date(),
    },
    {
      id: "5",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Quinn", "Rachel", "Sam", "Tina"],
      createdAt: new Date(),
    },
    {
      id: "6",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Uma", "Victor", "Wendy", "Xavier"],
      createdAt: new Date(),
    },
    {
      id: "7",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Yara", "Zoe", "Adam", "Bella"],
      createdAt: new Date(),
    },
    {
      id: "8",
      title: "Commercial Fashion Shoot",
      talentCount: 5,
      timeRemaining: "36h remaining",
      appliedCount: 4,
      talents: ["Charlie", "Diana", "Ethan", "Fiona"],
      createdAt: new Date(),
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedShortlist, setSelectedShortlist] = useState<string | null>(
    null
  );

  const handleSelectShortlist = (id: string) => {
    setSelectedShortlist(id);
  };

  const handleCreateShortlist = (jobData: {
    title: string;
    talentCount: number;
  }) => {
    const talentNames = ["Alex", "Blake", "Casey", "Dana"];
    const newShortlist: Shortlist = {
      id: Date.now().toString(),
      title: jobData.title,
      talentCount: jobData.talentCount,
      timeRemaining: "36h remaining",
      appliedCount: talentNames.length,
      talents: talentNames,
      createdAt: new Date(),
    };
    setShortlists([newShortlist, ...shortlists]);
    setShowModal(false);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Shortlists</h1>
            <p className='mt-1 text-gray-600'>Your curated talent selections</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95'
          >
            <Plus size={20} />
            Create New Job
          </button>
        </div>

        {/* Shortlists Grid */}
        <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
          {shortlists.length > 0 ? (
            shortlists.map((shortlist) => (
              <ShortlistCard
                key={shortlist.id}
                shortlist={shortlist}
                onSelect={handleSelectShortlist}
              />
            ))
          ) : (
            <div className='col-span-full py-12 text-center'>
              <p className='text-gray-500'>
                No shortlists yet. Create one to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <CreateJobModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateShortlist}
        />
      )}

      {/* Hidden - for debugging */}
      {selectedShortlist && (
        <div className='hidden'>Selected: {selectedShortlist}</div>
      )}
    </div>
  );
}
