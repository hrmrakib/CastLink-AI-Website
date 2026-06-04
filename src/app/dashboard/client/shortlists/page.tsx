/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Sparkles,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetShortlistsJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import { useState } from "react";
import { useDeleteShortlistMutation } from "@/redux/features/ai-chat/aiChatAPI";
import { getImageUrl } from "@/lib/imagePath";

// ─── Interfaces matching actual API shape ─────────────────────────────────────

export interface TalentImage {
  image_id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface TalentInfo {
  talent_id: number;
  name: string;
  gender: string;
  role: string;
  character: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dress_size: string;
  shoe_size: string;
  hair_colour: string;
  eye_colour: string;
  skin_color: string;
  hair_type: string;
  continent: string;
  country: string;
  location: string;
  skills: string;
  is_available: boolean;
  images: TalentImage[];
}

export interface ShortlistedTalent {
  shortlisted_id: number;
  session_id: string;
  created_at: string;
  talent_info: TalentInfo;
}

export interface ShortlistJob {
  job_id: string;
  title: string;
  description: string;
  casting_roles: string;
  location: string;
  budget_min: string;
  budget_max: string;
  job_type: string;
  status: "active" | "inactive" | string;
  applicants_count: number;
  shortlisted_count: number;
  selftapes_count: number;
  ecastings_count: number;
  polas_count: number;
  created_at: string;
  updated_at: string;
  shortlisted_talents: ShortlistedTalent[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get initials from a talent's name */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Get the primary image URL, falling back to the first image */
function getPrimaryImage(images: TalentImage[]): string {
  if (!images || images.length === 0) return "";
  return (images.find((img) => img.is_primary) ?? images[0]).image;
}

/** Format budget range */
function formatBudget(min: string, max: string): string {
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  if (minVal === maxVal) return `৳${minVal.toLocaleString()}`;
  return `৳${minVal.toLocaleString()} – ৳${maxVal.toLocaleString()}`;
}

/** Deduplicate shortlisted talents by talent_id */
function uniqueByTalentId(talents: ShortlistedTalent[]): ShortlistedTalent[] {
  return talents.filter(
    (t, idx, arr) =>
      arr.findIndex(
        (x) => x.talent_info.talent_id === t.talent_info.talent_id,
      ) === idx,
  );
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
        <div className='h-4 w-1/3 rounded bg-gray-200' />
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

// ─── Card ─────────────────────────────────────────────────────────────────────

function ShortlistCard({ shortlist }: { shortlist: ShortlistJob }) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [deleteShortlistMutation] = useDeleteShortlistMutation();

  const openDeleteModal = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    setSelectedJobId(jobId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedJobId) {
      try {
        await deleteShortlistMutation({
          job_id: selectedJobId,
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

  const uniqueTalents = uniqueByTalentId(shortlist.shortlisted_talents ?? []);

  console.log(getPrimaryImage(uniqueTalents[0].talent_info.images));

  return (
    <div
      onClick={() =>
        router.push(`/dashboard/client/shortlists/${shortlist.job_id}`)
      }
      className='group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300'
    >
      {/* Header */}
      <div className='mb-3 flex items-start justify-between gap-2'>
        <h3 className='text-xl font-bold text-black leading-tight'>
          {shortlist.title}
        </h3>
        <div className='flex flex-col items-end gap-1 shrink-0'>
          <span className='rounded-full bg-[#f0f0f093] px-3 py-1 text-sm font-semibold text-gray-700 whitespace-nowrap'>
            {shortlist.shortlisted_count} Shortlisted
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              shortlist.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {shortlist.status}
          </span>
        </div>
      </div>

      {/* Meta: location, job type, casting roles */}
      <div className='mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500'>
        {shortlist.location && (
          <span className='flex items-center gap-1'>
            <MapPin className='w-3.5 h-3.5' />
            {shortlist.location}
          </span>
        )}
        {shortlist.job_type && (
          <span className='flex items-center gap-1 capitalize'>
            <Briefcase className='w-3.5 h-3.5' />
            {shortlist.job_type}
          </span>
        )}
        {shortlist.casting_roles && (
          <span className='flex items-center gap-1'>
            <Users className='w-3.5 h-3.5' />
            {shortlist.casting_roles}
          </span>
        )}
      </div>

      {/* Description */}
      {shortlist.description?.trim() && (
        <p className='text-sm text-[#404145] mb-3 line-clamp-2'>
          {shortlist.description}
        </p>
      )}

      {/* Budget */}
      <p className='text-sm font-semibold text-gray-800 mb-3'>
        {formatBudget(shortlist.budget_min, shortlist.budget_max)}
      </p>

      {/* Stats row */}
      <div className='flex flex-wrap gap-3 mb-4'>
        {[
          { label: "Applicants", value: shortlist.applicants_count },
          { label: "Self-tapes", value: shortlist.selftapes_count },
          { label: "eCastings", value: shortlist.ecastings_count },
          { label: "Polas", value: shortlist.polas_count },
        ].map(({ label, value }) => (
          <div
            key={label}
            className='flex flex-col items-center bg-gray-50 rounded-md px-3 py-1.5 min-w-[60px]'
          >
            <span className='text-base font-bold text-black leading-none'>
              {value}
            </span>
            <span className='text-[11px] text-gray-500 mt-0.5'>{label}</span>
          </div>
        ))}
      </div>

      {/* Talent avatars */}
      <div className='flex items-center justify-between gap-2 pt-2 border-t border-gray-100'>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-medium text-[#000000] mr-1'>Shortlisted</p>
          <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
            {uniqueTalents.slice(0, 3).map((talent) => (
              <Avatar key={talent.shortlisted_id}>
                <AvatarImage
                  src={getImageUrl(getPrimaryImage(talent.talent_info.images))}
                  alt={talent.talent_info.name}
                />
                <AvatarFallback>
                  {getInitials(talent.talent_info.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {uniqueTalents.length > 3 && (
            <span className='text-xs text-gray-500 ml-1'>
              +{uniqueTalents.length - 3} more
            </span>
          )}
          {uniqueTalents.length === 0 && (
            <span className='text-xs text-gray-400 italic'>No talents yet</span>
          )}
        </div>
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
                    &ldquo;{shortlist.title}&rdquo;
                  </span>
                  ? This action cannot be undone and all associated application
                  progress will be lost.
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
  const shortlists: ShortlistJob[] = data || [];

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
