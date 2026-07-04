/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useState, useRef } from "react";
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
import Image from "next/image";

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

  const prepareFormData = (file: File) => {
    const formData = new FormData();
    formData.append("job_id", String(job_id));
    formData.append("talent_id", String(talent?.talent_id));
    formData.append("files", file);
    return formData;
  };

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
    const link = `${meet_url}/channel/${job_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Casting link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg transition hover:bg-gray-50 dark:hover:bg-slate-900'>
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

      <div className='min-w-0 flex-1 w-full sm:w-auto'>
        <p className='font-semibold text-sm text-foreground truncate'>
          {talent.name}
        </p>
        <p className='text-xs text-muted-foreground capitalize'>
          {talent.role} · {talent.location}
        </p>
      </div>

      <div className='w-full sm:w-auto mt-2 sm:mt-0 text-left sm:text-right shrink-0 flex items-center sm:justify-end'>
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
          className={`px-2.5 py-2 rounded-full text-xs font-semibold w-fit ${
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
      <div className='min-w-0'>
        <p className='text-xs text-muted-foreground truncate'>{label}</p>
        <p className='text-sm font-bold text-foreground truncate'>{count}</p>
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError } = useGetActiveJobsQuery({
    page,
    page_size: limit,
  });

  const jobs: Job[] = data?.data ?? [];
  const totalPages = data?.meta?.total_pages ?? 1;

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

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

  const handleConfirmDelete = () => {
    if (selectedJobId) {
      console.log(`Permanently deleting job with ID: ${selectedJobId}`);
      // await deleteJob(selectedJobId).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedJobId(null);
    }
  };

  const aiResult = selectedJob?.ai_result as AiResult;

  const filteredTalents = aiResult?.suggested_talents?.map((talent: Talent) => {
    const tId = talent.talent_id;

    const polaMatch = aiResult.requested_polas.find(
      (p: Talent) => p.talent_id === tId,
    );
    if (polaMatch) return { ...polaMatch, source_type: "pola" };

    const ecastingMatch = aiResult.requested_ecastings.find(
      (e: Talent) => e.talent_id === tId,
    );
    if (ecastingMatch) return { ...ecastingMatch, source_type: "ecasting" };

    const selftapeMatch = aiResult.requested_selftapes.find(
      (s: Talent) => s.talent_id === tId,
    );
    if (selftapeMatch) return { ...selftapeMatch, source_type: "selftape" };

    return { ...talent, source_type: "suggestion" };
  });

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPage(page);
  };

  const job_id = selectedJob?.job_id;

  return (
    <div className='min-h-screen bg-white rounded-xl'>
      <div className='mx-auto container px-4 py-6 sm:py-8 sm:px-6 lg:px-8 w-full overflow-x-hidden'>
        {/* Header */}
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
            Active Jobs
          </h1>
          <p className='mt-1 text-sm sm:text-base text-muted-foreground'>
            Manage all active job postings and talent assignments
          </p>
        </div>

        {/* Error state */}
        {isError && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 px-4'>
            <p className='text-red-600 font-medium text-center'>
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
                      "Job Title",
                      "Suggested Talent",
                      "Role",
                      "Location",
                      "Budget",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className='px-6 py-4 text-left font-bold text-sm text-foreground whitespace-nowrap'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {jobs?.map((job) => {
                    const talent = primaryTalent(job);
                    return (
                      <tr
                        key={job.job_id}
                        className='hover:bg-secondary/30 transition'
                      >
                        <td className='px-6 py-4 flex items-center gap-1.5 text-sm font-medium text-foreground max-w-50 truncate'>
                          <Image
                            src={"/nike.png"}
                            alt={""}
                            width={36}
                            height={36}
                            className='mr-2 rounded-md shrink-0'
                          />
                          <span className='truncate'>{job.title}</span>
                        </td>
                        <td className='px-6 py-4'>
                          {talent ? (
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-8 w-8 shrink-0'>
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
                              <span className='text-sm text-foreground truncate'>
                                {talent.name}
                              </span>
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              —
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground'>
                          <div className='group relative Skinner flex items-center'>
                            <Info className='h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors shrink-0' />
                            <span className='whitespace-nowrap ml-2 text-sm truncate max-w-25'>
                              {job.casting_roles
                                ? job.casting_roles
                                    .split(" ")
                                    .slice(0, 2)
                                    .join(" ") + "..."
                                : ""}
                            </span>
                            <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-md border border-border z-10'>
                              {job.casting_roles}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground whitespace-nowrap'>
                          {job.location}
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground whitespace-nowrap'>
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
                        <td className='px-6 py-4 space-x-1.5 whitespace-nowrap'>
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
              {jobs?.map((job) => {
                const talent = primaryTalent(job);
                return (
                  <div
                    key={job.job_id}
                    className='rounded-lg border border-border bg-card p-4 flex flex-col'
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <h3 className='font-semibold text-foreground text-sm flex-1 mr-2 leading-snug'>
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
                        <Avatar className='h-6 w-6 shrink-0'>
                          <AvatarImage src={resolveMedia(talent.images?.[0])} />
                          <AvatarFallback>
                            {talent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='text-sm text-foreground line-clamp-1'>
                          {talent.name}
                        </span>
                      </div>
                    )}

                    <div className='mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1 whitespace-nowrap'>
                        <MapPin className='h-3 w-3 shrink-0' /> {job.location}
                      </span>
                      <span className='flex items-center gap-1 whitespace-nowrap'>
                        <DollarSign className='h-3 w-3 shrink-0' />
                        {formatBudget(job.budget_min, job.budget_max)}
                      </span>
                    </div>

                    <div className='mt-auto flex items-center gap-2'>
                      <Button
                        onClick={() => openJobDetail(job)}
                        className='flex-1 bg-[#2563EB] hover:bg-blue-700 h-9 text-xs sm:text-sm'
                      >
                        <Eye className='mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        View Details
                      </Button>
                      <Button
                        onClick={() => openDeleteModal(job.job_id)}
                        className='bg-transparent hover:bg-red-50 border border-[#2563EB] text-[#2563EB] hover:border-[#CD0000] hover:text-[#CD0000] shrink-0 px-3 h-9 transition-colors'
                      >
                        <Trash2 className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {jobs?.length === 0 && !isLoading && (
              <div className='flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12 px-4'>
                <p className='text-muted-foreground text-center'>
                  No jobs found
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className='px-4 sm:px-6 lg:px-8 pb-8'>
        <GlobalPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* ── Detail Modal ───────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='h-dvh md:h-[90vh] lg:max-h-[85vh] w-[95vw] md:w-full max-w-6xl border-0 bg-[#f0f2f5] dark:bg-slate-900 p-0 md:p-6 overflow-y-auto sm:rounded-xl'>
          {selectedJob && (
            <div className='p-4 sm:p-0'>
              <div className='flex flex-col lg:flex-row gap-4 sm:gap-5 items-stretch'>
                {/* ── Left Panel ── */}
                <div className='flex-1 bg-white dark:bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-xl flex flex-col gap-5 sm:gap-6'>
                  {/* Title & meta */}
                  <div className='flex items-start gap-3 sm:gap-4'>
                    <Image
                      src={"/nike.png"}
                      alt={`${selectedJob.title} logo`}
                      width={48}
                      height={48}
                      className='rounded-xl object-cover border bg-muted shrink-0 w-10 h-10 sm:w-12 sm:h-12'
                    />
                    <div className='flex-1 min-w-0'>
                      <span className='inline-block text-blue-600 font-semibold text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1'>
                        AI Matched · {capitalize(selectedJob.job_type)}
                      </span>
                      <h2 className='text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight line-clamp-2'>
                        {selectedJob.title}
                      </h2>
                      <div className='mt-2 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                          <MapPin className='h-3.5 w-3.5 shrink-0 text-muted-foreground/70' />
                          <span className='truncate max-w-30 sm:max-w-none'>
                            {selectedJob.location}
                          </span>
                        </span>
                        <span className='flex items-center gap-1.5 whitespace-nowrap'>
                          <Calendar className='h-3.5 w-3.5 shrink-0 text-muted-foreground/70' />
                          Posted {formatDate(selectedJob.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className='text-sm sm:text-base font-bold text-foreground mb-1'>
                      Description
                    </h3>
                    <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Budget */}
                  <div>
                    <h3 className='text-sm sm:text-base font-bold text-foreground mb-1'>
                      Budget
                    </h3>
                    <p className='text-base sm:text-lg font-semibold text-blue-600'>
                      {formatBudget(
                        selectedJob.budget_min,
                        selectedJob.budget_max,
                      )}
                    </p>
                  </div>

                  {/* Shoot dates */}
                  <div>
                    <h3 className='text-sm sm:text-base font-bold text-foreground mb-1'>
                      Shoot Date(s)
                    </h3>
                    {selectedJob?.ai_result.shoot_date?.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {selectedJob?.ai_result?.shoot_date?.map((d, i) => (
                          <Badge key={i} variant='outline' className='text-xs'>
                            {d}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        TBD
                      </p>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div>
                    <h3 className='text-sm sm:text-base font-bold text-foreground mb-3'>
                      Activity
                    </h3>
                    <div className='grid grid-cols-2 gap-2 sm:gap-3'>
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
                <div className='flex-1 flex flex-col gap-4 sm:gap-5'>
                  {/* Suggested Talents */}
                  {filteredTalents?.length > 0 && (
                    <div className='bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-xl'>
                      <h3 className='text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4'>
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
                    <div className='bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-xl border-t-4 border-t-amber-400'>
                      <h3 className='text-xs sm:text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider'>
                        Managing Agent
                      </h3>
                      <div className='flex items-center gap-3 sm:gap-4'>
                        <div className='w-10 h-10 sm:w-11 sm:h-11 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0'>
                          <span className='text-white font-bold text-base sm:text-lg'>
                            {selectedJob.ai_result.suggested_talents[0].agent_name.charAt(
                              0,
                            )}
                          </span>
                        </div>
                        <div className='min-w-0'>
                          <p className='font-bold text-sm sm:text-base text-foreground truncate'>
                            {
                              selectedJob.ai_result.suggested_talents[0]
                                .agent_name
                            }
                          </p>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            Agent
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── FIXED: Added Delete Confirmation Modal Layout ─────────────────── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='w-[90vw] max-w-md border-0 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg'>
          <DialogTitle className='sr-only'>Confirm Job Deletion</DialogTitle>
          <div className='flex flex-col items-center text-center gap-4 mt-2'>
            <div className='p-3 bg-red-50 dark:bg-red-950/30 rounded-full text-red-600 shrink-0'>
              <AlertTriangle className='h-6 w-6 sm:h-8 sm:w-8' />
            </div>
            <div>
              <h2 className='text-lg sm:text-xl font-bold text-foreground leading-tight'>
                Delete Job Posting?
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2'>
                Are you sure you want to permanently delete this job assignment?
                This action cannot be undone and will erase historical data
                associated with it.
              </p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-3 mt-6 justify-end w-full'>
            <Button
              variant='outline'
              onClick={() => setIsDeleteModalOpen(false)}
              className='w-full sm:flex-initial'
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className='bg-[#CD0000] hover:bg-red-700 text-white w-full sm:flex-initial'
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
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}
