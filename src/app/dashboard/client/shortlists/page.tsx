"use client";

import type React from "react";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  return (
    <div
      onClick={() =>
        router.push(`/dashboard/client/shortlists/${shortlist.id}`)
      }
      className='group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300'
    >
      {/* Header with title and talent count */}
      <div className='mb-4 flex items-start justify-between'>
        <h3 className='text-xl font-bold text-black'>{shortlist.title}</h3>
        <span className='rounded-full bg-[#f0f0f093] px-3 py-1 text-sm font-semibold text-gray-700'>
          {shortlist.talentCount} Talent
        </span>
      </div>

      {/* Time remaining and talent applied */}
      <div className='mb-4 space-y-1'>
        <p className='text-sm text-[#404145] mb-3'>{shortlist.timeRemaining}</p>
        <p className='text-sm font-medium text-[#000000]'>Talent Applied</p>
      </div>

      {/* Talent avatars */}
      <div className='flex items-center gap-2 pb-4'>
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

  const [selectedShortlist, setSelectedShortlist] = useState<string | null>(
    null
  );

  const handleSelectShortlist = (id: string) => {
    setSelectedShortlist(id);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold text-black'>Shortlists</h1>
            <p className='mt-1 text-gray-600'>Your curated talent selections</p>
          </div>
          <button className='flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95'>
            <Sparkles className='w-6 h-6 text-[#ffffff]' strokeWidth={1.2} />
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

      {/* Hidden - for debugging */}
      {selectedShortlist && (
        <div className='hidden'>Selected: {selectedShortlist}</div>
      )}
    </div>
  );
}
