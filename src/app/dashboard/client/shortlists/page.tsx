/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  Briefcase,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetShortlistsJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import { useState } from "react";
import { useDeleteShortlistMutation } from "@/redux/features/ai-chat/aiChatAPI";
import { getImageUrl } from "@/lib/imagePath";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatAvailabilityDate } from "@/utils/formatAvailabilityDate";

// ─── Interfaces matching actual API shape ─────────────────────────────────────

interface TalentImage {
  image_id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

interface TalentInfo {
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
  available_dates: string[];
}

interface ShortlistedTalent {
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
  status: string;
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

function getPrimaryImage(images: TalentImage[]): string {
  if (!images || images.length === 0) return "";
  return (images.find((img) => img.is_primary) ?? images[0]).image;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Deduplicate shortlisted talents by talent_id */
function uniqueTalents(talents: ShortlistedTalent[]): ShortlistedTalent[] {
  return talents.filter(
    (t, idx, arr) =>
      arr.findIndex(
        (x) => x.talent_info.talent_id === t.talent_info.talent_id,
      ) === idx,
  );
}

function ShortlistCardSkeleton() {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm animate-pulse'>
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

function TalentRow({
  item,
  onShowDates,
}: {
  item: ShortlistedTalent;
  onShowDates: (talent: TalentInfo) => void;
}) {
  const { talent_info } = item;
  const imageUrl = getPrimaryImage(talent_info.images);

  return (
    <div className='flex items-center gap-3 py-2'>
      <Avatar className='h-9 w-9 shrink-0'>
        <AvatarImage src={getImageUrl(imageUrl)} alt={talent_info.name} />
        <AvatarFallback className='text-xs'>
          {getInitials(talent_info.name)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-gray-900'>
          {talent_info.name}
        </p>
        <p className='truncate text-xs text-gray-500 capitalize'>
          {talent_info.character} · {talent_info.role}
        </p>
      </div>
      <div className='flex shrink-0 flex-col items-end gap-0.5'>
        {talent_info.location && (
          <span className='flex items-center gap-1 text-xs text-gray-400'>
            <MapPin className='h-3 w-3 shrink-0' />
            <span className='truncate max-w-[80px] sm:max-w-[120px]'>
              {talent_info.location}
            </span>
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowDates(talent_info);
          }}
          className='flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline transition'
        >
          <Calendar className='h-3 w-3 shrink-0' />
          <span className='whitespace-nowrap'>
            {talent_info.available_dates?.length
              ? `${talent_info.available_dates.length} date${talent_info.available_dates.length > 1 ? "s" : ""}`
              : "No dates"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ShortlistCard({
  shortlist,
  refetch,
}: {
  shortlist: ShortlistJob;
  refetch: () => void;
}) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteShortlistMutation] = useDeleteShortlistMutation();
  const [expanded, setExpanded] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState(false);
  const [selectedAvailabilityTalent, setSelectedAvailabilityTalent] =
    useState<TalentInfo | null>(null);

  const deduped = uniqueTalents(shortlist.shortlisted_talents ?? []);
  const visibleTalents = expanded ? deduped : deduped.slice(0, 3);

  const openDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleShowDates = (talent: TalentInfo) => {
    setSelectedAvailabilityTalent(talent);
    setAvailabilityModal(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await deleteShortlistMutation({
        job_id: shortlist.job_id,
      }).unwrap();

      toast.success("Deleted shortlist successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.status_message);
      console.error("Error deleting shortlist:", error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(false);
  };

  const handleCardClick = () => {
    router.push(`/dashboard/client/shortlists/${shortlist.job_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className='rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-gray-300 overflow-hidden w-full'
    >
      {/* Header */}
      <div className='mb-3 flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <h3 className='truncate text-lg sm:text-xl font-bold leading-tight text-black'>
            {shortlist.title}
          </h3>
          <span className='mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 capitalize'>
            {shortlist.job_type}
          </span>
        </div>
        <div className='w-36 flex shrink flex-row items-center justify-between gap-1'>
          <span className='rounded-full bg-gray-100 px-3 py-1 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap'>
            {deduped.length} Shortlisted
          </span>
          <button
            onClick={openDeleteModal}
            className='rounded px-2 py-0.5 text-xs text-red-400  transition hover:text-red-600'
          >
            <Trash size={20} />
          </button>
        </div>
      </div>

      {/* Job meta */}
      <div className='mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-400'>
        <span className='flex items-center gap-1 whitespace-nowrap'>
          <Briefcase className='h-3.5 w-3.5' /> Job #{shortlist.job_id}
        </span>
        {shortlist.location && (
          <>
            <span className='hidden sm:inline'>·</span>
            <span className='flex items-center gap-1 whitespace-nowrap'>
              <MapPin className='h-3.5 w-3.5' />
              {shortlist.location}
            </span>
          </>
        )}
      </div>

      {/* Description */}
      {shortlist.description?.trim() && (
        <p className='mb-3 line-clamp-2 text-sm text-[#404145]'>
          {shortlist.description}
        </p>
      )}

      {/* Counts row */}
      <div className='mb-3 flex flex-wrap gap-2 text-xs text-gray-500'>
        <span className='rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 whitespace-nowrap'>
          {shortlist.applicants_count} applicants
        </span>
        {shortlist.polas_count > 0 && (
          <span className='rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 whitespace-nowrap'>
            {shortlist.polas_count} polas
          </span>
        )}
        {shortlist.selftapes_count > 0 && (
          <span className='rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 whitespace-nowrap'>
            {shortlist.selftapes_count} self-tapes
          </span>
        )}
        {shortlist.ecastings_count > 0 && (
          <span className='rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 whitespace-nowrap'>
            {shortlist.ecastings_count} e-castings
          </span>
        )}
      </div>

      {/* Avatar strip */}
      <div className='mb-3 flex items-center gap-2'>
        <div className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
          {deduped.slice(0, 4).map(({ talent_info }) => (
            <Avatar key={talent_info.talent_id}>
              <AvatarImage
                src={getImageUrl(getPrimaryImage(talent_info.images))}
                alt={talent_info.name}
              />
              <AvatarFallback className='text-xs'>
                {getInitials(talent_info.name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        {deduped.length > 4 && (
          <span className='ml-1 text-xs text-gray-500 whitespace-nowrap'>
            +{deduped.length - 4} more
          </span>
        )}
        {deduped.length === 0 && (
          <span className='text-xs italic text-gray-400'>No talents yet</span>
        )}
      </div>

      {/* Divider + talent list */}
      <div className='border-t border-gray-100 pt-3'>
        <div
          className='divide-y divide-gray-50'
          onClick={(e) => e.stopPropagation()}
        >
          {visibleTalents.map((item) => (
            <TalentRow
              key={item.shortlisted_id}
              item={item}
              onShowDates={handleShowDates}
            />
          ))}
        </div>

        {deduped.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className='mt-2 w-full rounded-md py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition'
          >
            {expanded ? "Show less" : `Show ${deduped.length - 3} more talents`}
          </button>
        )}
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-xl w-[95vw] sm:max-w-md p-5 sm:p-6 border border-gray-100'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-red-50 rounded-full text-red-600 shrink-0 hidden sm:block'>
                <AlertTriangle className='w-6 h-6' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 mb-1 flex items-center gap-2'>
                  <AlertTriangle className='w-5 h-5 text-red-600 sm:hidden shrink-0' />
                  Delete Shortlist
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed mt-2 sm:mt-0'>
                  Are you sure you want to permanently delete{" "}
                  <span className='font-semibold text-gray-800'>
                    &ldquo;{shortlist.title}&rdquo;
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className='flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6'>
              <button
                onClick={handleCloseModal}
                className='w-full sm:w-auto px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition cursor-pointer'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className='w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition cursor-pointer'
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {availabilityModal && selectedAvailabilityTalent && (
        <Dialog open={availabilityModal} onOpenChange={setAvailabilityModal}>
          <DialogContent
            className='w-[95vw] sm:w-full sm:max-w-sm lg:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6 rounded-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader className='shrink-0 text-left sm:text-center'>
              <DialogTitle>Available Dates</DialogTitle>
              <DialogDescription>
                {selectedAvailabilityTalent.name}&apos;s available dates for
                booking.
              </DialogDescription>
            </DialogHeader>
            <div className='py-2 space-y-2 overflow-y-auto flex-1 min-h-0'>
              {selectedAvailabilityTalent?.available_dates &&
              selectedAvailabilityTalent.available_dates.length > 0 ? (
                selectedAvailabilityTalent.available_dates.map((dateStr) => {
                  const { day, date, isPast } = formatAvailabilityDate(dateStr);
                  return (
                    <div
                      key={dateStr}
                      className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-3 rounded-lg border ${
                        isPast
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-blue-100 bg-blue-50"
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <Calendar
                          size={15}
                          className={`shrink-0 hidden sm:block ${isPast ? "text-gray-400" : "text-[#2563EB]"}`}
                        />
                        <div className='flex flex-col'>
                          <span
                            className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${
                              isPast ? "text-gray-400" : "text-[#2563EB]"
                            }`}
                          >
                            {day}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              isPast
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {date}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border shadow-sm whitespace-nowrap ${
                          isPast
                            ? "text-gray-400 bg-white border-gray-200"
                            : "text-green-600 bg-white border-green-100"
                        }`}
                      >
                        {isPast ? "Past" : "Available"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className='flex flex-col items-center justify-center py-10 text-center gap-2'>
                  <Calendar size={32} className='text-gray-300' />
                  <p className='text-sm text-gray-500'>
                    No available dates listed.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className='shrink-0 sm:justify-end'>
              <DialogClose asChild>
                <Button variant='outline' className='w-full sm:w-auto'>
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function ShortlistsPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetShortlistsJobQuery({});

  const shortlists: ShortlistJob[] = data ?? [];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container px-4 py-6 sm:py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6 sm:mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-black'>
              Shortlists
            </h1>
            <p className='mt-1 text-sm sm:text-base text-gray-600'>
              Your curated talent selections
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/client/ai-chat")}
            className='w-full sm:w-auto bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
          >
            <Sparkles
              className='w-5 h-5 sm:w-6 sm:h-6 text-white'
              strokeWidth={1.2}
            />
            Create New Job
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
            {[1, 2, 3, 4].map((i) => (
              <ShortlistCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <div className='grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
            {shortlists.length > 0 ? (
              shortlists.map((shortlist) => (
                <ShortlistCard
                  key={shortlist.job_id}
                  shortlist={shortlist}
                  refetch={refetch}
                />
              ))
            ) : (
              <div className='col-span-full py-12 text-center px-4'>
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
