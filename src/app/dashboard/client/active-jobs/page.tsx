"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetActiveJobsQuery } from "@/redux/features/active-jobs/activeJobsAPI";
import useDebounce from "@/hooks/useDebounce";

interface Job {
  job_id: string;
  job_created_by_id: number;
  session_id: string;
  title: string;
  description: string;
  location: string;
  budget_min: string;
  budget_max: string;
  job_type: string;
  applicants_count: number;
  shortlisted_count: number;
  selftapes_count: number;
  ecastings_count: number;
  polas_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function formatBudget(min: string, max: string): string {
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  if (minVal === maxVal) return `$${minVal.toLocaleString()}`;
  return `$${minVal.toLocaleString()}-$${maxVal.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getApplicantProgress(job: Job): number {
  const total =
    job.applicants_count +
    job.shortlisted_count +
    job.selftapes_count +
    job.ecastings_count;
  if (total === 0) return 0;
  const progress =
    ((job.shortlisted_count + job.selftapes_count) / Math.max(total, 1)) * 100;
  return Math.min(Math.round(progress), 100);
}

export default function Page() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 900);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetActiveJobsQuery({
    page: currentPage,
    limit: 10,
    search: debouncedSearch,
  });

  const activeJobs: Job[] = data?.data || [];
  const pagination: Pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_pages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  // Confirm permanent delete handler
  const handleConfirmDelete = () => {
    if (selectedJobId) {
      console.log(`Permanently deleting job with ID: ${selectedJobId}`);
      // TODO: Place your RTK Query delete mutation trigger here:
      // await deleteJob(selectedJobId).unwrap();

      setIsModalOpen(false);
      setSelectedJobId(null);
    }
  };

  return (
    <main className='min-h-screen bg-transparent'>
      {/* Header */}
      <div className='sticky top-0 z-40 bg-transparent'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            {/* Title Section */}
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>ActiveJob</h1>
              <p className='text-gray-600 text-sm md:text-base'>
                Manage your ongoing casting calls
              </p>
            </div>

            {/* Search and Button */}
            <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
              <div className='relative flex-1 sm:flex-none sm:w-64'>
                <Search className='absolute left-3 top-3 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search Jobs'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
                />
              </div>
              <button
                onClick={() => router.push("/dashboard/client/ai-chat")}
                className='bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
              >
                <Sparkles
                  className='w-6 h-6 text-[#ffffff]'
                  strokeWidth={1.2}
                />
                Create New Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className='container mx-auto px-4 py-8'>
        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='bg-white rounded-lg border border-gray-200 p-6 animate-pulse'
              >
                <div className='h-5 bg-gray-200 rounded w-3/4 mb-3' />
                <div className='h-4 bg-gray-100 rounded w-full mb-2' />
                <div className='h-4 bg-gray-100 rounded w-5/6 mb-4' />
                <div className='h-6 bg-gray-100 rounded w-20 mb-4' />
                <div className='space-y-2 mb-4'>
                  <div className='h-4 bg-gray-100 rounded w-1/2' />
                  <div className='h-4 bg-gray-100 rounded w-1/3' />
                  <div className='h-4 bg-gray-100 rounded w-2/5' />
                </div>
                <div className='h-2 bg-gray-200 rounded-full mb-6' />
                <div className='flex gap-2'>
                  <div className='flex-1 h-9 bg-gray-100 rounded-lg' />
                  <div className='flex-1 h-9 bg-gray-200 rounded-lg' />
                  <div className='flex-1 h-9 bg-gray-200 rounded-lg' />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Cards */}
        {!isLoading && !isFetching && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {activeJobs?.map((job) => {
                const progress = getApplicantProgress(job);
                const budget = formatBudget(job.budget_min, job.budget_max);
                const date = formatDate(job.created_at);

                return (
                  <div
                    key={job.job_id}
                    className='relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition'
                  >
                    <button
                      onClick={() => openDeleteModal(job.job_id)}
                      className='absolute top-4 right-4'
                    >
                      <Trash2 className='w-5 h-5 text-[#6a6b72]' />
                    </button>

                    {/* Title and Description */}
                    <h3 className='text-lg font-bold text-[#000000] mb-2'>
                      {job.title}
                    </h3>
                    <p className='text-[#404145] text-sm mb-4 line-clamp-2'>
                      {job.description}
                    </p>

                    {/* Status Badge */}
                    <div className='mb-4'>
                      <span className='inline-block bg-[#E7F8F2] text-[#009F91] px-3 py-1 rounded-full text-sm font-medium capitalize'>
                        {job.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className='space-y-3 mb-4 text-sm'>
                      <div className='flex items-center gap-2 text-[#404145]'>
                        <MapPin className='w-4 h-4 text-[#404145]' />
                        {job.location}
                      </div>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Calendar className='w-4 h-4 text-[#404145]' />
                        {date}
                      </div>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <DollarSign className='w-4 h-4 text-[#404145]' />
                        {budget}
                      </div>
                    </div>

                    {/* Applicant Stats */}
                    <div className='mb-4 pb-4 border-b border-gray-200'>
                      <div className='flex gap-4 text-sm'>
                        <div className='flex items-center gap-1'>
                          <Users className='w-4 h-4 text-[#404145]' />
                          <span className='text-gray-700'>
                            <strong>{job.applicants_count}</strong> Applicants
                          </span>
                        </div>
                        <span className='text-gray-700'>
                          <strong>{job.shortlisted_count}</strong> Shortlisted
                        </span>
                        <span className='text-gray-700'>
                          <strong>{job.selftapes_count}</strong> Self-tapes
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='mb-6'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-[#2563EB] h-2 rounded-full transition-all'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-2'>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/client/ai-chat/${job.session_id}`,
                          )
                        }
                        className='flex-1 bg-[#F6F7F9] border border-[#91979F] text-[#000000] hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition text-sm cursor-pointer'
                      >
                        View AI Result
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/client/active-jobs/e-casting-room/?job_id=${job.job_id}`,
                          )
                        }
                        className='flex-1 bg-[#2563EB] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm cursor-pointer'
                      >
                        E-Casting Room
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/client/active-jobs/${job.job_id}`,
                          )
                        }
                        className='flex-1 bg-[#1A46A7] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm cursor-pointer'
                      >
                        Selftapes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {activeJobs?.length === 0 && (
              <div className='text-center py-16'>
                <p className='text-gray-600 text-lg'>
                  No jobs found matching your search.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className='flex items-center justify-between mt-10'>
                <p className='text-sm text-gray-500'>
                  Showing{" "}
                  <strong>
                    {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}
                  </strong>{" "}
                  of <strong>{pagination.total}</strong> jobs
                </p>

                <div className='flex items-center gap-1'>
                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: pagination.total_pages },
                    (_, i) => i + 1,
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.total_pages ||
                        Math.abs(page - currentPage) <= 1,
                    )
                    .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                      if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className='px-2 text-gray-400 text-sm'
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                            currentPage === item
                              ? "bg-[#2563EB] text-white"
                              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.total_pages}
                    className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Warning Confirmation Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn'>
          <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 transform scale-100 transition-all'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-red-50 rounded-full text-red-600 shrink-0'>
                <AlertTriangle className='w-6 h-6' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 mb-1'>
                  Delete Permanent Card
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Are you sure you want to permanently delete this job post?
                  This action cannot be undone and all associated application
                  progress will be lost.
                </p>
              </div>
            </div>

            <div className='flex gap-3 justify-end mt-6'>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedJobId(null);
                }}
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
    </main>
  );
}
