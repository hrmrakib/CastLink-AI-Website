/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useState, useMemo, useRef } from "react";
import {
  Eye,
  Video,
  Camera,
  Film,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  ImageUp,
  CloudUpload,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetActiveJobsQuery } from "@/redux/features/active-jobs/activeJobsAPI";
import VideoUploadModal from "@/components/agent/modal/VideoUploadModal";
import { toast } from "sonner";
import {
  usePolasUploadMutation,
  useSelftapUploadMutation,
} from "@/redux/features/ai-chat/aiChatAPI";
import GlobalPagination from "@/components/pagination/GlobalPagination";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Talent {
  talent_id: number;
  agent_id: number;
  agent_name: string;
  name: string;
  role: string;
  date_of_birth?: string;
  gender: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  location: string;
  continent: string;
  country: string;
  is_active: boolean;
  available_dates: string[];
  images: string[];
  status?: string;
  tapes?: string[];
  polas?: string[];
  source_type?: string;
  job_id?: number;
}

interface AIResult {
  suggested_talents: Talent[];
  requested_selftapes: Talent[];
  requested_ecastings: Talent[];
  requested_polas: Talent[];
  shoot_date: string[];
}

interface Job {
  job_id: string;
  session_id: string;
  title: string;
  description: string;
  casting_roles?: string;
  location: string;
  budget_min: string;
  budget_max: string;
  job_type: string;
  applicants_count: number;
  shortlisted_count: number;
  selftapes_count: number;
  ecastings_count: number;
  polas_count: number;
  ai_result: AIResult;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

function resolveMedia(path: string) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path;
  console.log(`${BASE_URL}${path}`);
  return `${BASE_URL}${path}`;
}

