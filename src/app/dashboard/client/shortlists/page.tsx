"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetShortlistsJobQuery } from "@/redux/features/client/shortlistsJobAPI";

export interface Talent {
  talent_id: number;
  talent_name: string;
  talent_role: string;
  created_at: string;
  location: string;
  agency_name: string | null;
}

export interface ShortlistJob {
  job_id: number;
  job_title: string;
  job_description: string;
  talents: Talent[];
}

function ShortlistCardSkeleton() {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse'>
      {/* Header with title and talent count */}
      <div className='mb-4 flex items-start justify-between'>
        <div className='h-7 w-2/3 rounded-md bg-gray-200' />
        <div className='h-7 w-20 rounded-full bg-gray-200' />
      </div>

      {/* Description and label */}
      <div className='mb-4 space-y-1'>
        <div className='mb-3 space-y-2'>
          <div className='h-4 w-full rounded bg-gray-200' />
          <div className='h-4 w-5/6 rounded bg-gray-200' />
        </div>
        <div className='h-4 w-28 rounded bg-gray-200' />
      </div>

      {/* Talent avatars */}
      <div className='flex items-center gap-2 pb-4'>
        <div className='flex -space-x-2'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-10 w-10 rounded-full border-2 border-white bg-gray-200'
            />
          ))}
        </div>
        <div className='ml-1 h-3 w-12 rounded bg-gray-200' />
      </div>
    </div>
  );
}

function ShortlistCard({ shortlist }: { shortlist: ShortlistJob }) {
  const router = useRouter();

  // Derive initials from talent name for avatar fallback
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      onClick={() =>
        router.push(`/dashboard/client/shortlists/${shortlist.job_id}`)
      }
      className='group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300'
    >
      {/* Header with title and talent count */}
      <div className='mb-4 flex items-start justify-between'>
        <h3 className='text-xl font-bold text-black'>{shortlist.job_title}</h3>
        <span className='rounded-full bg-[#f0f0f093] px-3 py-1 text-sm font-semibold text-gray-700'>
          {shortlist.talents.length} Talent
        </span>
      </div>

      {/* Description and label */}
      <div className='mb-4 space-y-1'>
        <p className='text-sm text-[#404145] mb-3 line-clamp-2'>
          {shortlist.job_description}
        </p>
        <p className='text-sm font-medium text-[#000000]'>Talent Applied</p>
      </div>

      {/* Talent avatars */}
      <div className='flex items-center gap-2 pb-4'>
        <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
          {shortlist?.talents?.slice(0, 3).map((talent) => (
            <Avatar key={talent.talent_id}>
              <AvatarFallback>{getInitials(talent.talent_name)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        {shortlist.talents.length > 3 && (
          <span className='text-xs text-gray-500 ml-1'>
            +{shortlist.talents.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

export default function ShortlistsPage() {
  const router = useRouter();

  const { data, isLoading } = useGetShortlistsJobQuery({});
  const shortlists: ShortlistJob[] = data?.data || [];

  console.log({ data });

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold text-black'>Shortlists</h1>
            <p className='mt-1 text-gray-600'>Your curated talent selections</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/client/ai-chat")}
            className='bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
          >
            <Sparkles className='w-6 h-6 text-[#ffffff]' strokeWidth={1.2} />
            Create New Job
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
            {[1, 2, 3, 4].map((i) => (
              <ShortlistCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Shortlists Grid */}
        {!isLoading && (
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
            {shortlists.length > 0 ? (
              shortlists.map((shortlist) => (
                <ShortlistCard key={shortlist.job_id} shortlist={shortlist} />
              ))
            ) : (
              <div className='col-span-full py-12 text-center'>
                <p className='text-gray-500'>
                  No shortlists yet. Create one to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
