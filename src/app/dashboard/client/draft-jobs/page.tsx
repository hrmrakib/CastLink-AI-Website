/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { FileText, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useDeleteDraftJobMutation,
  useGetDeaftJobsQuery,
} from "@/redux/features/ai-chat/aiChatAPI";

export interface DraftJob {
  draft_id: number;
  user_id: number;
  session_id: string;
  saved_filters: Record<string, string>;
  Updated: string;
  last_updated: string;
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
function DeleteModal({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className='flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4'>
          <Trash2 className='text-red-500 w-6 h-6' />
        </div>

        {/* Text */}
        <h2 className='text-center text-lg font-bold text-gray-900 mb-2'>
          Delete Draft Job?
        </h2>
        <p className='text-center text-sm text-gray-500 mb-6'>
          This action cannot be undone. The draft will be permanently removed
          from your account.
        </p>

        {/* Actions */}
        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-all active:scale-95 cursor-pointer'
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  job,
  onDelete,
  onContinue,
}: {
  job: DraftJob;
  onDelete: (id: number) => void;
  onContinue: (id: number) => void;
}) {
  const title = job.saved_filters?.["Job type"] ?? "Untitled Draft";
  const description =
    job.saved_filters?.["Message"] ?? "No description provided.";

  return (
    <div className='rounded-lg border border-[#E7E8EA] bg-white py-8 px-5 shadow-sm transition-all hover:shadow-md'>
      <div className='mb-6 flex flex-col items-start justify-between'>
        <div className='rounded-lg mb-5'>
          <Image
            src={`/assets/draft.svg`}
            width={100}
            height={100}
            alt={title}
            className='w-full h-10 object-cover'
          />
        </div>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1'>
            <h3 className='font-bold text-xl text-[#000000] mb-2'>{title}</h3>
            <p className='text-sm text-[#404145]'>{description}</p>
          </div>
          <div className='whitespace-nowrap text-xs text-[#404145]'>
            {job.Updated}
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-3 sm:flex-nowrap'>
        <button
          onClick={() => onDelete(job.draft_id)}
          className='flex- w-auto rounded-lg border border-gray-300 px-4 py-2 font-medium text-[#000000] transition-all hover:bg-gray-50 active:scale-95 cursor-pointer'
        >
          Delete
        </button>
        <button
          onClick={() => onContinue(job.draft_id)}
          className='flex- w-auto rounded-lg bg-[#2563EB] px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 active:scale-95 cursor-pointer'
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DraftJobsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetDeaftJobsQuery({});
  const [deleteDraftJobMutation] = useDeleteDraftJobMutation();
  const draftJobs: DraftJob[] = data ?? [];

  console.log({ draftJobs, isError });

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setPendingDeleteId(id);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId !== null) {
      try {
        const res = await deleteDraftJobMutation(pendingDeleteId);
        console.log(res);
      } catch (error) {
        console.error("Error deleting draft job:", error);
      } finally {
        setPendingDeleteId(null);
      }
    }
  };

  const handleContinueJob = (id: number) => {
    router.push(`/dashboard/client/ai-chat?draft_id=${id}`);
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={pendingDeleteId !== null}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <div className='min-h-screen bg-linear-to-br from-gray-50 to-gray-100'>
        <div className='mx-auto container py-8'>
          {/* Header Section */}
          <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Draft Jobs</h1>
              <p className='mt-1 text-gray-600'>
                Continue working on your saved job postings
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/client/ai-chat")}
              className='bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
            >
              <Sparkles className='w-6 h-6 text-[#ffffff]' strokeWidth={1.2} />
              Create New Job
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className='col-span-full py-12 text-center text-gray-500'>
              Loading draft jobs...
            </div>
          )}

          {/* Error State */}
          {/* {isError && (
            <div className='col-span-full py-12 text-center text-red-500'>
              Failed to load draft jobs. Please try again.
            </div>
          )} */}

          {/* Jobs Grid */}
          {!isLoading && (
            <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
              {draftJobs.length > 0 ? (
                draftJobs.map((job) => (
                  <JobCard
                    key={job.draft_id}
                    job={job}
                    onDelete={handleDeleteClick}
                    onContinue={handleContinueJob}
                  />
                ))
              ) : (
                <div className='col-span-full py-12 text-center'>
                  <FileText className='mx-auto mb-3 text-gray-400' size={48} />
                  <p className='text-gray-500'>
                    No draft jobs yet. Create one to get started!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