function formatBudget(min: string, max: string) {
  const lo = parseFloat(min);
  const hi = parseFloat(max);
  if (lo === hi) return `$${lo.toFixed(0)}`;
  return `$${lo.toFixed(0)} – $${hi.toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TalentRow({ talent, job_id }: { talent: Talent; job_id: string }) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // RTK Query or Apollo mutations
  const [polasUploadMutation] = usePolasUploadMutation();
  const [selftapUploadMutation] = useSelftapUploadMutation();

  const handlePolaClick = () => imageInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  const meet_url = process.env.NEXT_PUBLIC_MEET_APP_URL;

  /**
   * Helper to construct FormData based on your API requirements:
   * job_id, talent_id, and files
   */

  const prepareFormData = (file: File) => {
    const formData = new FormData();
    // Ensure these keys match your backend exactly
    formData.append("job_id", String(job_id));
    formData.append("talent_id", String(talent?.talent_id));
    formData.append("files", file);
    return formData;
  };

  // Automatic Pola Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = prepareFormData(file);

      try {
        await toast.promise(polasUploadMutation(formData).unwrap(), {
          loading: `Uploading Pola for ${talent.name}...`,
          success: "Pola uploaded successfully!",
          error: (err) => err?.data?.status_message ?? "Failed to upload Pola.",
        });
      } catch (err: any) {
        console.error("Pola upload error:", err);
      }
    }
  };

  // Automatic Self-tape Upload
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = prepareFormData(file);

      try {
        await toast.promise(selftapUploadMutation(formData).unwrap(), {
          loading: `Uploading Self-tape for ${talent.name}...`,
          success: "Self-tape uploaded successfully!",
          error: (err) =>
            err?.data?.status_message ?? "Failed to upload Pola.++++++",
        });
      } catch (err) {
        console.error("Video upload error:", err);
      }
    }
  };

  const handleCopyLink = () => {
    // const link = `${window.location.origin}/casting/${talent.talent_id}`;
    const link = `${meet_url}/channel/${job_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Casting link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='flex items-center gap-3 p-3 rounded-lg transition hover:bg-gray-50 dark:hover:bg-slate-900'>
      <Avatar className='h-10 w-10 shrink-0 border border-gray-200'>
        <AvatarImage src={resolveMedia(talent.images?.[0])} />
        <AvatarFallback>
          {talent?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <p className='font-semibold text-sm text-foreground truncate'>
          {talent.name}
        </p>
        <p className='text-xs text-muted-foreground capitalize'>
          {talent.role} · {talent.location}
        </p>
      </div>

      <div className='text-right shrink-0'>
        {/* Hidden inputs for file selection */}
        <input
          type='file'
          ref={imageInputRef}
          className='hidden'
          accept='image/*'
          onChange={handleFileChange}
        />
        <input
          type='file'
          ref={videoInputRef}
          className='hidden'
          accept='video/*'
          onChange={handleVideoChange}
        />

        <div
          className={`px-2.5 py-2 rounded-full text-xs font-semibold ${
            talent.source_type === "ecasting"
              ? "bg-[#F4E8FF] text-[#7408D3]"
              : talent.source_type === "pola" ||
                  talent.source_type === "selftape"
                ? "bg-[#FDF8E9] text-[#D3A008]"
                : talent.source_type === "suggestion"
                  ? "bg-yellow-500 text-white"
                  : ""
          }`}
        >
          {talent.source_type === "pola" ? (
            <button
              onClick={handlePolaClick}
              className='flex items-center gap-1 hover:opacity-80'
            >
              Polas requested <ImageUp size={16} />
            </button>
          ) : talent.source_type === "ecasting" ? (
            <button
              onClick={handleCopyLink}
              className='flex items-center gap-1 hover:opacity-80'
            >
              E-casting requested{" "}
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          ) : talent.source_type === "selftape" ? (
            <button
              onClick={handleVideoClick}
              className='flex items-center gap-1 hover:opacity-80'
            >
              Self-tape requested <CloudUpload size={16} />
            </button>
          ) : (
            "Suggestion"
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <div className='flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2'>
      <Icon className='h-4 w-4 text-blue-500 shrink-0' />
      <div>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-sm font-bold text-foreground'>{count}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className='hidden md:block overflow-x-auto rounded-lg border border-border'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-border bg-secondary/50'>
            {[
              "Job Name",
              "Suggested Talent",
              "Location",
              "Budget",
              "Status",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className='px-6 py-4 text-left font-bold text-sm text-foreground'
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className='px-6 py-4'>
                <Skeleton className='h-4 w-40' />
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-8 w-8 rounded-full' />
                  <Skeleton className='h-4 w-28' />
                </div>
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-4 w-20' />
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-4 w-16' />
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-6 w-16 rounded-full' />
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-8 w-8 rounded-md' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className='grid gap-4 md:hidden'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='rounded-lg border border-border bg-card p-4 space-y-3'
        >
          <div className='flex justify-between'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-6 rounded-full' />
            <Skeleton className='h-4 w-28' />
          </div>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
      ))}
    </div>
  );
}

// filtering id babed talent

interface AiResult {
  suggested_talents: Talent[];
  requested_selftapes: any[];
  requested_ecastings: any[];
  requested_polas: any[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActiveJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError } = useGetActiveJobsQuery({
    page,
    page_size: limit,
  });

  // Safely extract jobs array from API response
  const jobs: Job[] = data?.data ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;

  // Derive unique locations for filter dropdown
  const locations = useMemo(() => {
    const set = new Set<string>(jobs.map((j) => j.location));
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const statusMatch = statusFilter === "all" || job.status === statusFilter;

      const locationMatch =
        locationFilter === "all" || job.location === locationFilter;

      const postedDate = new Date(job.created_at);
      const now = Date.now();
      const dateMatch =
        dateFilter === "all" ||
        (dateFilter === "30days" &&
          postedDate > new Date(now - 30 * 86400000)) ||
        (dateFilter === "60days" && postedDate > new Date(now - 60 * 86400000));

      return statusMatch && locationMatch && dateMatch;
    });
  }, [jobs, statusFilter, locationFilter, dateFilter]);

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Primary talent displayed in the table row
  function primaryTalent(job: Job) {
    return (
      job.ai_result.suggested_talents?.[0] ??
      job.ai_result.requested_selftapes?.[0] ??
      null
    );
  }

  const openDeleteModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsDeleteModalOpen(true);
  };

  // Confirm permanent delete handler
  const handleConfirmDelete = () => {
    if (selectedJobId) {
      console.log(`Permanently deleting job with ID: ${selectedJobId}`);
      // TODO: Place your RTK Query delete mutation trigger here:
      // await deleteJob(selectedJobId).unwrap();

      setIsDeleteModalOpen(false);
      setSelectedJobId(null);
    }
  };

  const aiResult = selectedJob?.ai_result as AiResult;

  const filteredTalents = aiResult?.suggested_talents?.map((talent: Talent) => {
    const tId = talent.talent_id;

    // 1. Check Polas (Highest Priority)
    const polaMatch = aiResult.requested_polas.find(
      (p: Talent) => p.talent_id === tId,
    );

    if (polaMatch) {
      return { ...polaMatch, source_type: "pola" };
    }

    // 2. Check E-Castings (Medium Priority)
    const ecastingMatch = aiResult.requested_ecastings.find(
      (e: Talent) => e.talent_id === tId,
    );

    if (ecastingMatch) {
      return { ...ecastingMatch, source_type: "ecasting" };
    }

    // 3. Check Selftapes (Lowest Priority)
    const selftapeMatch = aiResult.requested_selftapes.find(
      (s: Talent) => s.talent_id === tId,
    );

    if (selftapeMatch) {
      return { ...selftapeMatch, source_type: "selftape" };
    }

    // 4. Default: If no request exists, keep the original suggested talent info
    return { ...talent, source_type: "suggestion" };
  });

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPage(page);
  };

  const job_id = selectedJob?.job_id;

  return (
    <div className='min-h-screen bg-white rounded-xl'>
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>Active Jobs</h1>
          <p className='mt-1 text-muted-foreground'>
            Manage all active job postings and talent assignments
          </p>
        </div>

        {/* Filters */}
        {/* <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:gap-3'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Date' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='30days'>Last 30 Days</SelectItem>
              <SelectItem value='60days'>Last 60 Days</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* Error state */}
        {isError && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12'>
            <p className='text-red-600 font-medium'>
              Failed to load jobs. Please try again.
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <>
            <TableSkeleton />
            <CardSkeleton />
          </>
        )}

        {/* Desktop Table */}
        {!isLoading && !isError && (
          <>
            <div className='hidden overflow-x-auto rounded-lg border border-border md:block'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border bg-secondary/50'>
                    {[
                      "Job Name",
                      "Suggested Talent",
                      "Role",
                      "Location",
                      "Budget",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className='px-6 py-4 text-left font-bold text-sm text-foreground'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {filteredJobs.map((job) => {
                    const talent = primaryTalent(job);
                    return (
                      <tr
                        key={job.job_id}
                        className='hover:bg-secondary/30 transition'
                      >
                        <td className='px-6 py-4 text-sm font-medium text-foreground max-w-50 truncate'>
                          {job.title}
                        </td>
                        <td className='px-6 py-4'>
                          {talent ? (
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-8 w-8'>
                                <AvatarImage
                                  src={resolveMedia(talent.images?.[0])}
                                />
                                <AvatarFallback>
                                  {talent.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className='text-sm text-foreground'>
                                {talent.name}
                              </span>
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              —
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground flex items-center gap-2'>
                          {/* Tooltip Container */}
                          <div className='group relative Skinner flex items-center'>
                            <Info className='h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors' />
                            <span className='whitespace-nowrap ml-2 text-sm'>
                              {job.casting_roles
                                ? job.casting_roles
                                    .split(" ")
                                    .slice(0, 2)
                                    .join(" ") + "..."
                                : ""}
                            </span>
                            {/* Tooltip Card */}
                            <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitelist whitespace-nowrap shadow-md border border-border z-10'>
                              {job.casting_roles}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground'>
                          {job.location}
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground'>
                          {formatBudget(job.budget_min, job.budget_max)}
                        </td>
                        <td className='px-6 py-4'>
                          <Badge
                            className={
                              job.status === "active"
                                ? "bg-[#E9EFFD] border border-[#BBCFF9] text-[#2563EB]"
                                : job.status === "completed"
                                  ? "bg-green-100 border border-green-200 text-green-700"
                                  : "bg-amber-100 border border-amber-200 text-amber-700"
                            }
                          >
                            {capitalize(job.status)}
                          </Badge>
                        </td>
                        <td className='px-6 py-4 space-x-1.5'>
                          <Button
                            size='sm'
                            onClick={() => openJobDetail(job)}
                            className='bg-[#2563EB] hover:bg-blue-700'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => openDeleteModal(job.job_id)}
                            className='bg-transparent hover:bg-transparent border border-[#2563EB] text-[#2563EB] hover:border-[#CD0000] hover:text-[#CD0000] transition-colors'
                            // className='bg-[#CD0000] hover:bg-[#e20303]'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className='grid gap-4 md:hidden'>
              {filteredJobs.map((job) => {
                const talent = primaryTalent(job);
                return (
                  <div
                    key={job.job_id}
                    className='rounded-lg border border-border bg-card p-4'
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <h3 className='font-semibold text-foreground text-sm flex-1 mr-2'>
                        {job.title}
                      </h3>
                      <Badge
                        className={
                          job.status === "active"
                            ? "bg-[#E9EFFD] border border-[#BBCFF9] text-[#2563EB] shrink-0"
                            : "bg-amber-100 border border-amber-200 text-amber-700 shrink-0"
                        }
                      >
                        {capitalize(job.status)}
                      </Badge>
                    </div>

                    {talent && (
                      <div className='mb-2 flex items-center gap-2'>
                        <Avatar className='h-6 w-6'>
                          <AvatarImage src={resolveMedia(talent.images?.[0])} />
                          <AvatarFallback>
                            {talent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='text-sm text-foreground'>
                          {talent.name}
                        </span>
                      </div>
                    )}

                    <div className='mb-3 flex items-center gap-4 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' /> {job.location}
                      </span>
                      <span className='flex items-center gap-1'>
                        <DollarSign className='h-3 w-3' />
                        {formatBudget(job.budget_min, job.budget_max)}
                      </span>
                    </div>

                    <Button
                      onClick={() => openJobDetail(job)}
                      className='w-full bg-[#2563EB] hover:bg-blue-700'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      View Details
                    </Button>
                    <Button
                      onClick={() => openDeleteModal(job.job_id)}
                      className='w-full bg-[#2563EB] hover:bg-blue-700'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredJobs.length === 0 && !isLoading && (
              <div className='flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12'>
                <p className='text-muted-foreground'>No jobs found</p>
              </div>
            )}
          </>
        )}
      </div>

      <GlobalPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* ── Detail Modal ───────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='h-[90vh] lg:max-h-[85vh] max-w-6xl lg:min-w-5xl border-0 bg-[#f0f2f5] dark:bg-slate-900 p-6 overflow-y-auto'>
          {selectedJob && (
            <>
              <div className='flex flex-col lg:flex-row gap-5 items-stretch'>
                {/* ── Left Panel ── */}
                <div className='flex-1 bg-white dark:bg-slate-950 p-8 rounded-xl flex flex-col gap-6'>
                  {/* Title & meta */}
                  <div>
                    <span className='inline-block text-blue-600 font-semibold text-xs uppercase tracking-wider mb-2'>
                      AI Matched · {capitalize(selectedJob.job_type)}
                    </span>
                    <h2 className='text-2xl font-bold text-foreground leading-tight'>
                      {selectedJob.title}
                    </h2>
                    <div className='mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3.5 w-3.5' />{" "}
                        {selectedJob.location}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3.5 w-3.5' /> Posted{" "}
                        {formatDate(selectedJob.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-1'>
                      Description
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Budget */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-1'>
                      Budget
                    </h3>
                    <p className='text-lg font-semibold text-blue-600'>
                      {formatBudget(
                        selectedJob.budget_min,
                        selectedJob.budget_max,
                      )}
                    </p>
                  </div>

                  {/* Shoot dates */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-1'>
                      Shoot Date(s)
                    </h3>
                    {selectedJob?.ai_result.shoot_date?.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {selectedJob?.ai_result?.shoot_date?.map((d, i) => (
                          <Badge key={i} variant='outline'>
                            {d}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>TBD</p>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-3'>
                      Activity
                    </h3>
                    <div className='grid grid-cols-2 gap-3'>
                      <StatBadge
                        icon={Users}
                        label='Applicants'
                        count={selectedJob.applicants_count}
                      />
                      <StatBadge
                        icon={Users}
                        label='Shortlisted'
                        count={selectedJob.shortlisted_count}
                      />
                      <StatBadge
                        icon={Video}
                        label='Self-tapes'
                        count={selectedJob.selftapes_count}
                      />
                      <StatBadge
                        icon={Film}
                        label='E-castings'
                        count={selectedJob.ecastings_count}
                      />
                      <StatBadge
                        icon={Camera}
                        label='Polas'
                        count={selectedJob.polas_count}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Right Panel ── */}
                <div className='flex-1 flex flex-col gap-5'>
                  {/* Suggested Talents */}
                  {filteredTalents?.length > 0 && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl'>
                      <h3 className='text-base font-bold text-foreground mb-4'>
                        Affected Talents ({filteredTalents?.length})
                      </h3>
                      <div className='space-y-1.5'>
                        {filteredTalents?.map((t) => (
                          <TalentRow
                            key={`sug-${t.talent_id}`}
                            talent={t}
                            job_id={job_id as string}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent info */}
                  {selectedJob.ai_result.suggested_talents?.[0] && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl border-t-4 border-t-amber-400'>
                      <h3 className='text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider'>
                        Managing Agent
                      </h3>
                      <div className='flex items-center gap-4'>
                        <div className='w-11 h-11 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0'>
                          <span className='text-white font-bold text-lg'>
                            {selectedJob.ai_result.suggested_talents[0].agent_name.charAt(
                              0,
                            )}
                          </span>
                        </div>
                        <div>
                          <p className='font-bold text-foreground'>
                            {
                              selectedJob.ai_result.suggested_talents[0]
                                .agent_name
                            }
                          </p>
                          <p className='text-sm text-muted-foreground'>Agent</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── FIXED: Added Delete Confirmation Modal Layout ─────────────────── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='max-w-md border-0 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg'>
          <DialogTitle className='sr-only'>Confirm Job Deletion</DialogTitle>
          <div className='flex flex-col items-center text-center gap-4 mt-2'>
            <div className='p-3 bg-red-50 dark:bg-red-950/30 rounded-full text-red-600 shrink-0'>
              <AlertTriangle className='h-8 w-8' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-foreground leading-tight'>
                Delete Job Posting?
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed mt-2'>
                Are you sure you want to permanently delete this job assignment?
                This action cannot be undone and will historical data associated
                with it.
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3 mt-6 justify-end w-full'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteModalOpen(false)}
              className='flex-1 sm:flex-initial'
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className='bg-[#CD0000] hover:bg-red-700 text-white flex-1 sm:flex-initial'
            >
              Delete Posting
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VideoUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        jobId={selectedJob?.job_id}
        jobTitle={selectedJob?.title}
        onUploadComplete={(files) => {
          console.log("Uploaded files:", files);
          // TODO: call your API with the uploaded file references here
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}
