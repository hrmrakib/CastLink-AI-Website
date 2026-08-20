/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Euro,
  Users,
  Sparkles,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import activeJobsAPI, { useGetActiveJobsQuery } from "@/redux/features/active-jobs/activeJobsAPI";
import useDebounce from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useDeleteActiveJobMutation, useUpdateActiveJobMutation } from "@/redux/features/ai-chat/aiChatAPI";
import GlobalPagination from "@/components/pagination/GlobalPagination";
import Image from "next/image";
import { getImageUrl } from "@/lib/imagePath";

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
  job_photo?: string;
  casting_roles?: string[];
  currency?: string;
  ai_result?: {
    shot_date?: string[];
    [key: string]: any;
  };
}

function formatBudget(min: string, max: string): string {
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  if (minVal === maxVal) return `€${minVal.toLocaleString()}`;
  return `€${minVal.toLocaleString()}-€${maxVal.toLocaleString()}`;
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
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 900);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    location: "",
    shoot_dates: [] as string[],
    budget_range: "",
    currency: "R",
    casting_roles: [] as string[],
  });

  const [deleteActiveJobMutation, { isLoading: isDeleting }] =
    useDeleteActiveJobMutation();
  const [updateActiveJobMutation, { isLoading: isUpdating }] =
    useUpdateActiveJobMutation();
  
  const { data, isLoading, isFetching, refetch } = useGetActiveJobsQuery({
    page: currentPage,
    page_size: 10,
    search: debouncedSearch,
  });

  const activeJobs: Job[] = data?.data || [];
  const total_pages = data?.meta?.total_pages || 1;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > total_pages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  // Confirm permanent delete handler
  const handleConfirmDelete = async () => {
    if (selectedJobId) {
      try {
        await deleteActiveJobMutation(selectedJobId).unwrap();
        toast.success("Job permanently deleted.");
        refetch();
      } catch (error) {
        toast.error("Failed to delete job.");
      } finally {
        setIsModalOpen(false);
        setSelectedJobId(null);
      }
    }
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    let dates = job.ai_result?.shot_date || [];
    if (dates.length === 1 && dates[0].startsWith('[') && dates[0].endsWith(']')) {
      try {
        dates = JSON.parse(dates[0]);
      } catch (e) {}
    }

    setEditFormData({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      shoot_dates: dates, 
      budget_range: job.budget_max || job.budget_min || "",
      currency: job.currency || "R",
      casting_roles: job.casting_roles || [],
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      const cleanedDates = editFormData.shoot_dates.filter(Boolean);
      const body = {
        title: editFormData.title,
        description: editFormData.description,
        location: editFormData.location,
        shoot_dates: cleanedDates,
        budget_range: editFormData.budget_range,
      };

      const res = await updateActiveJobMutation({ job_id: editingJob.job_id, ...body }).unwrap();
      toast.success(res?.status_message || "Job updated successfully");
      setIsEditModalOpen(false);
      
      // Update the local cache without refetching so the skeleton doesn't show
      dispatch(
        activeJobsAPI.util.updateQueryData(
          'getActiveJobs',
          { page: currentPage, page_size: 10, search: debouncedSearch },
          (draft) => {
            const index = draft?.data?.findIndex((j: Job) => String(j.job_id) === String(editingJob.job_id));
            if (index !== -1 && draft?.data?.[index]) {
              draft.data[index].title = body.title;
              draft.data[index].description = body.description;
              draft.data[index].location = body.location;
              // Budget logic since there is only a single budget_range field edited now
              // If we need to distribute it we can, but let's just assign budget_min
              draft.data[index].budget_min = body.budget_range;
              draft.data[index].budget_max = body.budget_range;
              
              if (!draft.data[index].ai_result) {
                draft.data[index].ai_result = {};
              }
              draft.data[index].ai_result.shot_date = body.shoot_dates;
            }
          }
        )
      );

    } catch (error: any) {
      toast.error(error?.data?.status_message || "Failed to update job.");
    }
  };

  return (
    <main className='min-h-screen bg-transparent'>
      {/* Header */}
      <div className='bg-transparent'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            {/* Title Section */}
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Active Job</h1>
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
                    <div className='absolute top-4 right-4 flex gap-2'>
                      <button
                        onClick={() => openEditModal(job)}
                        className='p-1 rounded-md hover:bg-gray-100 transition'
                        title="Edit Job"
                      >
                        <Pencil className='w-5 h-5 text-[#6a6b72]' />
                      </button>
                      <button
                        onClick={() => openDeleteModal(job.job_id)}
                        className='p-1 rounded-md hover:bg-gray-100 transition'
                        title="Delete Job"
                      >
                        <Trash2 className='w-5 h-5 text-[#6a6b72]' />
                      </button>
                    </div>

                    {/* Title, Avatar and Description */}
                    <div className='flex items-start gap-4'>
                      <div>
                        <Image
                          src={job?.job_photo ? getImageUrl(job.job_photo) : "/job.jpg"}
                          alt={job.title || "job"}
                          width={80}
                          height={80}
                          className='w-15 h-15 rounded-full object-cover shrink-0 border-2 border-white shadow-sm'
                        />
                      </div>
                      <div>
                        <h3 className='text-lg font-bold text-[#000000] mb-2'>
                          {job.title}
                        </h3>
                        <p className='text-[#404145] text-sm mb-4 line-clamp-2'>
                          {job.description}
                        </p>
                      </div>
                    </div>

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
                        <Euro className='w-4 h-4 text-[#404145]' />
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
            <GlobalPagination
              currentPage={currentPage}
              totalPages={total_pages}
              onPageChange={handlePageChange}
            />
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
                disabled={isDeleting}
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedJobId(null);
                }}
                className='px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className='flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Permanently Delete{" "}
                {isDeleting && <Loader className='animate-spin' size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn overflow-y-auto'>
          <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 border border-gray-100 my-8 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>Edit Job</h3>
            <form onSubmit={handleEditSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
                <input
                  type='text'
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]'
                  required
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                  <input
                    type='text'
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                    required
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Shoot Dates</label>
                  {editFormData.shoot_dates.map((date, index) => (
                    <div key={index} className='flex items-center gap-2 mb-2'>
                      <input
                        type='date'
                        value={date}
                        onChange={(e) => {
                          const newDates = [...editFormData.shoot_dates];
                          newDates[index] = e.target.value;
                          setEditFormData({ ...editFormData, shoot_dates: newDates });
                        }}
                        className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          const newDates = editFormData.shoot_dates.filter((_, i) => i !== index);
                          setEditFormData({ ...editFormData, shoot_dates: newDates });
                        }}
                        className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition'
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={() => setEditFormData({ ...editFormData, shoot_dates: [...editFormData.shoot_dates, ""] })}
                    className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1'
                  >
                    <Plus size={16} /> Add Date
                  </button>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Budget Range</label>
                  <input
                    type='text'
                    value={editFormData.budget_range}
                    onChange={(e) => setEditFormData({ ...editFormData, budget_range: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                    required
                  />
                </div>
                {/* 
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Currency</label>
                  <input
                    type='text'
                    value={editFormData.currency}
                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                  />
                </div>

                */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Casting Roles</label>
                  {editFormData.casting_roles.map((role, index) => (
                    <div key={index} className='flex items-center gap-2 mb-2'>
                      <input
                        type='text'
                        value={role}
                        onChange={(e) => {
                          const newRoles = [...editFormData.casting_roles];
                          newRoles[index] = e.target.value;
                          setEditFormData({ ...editFormData, casting_roles: newRoles });
                        }}
                        placeholder={`Role ${index + 1}`}
                        className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          const newRoles = editFormData.casting_roles.filter((_, i) => i !== index);
                          setEditFormData({ ...editFormData, casting_roles: newRoles });
                        }}
                        className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition'
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={() => setEditFormData({ ...editFormData, casting_roles: [...editFormData.casting_roles, ""] })}
                    className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1'
                  >
                    <Plus size={16} /> Add Role
                  </button>
                </div>
                
              </div>

              <div className='flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => setIsEditModalOpen(false)}
                  className='px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isUpdating}
                  className='flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50'
                >
                  {isUpdating ? <Loader className='animate-spin' size={16} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
