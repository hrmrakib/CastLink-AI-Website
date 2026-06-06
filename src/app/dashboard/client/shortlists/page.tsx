/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetShortlistsJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import { useState } from "react";
import { useDeleteShortlistMutation } from "@/redux/features/ai-chat/aiChatAPI";
import { getImageUrl } from "@/lib/imagePath";

// ─── Interfaces matching actual API shape ─────────────────────────────────────

export interface ApiTalent {
  talent_id: number;
  talent_name: string;
  talent_role: string;
  character: string;
  available_dates: string[];
  location: string;
  agency_name: string | null;
  image: string;
  created_at: string;
}

export interface ShortlistJob {
  job_id: number | null;
  job_title: string | null;
  job_description: string | null;
  talents: ApiTalent[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    per_page: number;
  };
  data: ShortlistJob[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Deduplicate talents by talent_id */
function uniqueByTalentId(talents: ApiTalent[]): ApiTalent[] {
  return talents.filter(
    (t, idx, arr) => arr.findIndex((x) => x.talent_id === t.talent_id) === idx,
  );
}

/** Format a date string like "2026-05-21" → "May 21" */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Summarise available_dates into a compact label */
function summarizeDates(dates: string[]): string {
  if (!dates || dates.length === 0) return "No available dates";
  if (dates.length === 1) return formatDate(dates[0]);
  const sorted = [...dates].sort();
  return `${formatDate(sorted[0])} – ${formatDate(sorted[sorted.length - 1])}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ShortlistCardSkeleton() {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse'>
      <div className='mb-4 flex items-start justify-between'>
        <div className='h-7 w-2/3 rounded-md bg-gray-200' />
        <div className='h-7 w-20 rounded-full bg-gray-200' />
      </div>
      <div className='mb-4 space-y-2'>
        <div className='h-4 w-full rounded bg-gray-200' />
        <div className='h-4 w-5/6 rounded bg-gray-200' />
      </div>
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

// ─── Talent Row ───────────────────────────────────────────────────────────────

function TalentRow({ talent }: { talent: ApiTalent }) {
  return (
    <div className='flex items-center gap-3 py-2'>
      <Avatar className='h-9 w-9 shrink-0'>
        <AvatarImage src={getImageUrl(talent.image)} alt={talent.talent_name} />
        <AvatarFallback className='text-xs'>
          {getInitials(talent.talent_name)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-gray-900'>
          {talent.talent_name}
        </p>
        <p className='truncate text-xs text-gray-500 capitalize'>
          {talent.character} · {talent.talent_role}
        </p>
      </div>
      <div className='flex shrink-0 flex-col items-end gap-0.5'>
        {talent.location && (
          <span className='flex items-center gap-1 text-xs text-gray-400'>
            <MapPin className='h-3 w-3' />
            {talent.location}
          </span>
        )}
        <span className='flex items-center gap-1 text-xs text-gray-400'>
          <Calendar className='h-3 w-3' />
          {summarizeDates(talent.available_dates)}
        </span>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ShortlistCard({ shortlist }: { shortlist: ShortlistJob }) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [deleteShortlistMutation] = useDeleteShortlistMutation();
  const [expanded, setExpanded] = useState(false);

  const isOrphaned = shortlist.job_id === null;
  const uniqueTalents = uniqueByTalentId(shortlist.talents ?? []);
  const visibleTalents = expanded ? uniqueTalents : uniqueTalents.slice(0, 3);

  const openDeleteModal = (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    setSelectedJobId(jobId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedJobId !== null) {
      try {
        await deleteShortlistMutation({
          job_id: String(selectedJobId),
          talent_id: 1,
        }).unwrap();
      } catch (error: any) {
        console.error("Error deleting job:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedJobId(null);
      }
    }
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(false);
    setSelectedJobId(null);
  };

  const handleCardClick = () => {
    if (!isOrphaned && shortlist.job_id !== null) {
      router.push(`/dashboard/client/shortlists/${shortlist.job_id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group rounded-lg border bg-white p-6 shadow-sm transition-all ${
        isOrphaned
          ? "border-dashed border-gray-300 cursor-default"
          : "border-gray-200 cursor-pointer hover:shadow-md hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className='mb-3 flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <h3 className='truncate text-xl font-bold leading-tight text-black'>
            {shortlist.job_title ?? "Unassigned Shortlist"}
          </h3>
          {isOrphaned && (
            <span className='mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600'>
              No job linked
            </span>
          )}
        </div>
        <div className='flex shrink-0 flex-col items-end gap-1'>
          <span className='rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 whitespace-nowrap'>
            {uniqueTalents.length} Shortlisted
          </span>
          {!isOrphaned && (
            <button
              onClick={(e) => openDeleteModal(e, shortlist.job_id!)}
              className='rounded px-2 py-0.5 text-xs text-red-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100'
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Job meta */}
      {shortlist.job_id !== null && (
        <div className='mb-3 flex items-center gap-2 text-xs text-gray-400'>
          <Briefcase className='h-3.5 w-3.5' />
          <span>Job #{shortlist.job_id}</span>
        </div>
      )}

      {/* Description */}
      {shortlist.job_description?.trim() && (
        <p className='mb-3 line-clamp-2 text-sm text-[#404145]'>
          {shortlist.job_description}
        </p>
      )}

      {/* Avatar strip */}
      <div className='mb-3 flex items-center gap-2'>
        <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
          {uniqueTalents.slice(0, 4).map((talent) => (
            <Avatar key={talent.talent_id}>
              <AvatarImage
                src={getImageUrl(talent.image)}
                alt={talent.talent_name}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(talent.talent_name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        {uniqueTalents.length > 4 && (
          <span className='ml-1 text-xs text-gray-500'>
            +{uniqueTalents.length - 4} more
          </span>
        )}
        {uniqueTalents.length === 0 && (
          <span className='text-xs italic text-gray-400'>No talents yet</span>
        )}
      </div>

      {/* Divider */}
      <div className='border-t border-gray-100 pt-3'>
        {/* Talent list */}
        <div
          className='divide-y divide-gray-50'
          onClick={(e) => e.stopPropagation()}
        >
          {visibleTalents.map((talent) => (
            <TalentRow key={talent.talent_id} talent={talent} />
          ))}
        </div>

        {uniqueTalents.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className='mt-2 w-full rounded-md py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition'
          >
            {expanded
              ? "Show less"
              : `Show ${uniqueTalents.length - 3} more talents`}
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-red-50 rounded-full text-red-600 shrink-0'>
                <AlertTriangle className='w-6 h-6' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 mb-1'>
                  Delete Shortlist
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Are you sure you want to permanently delete{" "}
                  <span className='font-semibold text-gray-800'>
                    &ldquo;{shortlist.job_title}&rdquo;
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className='flex gap-3 justify-end mt-6'>
              <button
                onClick={handleCloseModal}
                className='px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition cursor-pointer'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition cursor-pointer'
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShortlistsPage() {
  const router = useRouter();
  const { data, isLoading } = useGetShortlistsJobQuery({});

  // The API wraps data in { data: ShortlistJob[] }
  const shortlists: ShortlistJob[] = (data as ApiResponse)?.data ?? data ?? [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold text-black'>Shortlists</h1>
            <p className='mt-1 text-gray-600'>Your curated talent selections</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/client/ai-chat")}
            className='bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
          >
            <Sparkles className='w-6 h-6 text-white' strokeWidth={1.2} />
            Create New Job
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
            {[1, 2, 3, 4].map((i) => (
              <ShortlistCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
            {shortlists.length > 0 ? (
              shortlists.map((shortlist, index) => (
                <ShortlistCard
                  // job_id can be null for orphaned entries; fall back to index
                  key={shortlist.job_id ?? `orphaned-${index}`}
                  shortlist={shortlist}
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
        )}
      </div>
    </div>
  );
}

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { AlertTriangle, Sparkles, Trash2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useGetShortlistsJobQuery } from "@/redux/features/client/shortlistsJobAPI";
// import { useState } from "react";
// import { useDeleteShortlistMutation } from "@/redux/features/ai-chat/aiChatAPI";

// export interface Talent {
//   talent_id: number;
//   talent_name: string;
//   talent_role: string;
//   created_at: string;
//   location: string;
//   agency_name: string | null;
//   image?: string;
// }

// export interface ShortlistJob {
//   job_id: number;
//   job_title: string;
//   job_description: string;
//   talents: Talent[];
// }

// function ShortlistCardSkeleton() {
//   return (
//     <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse'>
//       {/* Header with title and talent count */}
//       <div className='mb-4 flex items-start justify-between'>
//         <div className='h-7 w-2/3 rounded-md bg-gray-200' />
//         <div className='h-7 w-20 rounded-full bg-gray-200' />
//       </div>

//       {/* Description and label */}
//       <div className='mb-4 space-y-1'>
//         <div className='mb-3 space-y-2'>
//           <div className='h-4 w-full rounded bg-gray-200' />
//           <div className='h-4 w-5/6 rounded bg-gray-200' />
//         </div>
//         <div className='h-4 w-28 rounded bg-gray-200' />
//       </div>

//       {/* Talent avatars */}
//       <div className='flex items-center gap-2 pb-4'>
//         <div className='flex -space-x-2'>
//           {[1, 2, 3].map((i) => (
//             <div
//               key={i}
//               className='h-10 w-10 rounded-full border-2 border-white bg-gray-200'
//             />
//           ))}
//         </div>
//         <div className='ml-1 h-3 w-12 rounded bg-gray-200' />
//       </div>
//     </div>
//   );
// }

// function ShortlistCard({ shortlist }: { shortlist: ShortlistJob }) {
//   const router = useRouter();
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
//   const [deleteShortlistMutation] = useDeleteShortlistMutation();

//   const openDeleteModal = (e: React.MouseEvent, jobId: string) => {
//     e.stopPropagation();
//     setSelectedJobId(jobId);
//     setIsDeleteModalOpen(true);
//   };

//   // Confirm permanent delete handler
//   const handleConfirmDelete = async (e: React.MouseEvent) => {
//     e.stopPropagation();

//     if (selectedJobId) {
//       try {
//         await deleteShortlistMutation({
//           job_id: selectedJobId,
//           talent_id: 1,
//         }).unwrap();
//       } catch (error: any) {
//         console.error("Error deleting job:", error);
//       } finally {
//         setIsDeleteModalOpen(false);
//         setSelectedJobId(null);
//       }
//     }
//   };

//   const handleCloseModal = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setIsDeleteModalOpen(false);
//     setSelectedJobId(null);
//   };

//   // Derive initials from talent name for avatar fallback
//   const getInitials = (name: string) =>
//     name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);

//   const image_url = process.env.NEXT_PUBLIC_IMAGE_URL;

//   return (
//     <div
//       onClick={() =>
//         router.push(`/dashboard/client/shortlists/${shortlist.job_id}`)
//       }
//       className='group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300'
//     >
//       {/* Header with title and talent count */}
//       <div className='mb-4 flex items-start justify-between'>
//         <h3 className='text-xl font-bold text-black'>{shortlist.job_title}</h3>
//         <span className='rounded-full bg-[#f0f0f093] px-3 py-1 text-sm font-semibold text-gray-700'>
//           {shortlist?.talents.length} Talent
//         </span>
//       </div>

//       {/* Description and label */}
//       <div className='mb-4 space-y-1'>
//         <p className='text-sm text-[#404145] mb-3 line-clamp-2'>
//           {shortlist?.job_description}
//         </p>
//         <p className='text-sm font-medium text-[#000000]'>Talent Applied</p>
//       </div>

//       {/* Talent avatars */}
//       <div className='flex items-center justify-between gap-2 pb-4'>
//         <div className='flex items-center gap-2'>
//           <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
//             {shortlist?.talents?.slice(0, 3).map((talent) => (
//               <>
//                 {talent?.image && (
//                   <Avatar key={talent.talent_id}>
//                     <AvatarImage src={image_url + talent?.image} />
//                     <AvatarFallback>
//                       {getInitials(talent.talent_name)}
//                     </AvatarFallback>
//                   </Avatar>
//                 )}
//               </>
//             ))}
//           </div>
//           {shortlist.talents.length > 3 && (
//             <span className='text-xs text-gray-500 ml-1'>
//               +{shortlist.talents.length - 3} more
//             </span>
//           )}
//         </div>
//         <div>
//           <button
//             onClick={(e) => openDeleteModal(e, String(shortlist.job_id))}
//             className='p-3'
//           >
//             <Trash2 className='w-6 h-6 text-[#FF0000]' strokeWidth={1.2} />
//           </button>
//         </div>
//       </div>

//       {/* Warning Confirmation Modal */}
//       {isDeleteModalOpen && (
//         <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn'>
//           <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 transform scale-100 transition-all'>
//             <div className='flex items-start gap-4'>
//               <div className='p-3 bg-red-50 rounded-full text-red-600 shrink-0'>
//                 <AlertTriangle className='w-6 h-6' />
//               </div>
//               <div>
//                 <h3 className='text-lg font-bold text-gray-900 mb-1'>
//                   Delete Permanent Card
//                 </h3>
//                 <p className='text-gray-600 text-sm leading-relaxed'>
//                   Are you sure you want to permanently delete this job post?
//                   This action cannot be undone and all associated application
//                   progress will be lost.
//                 </p>
//               </div>
//             </div>

//             <div className='flex gap-3 justify-end mt-6'>
//               <button
//                 onClick={(e) => handleCloseModal(e)}
//                 className='px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition cursor-pointer'
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={(e) => handleConfirmDelete(e)}
//                 className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition cursor-pointer'
//               >
//                 Permanently Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function ShortlistsPage() {
//   const router = useRouter();

//   const { data, isLoading } = useGetShortlistsJobQuery({});
//   const shortlists: ShortlistJob[] = data || [];

//   console.log({ data });

//   return (
//     <div className='min-h-screen bg-gray-50'>
//       <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
//         {/* Header Section */}
//         <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
//           <div>
//             <h1 className='text-3xl font-bold text-black'>Shortlists</h1>
//             <p className='mt-1 text-gray-600'>Your curated talent selections</p>
//           </div>
//           <button
//             onClick={() => router.push("/dashboard/client/ai-chat")}
//             className='bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
//           >
//             <Sparkles className='w-6 h-6 text-[#ffffff]' strokeWidth={1.2} />
//             Create New Job
//           </button>
//         </div>

//         {/* Loading state */}
//         {isLoading && (
//           <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
//             {[1, 2, 3, 4].map((i) => (
//               <ShortlistCardSkeleton key={i} />
//             ))}
//           </div>
//         )}

//         {/* Shortlists Grid */}
//         {!isLoading && (
//           <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
//             {shortlists.length > 0 ? (
//               shortlists.map((shortlist) => (
//                 <ShortlistCard key={shortlist.job_id} shortlist={shortlist} />
//               ))
//             ) : (
//               <div className='col-span-full py-12 text-center'>
//                 <p className='text-gray-500'>
//                   No shortlists yet. Create one to get started!
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
